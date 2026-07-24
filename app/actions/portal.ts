"use server";

import db from '../../lib/db';
import { getMe } from './auth';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Helper to check user authentication and role
async function checkAuth(allowedRoles: string[]) {
  const session = await getMe();
  if (!session) {
    throw new Error('Unauthorized. Please log in.');
  }
  if (!allowedRoles.includes(session.role)) {
    throw new Error('Forbidden. You do not have permission.');
  }
  // If Mufti, check active status in DB
  if (session.role === 'MUFTI') {
    const mufti = await db.mufti.findUnique({
      where: { id: session.muftiId }
    });
    if (!mufti || mufti.status === 'INACTIVE') {
      throw new Error('Unauthorized. Your account is deactivated.');
    }
  }
  return session;
}

// Get Dashboard Stats
export async function getPortalStats() {
  await checkAuth(['SUPER_ADMIN', 'MUFTI']);

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalQuestions,
      pendingCount,
      answeredCount,
      holdCount,
      todayQuestionsCount,
      categoryStats,
      recentActivity
    ] = await Promise.all([
      db.question.count(),
      db.question.count({ where: { status: 'PENDING' } }),
      db.question.count({ where: { status: 'ANSWERED' } }),
      db.question.count({ where: { status: 'HOLD' } }),
      db.question.count({ where: { createdAt: { gte: today } } }),
      db.category.findMany({
        include: {
          _count: {
            select: { fatwas: true }
          }
        }
      }),
      db.activityLog.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            include: { muftiProfile: true }
          }
        }
      })
    ]);

    const formattedCategoryStats = categoryStats.map(cat => ({
      nameEn: cat.nameEn,
      nameUr: cat.nameUr,
      count: cat._count.fatwas
    }));

    return {
      success: true,
      data: {
        totalQuestions,
        pendingCount,
        answeredCount,
        holdCount,
        todayQuestionsCount,
        categoryStats: formattedCategoryStats,
        recentActivity
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get Questions by Status
export async function getQuestions(status: 'PENDING' | 'ANSWERED' | 'HOLD' | 'ALL') {
  await checkAuth(['SUPER_ADMIN', 'MUFTI']);

  try {
    const where: Prisma.QuestionWhereInput = {};
    if (status !== 'ALL') {
      where.status = status;
    }

    const questions = await db.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        fatwa: true
      }
    });

    return { success: true, data: questions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get Question Details
export async function getPortalQuestionDetails(id: string) {
  await checkAuth(['SUPER_ADMIN', 'MUFTI']);

  try {
    const question = await db.question.findUnique({
      where: { id },
      include: {
        fatwa: {
          include: {
            references: true
          }
        }
      }
    });

    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    return { success: true, data: question };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Put Question on Hold
export async function holdQuestion(questionId: string) {
  const session = await checkAuth(['SUPER_ADMIN', 'MUFTI']);

  try {
    const question = await db.question.update({
      where: { id: questionId },
      data: { status: 'HOLD' }
    });

    await db.activityLog.create({
      data: {
        userId: session.id,
        action: 'QUESTION_HOLD',
        details: `Question ${question.trackingNumber} put on hold by ${session.email}`
      }
    });

    return { success: true, data: question };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Generate New Fatwa Number
export async function generateFatwaNumber() {
  const islamicYear = 1447; // Current Islamic year as requested or dynamically configured
  
  // Find the highest fatwa number for the current year
  const lastFatwa = await db.fatwa.findFirst({
    where: {
      fatwaNumber: {
        startsWith: `${islamicYear}-`
      }
    },
    orderBy: {
      fatwaNumber: 'desc'
    }
  });

  let nextSequence = 1;
  if (lastFatwa) {
    const parts = lastFatwa.fatwaNumber.split('-');
    if (parts.length === 2) {
      const lastSeq = parseInt(parts[1], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  // Format sequence with padding: e.g. 1447-000002
  const paddedSeq = String(nextSequence).padStart(6, '0');
  return `${islamicYear}-${paddedSeq}`;
}

// Answer and Publish a Fatwa
export async function submitFatwaAnswer(data: {
  questionId: string;
  titleEn: string;
  titleUr: string;
  answerEn: string;
  answerUr: string;
  categoryId: string;
  subCategoryId: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INTERNAL' | 'DRAFT';
  references: Array<{ type: 'QURAN' | 'HADITH' | 'BOOK' | 'ARABIC' | 'URDU'; bookTitle: string; volume?: string; page?: string; text: string }>;
}) {
  const session = await checkAuth(['SUPER_ADMIN', 'MUFTI']);
  
  if (!session.muftiId) {
    return { success: false, error: 'Only accounts with a Mufti Profile can answer questions' };
  }

  try {
    // Generate Fatwa Number
    const fatwaNumber = await generateFatwaNumber();

    // Check if question exists and not already answered
    const question = await db.question.findUnique({
      where: { id: data.questionId }
    });

    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    // Create Fatwa
    const fatwa = await db.fatwa.create({
      data: {
        fatwaNumber,
        questionId: data.questionId,
        answeredById: session.muftiId,
        titleEn: data.titleEn,
        titleUr: data.titleUr,
        answerEn: data.answerEn,
        answerUr: data.answerUr,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        visibility: data.visibility,
        publishedAt: data.visibility === 'PUBLIC' ? new Date() : null,
        references: {
          create: data.references.map(ref => ({
            type: ref.type,
            bookTitle: ref.bookTitle,
            volume: ref.volume || null,
            page: ref.page || null,
            text: ref.text
          }))
        }
      }
    });

    // Update Question Status to ANSWERED
    await db.question.update({
      where: { id: data.questionId },
      data: { status: 'ANSWERED' }
    });

    await db.activityLog.create({
      data: {
        userId: session.id,
        action: 'FATWA_PUBLISH',
        details: `Fatwa #${fatwaNumber} published for tracking number ${question.trackingNumber} by Mufti ${session.muftiNameEn}`
      }
    });

    return { success: true, data: fatwa };
  } catch (error: any) {
    console.error('Submit Fatwa error:', error);
    return { success: false, error: error.message || 'Failed to submit Fatwa' };
  }
}

// Get All Categories (For Admin)
export async function getAdminCategories() {
  await checkAuth(['SUPER_ADMIN', 'MUFTI']);

  try {
    const categories = await db.category.findMany({
      include: {
        subCategories: true,
        _count: {
          select: { fatwas: true }
        }
      },
      orderBy: { nameEn: 'asc' }
    });

    return { success: true, data: categories };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Create Category (Super Admin Only)
export async function createCategory(nameEn: string, nameUr: string) {
  const session = await checkAuth(['SUPER_ADMIN']);

  try {
    const category = await db.category.create({
      data: { nameEn, nameUr }
    });

    await db.activityLog.create({
      data: {
        userId: session.id,
        action: 'CATEGORY_CREATE',
        details: `Category created: ${nameEn} / ${nameUr}`
      }
    });

    return { success: true, data: category };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Create Subcategory
export async function createSubCategory(categoryId: string, nameEn: string, nameUr: string) {
  const session = await checkAuth(['SUPER_ADMIN', 'MUFTI']);

  try {
    const subcategory = await db.subCategory.create({
      data: { categoryId, nameEn, nameUr }
    });

    await db.activityLog.create({
      data: {
        userId: session.id,
        action: 'SUBCATEGORY_CREATE',
        details: `Subcategory created under categoryId ${categoryId}: ${nameEn} / ${nameUr}`
      }
    });

    return { success: true, data: subcategory };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Toggle Category Active Status
export async function toggleCategoryStatus(id: string, isActive: boolean) {
  const session = await checkAuth(['SUPER_ADMIN']);

  try {
    const category = await db.category.update({
      where: { id },
      data: { isActive }
    });

    await db.activityLog.create({
      data: {
        userId: session.id,
        action: 'CATEGORY_TOGGLE',
        details: `Category ${category.nameEn} status toggled to: ${isActive}`
      }
    });

    return { success: true, data: category };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Merge Categories (Super Admin Only)
export async function mergeCategories(sourceId: string, targetId: string) {
  const session = await checkAuth(['SUPER_ADMIN']);

  if (sourceId === targetId) {
    return { success: false, error: 'Cannot merge a category into itself' };
  }

  try {
    // 1. Move all subcategories to the target category
    await db.subCategory.updateMany({
      where: { categoryId: sourceId },
      data: { categoryId: targetId }
    });

    // 2. Move all fatwas to the target category
    await db.fatwa.updateMany({
      where: { categoryId: sourceId },
      data: { categoryId: targetId }
    });

    // 3. Get source details for logging
    const sourceCat = await db.category.findUnique({ where: { id: sourceId } });
    const targetCat = await db.category.findUnique({ where: { id: targetId } });

    // 4. Delete source category
    await db.category.delete({ where: { id: sourceId } });

    await db.activityLog.create({
      data: {
        userId: session.id,
        action: 'CATEGORY_MERGE',
        details: `Merged Category '${sourceCat?.nameEn}' into '${targetCat?.nameEn}'`
      }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Create Mufti Profile (Super Admin Only)
export async function createMuftiProfile(data: {
  email: string;
  passwordHash: string;
  nameEn: string;
  nameUr: string;
  employeeId: string;
  designation: string;
  joiningDate: string;
  qualification: string;
  specialization: string;
  mobile: string;
}) {
  const session = await checkAuth(['SUPER_ADMIN']);

  try {
    // Hash password
    const hashed = await bcrypt.hash(data.passwordHash, 10);

    // Create user in transaction
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: hashed,
          role: 'MUFTI'
        }
      });

      const profile = await tx.mufti.create({
        data: {
          userId: user.id,
          nameEn: data.nameEn,
          nameUr: data.nameUr,
          employeeId: data.employeeId,
          designation: data.designation,
          joiningDate: new Date(data.joiningDate),
          status: 'ACTIVE',
          qualification: data.qualification,
          specialization: data.specialization,
          mobile: data.mobile
        }
      });

      return { user, profile };
    });

    await db.activityLog.create({
      data: {
        userId: session.id,
        action: 'MUFTI_CREATE',
        details: `Created Mufti Profile for ${data.nameEn} (ID: ${data.employeeId})`
      }
    });

    return { success: true, data: result.profile };
  } catch (error: any) {
    console.error('Create Mufti Profile error:', error);
    return { success: false, error: error.message || 'Failed to create Mufti Profile' };
  }
}

// Get Audit Logs (Super Admin Only)
export async function getAuditLogs() {
  await checkAuth(['SUPER_ADMIN']);

  try {
    const logs = await db.activityLog.findMany({
      include: {
        user: {
          include: { muftiProfile: true }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    return { success: true, data: logs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get Mufti Profiles list (Super Admin Only)
export async function getMuftiProfiles() {
  await checkAuth(['SUPER_ADMIN']);
  try {
    const muftis = await db.user.findMany({
      where: { role: 'MUFTI' },
      include: { muftiProfile: true },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: muftis };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Update Mufti Profile details and status (Super Admin Only)
export async function updateMuftiProfile(userId: string, data: {
  email: string;
  password?: string;
  nameEn: string;
  nameUr: string;
  employeeId: string;
  designation: string;
  joiningDate: string;
  qualification: string;
  specialization: string;
  mobile: string;
  status: string; // "ACTIVE" | "INACTIVE"
}) {
  const session = await checkAuth(['SUPER_ADMIN']);
  try {
    await db.$transaction(async (tx) => {
      // Update User email
      const userUpdateData: any = { email: data.email };
      if (data.password && data.password.trim() !== '') {
        userUpdateData.passwordHash = await bcrypt.hash(data.password, 10);
      }
      await tx.user.update({
        where: { id: userId },
        data: userUpdateData
      });

      // Update Mufti details
      await tx.mufti.update({
        where: { userId: userId },
        data: {
          nameEn: data.nameEn,
          nameUr: data.nameUr,
          employeeId: data.employeeId,
          designation: data.designation,
          joiningDate: new Date(data.joiningDate),
          status: data.status,
          qualification: data.qualification,
          specialization: data.specialization,
          mobile: data.mobile
        }
      });
    });

    await db.activityLog.create({
      data: {
        userId: session.id,
        action: 'MUFTI_UPDATE',
        details: `Updated Mufti Profile for ${data.nameEn} (ID: ${data.employeeId}, Status: ${data.status})`
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Update Mufti Profile error:', error);
    return { success: false, error: error.message || 'Failed to update Mufti Profile' };
  }
}

// Update global Hijri Date calibration offset (Admin only)
export async function updateGlobalHijriOffset(offset: number) {
  const session = await checkAuth(['SUPER_ADMIN']);
  
  try {
    const setting = await db.setting.upsert({
      where: { key: 'hijriOffset' },
      update: { value: offset.toString() },
      create: { key: 'hijriOffset', value: offset.toString() }
    });

    // Create Audit Log
    await db.activityLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE_SETTINGS',
        details: `Global Hijri offset updated to ${offset} by Super Admin ${session.email}`
      }
    });

    return { success: true, data: setting };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update Hijri offset' };
  }
}

// Translate Arabic text to Urdu and English (Admin only)
export async function translateArabicText(text: string) {
  await checkAuth(['SUPER_ADMIN']);
  if (!text || !text.trim()) {
    return { success: false, error: 'Text is empty' };
  }

  try {
    const encodedText = encodeURIComponent(text.trim());
    
    // Translate to Urdu
    const urRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=ur&dt=t&q=${encodedText}`);
    const urData = await urRes.json();
    const translationUr = urData?.[0]?.map((s: any) => s[0]).join('') || '';

    // Translate to English
    const enRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodedText}`);
    const enData = await enRes.json();
    const translationEn = enData?.[0]?.map((s: any) => s[0]).join('') || '';

    return {
      success: true,
      translationUr,
      translationEn
    };
  } catch (error: any) {
    console.error('Translation error:', error);
    return { success: false, error: error.message || 'Failed to translate' };
  }
}

// Create new Wazifa (Admin only)
export async function createWazifa(data: {
  title: string;
  arabicText: string;
  translationUr: string;
  translationEn: string;
  benefits: string;
  method: string;
  references?: string;
  category: string;
}) {
  const session = await checkAuth(['SUPER_ADMIN']);
  
  try {
    const wazifa = await db.wazifa.create({
      data: {
        title: data.title,
        arabicText: data.arabicText,
        translationUr: data.translationUr,
        translationEn: data.translationEn,
        benefits: data.benefits,
        method: data.method,
        references: data.references || null,
        category: data.category,
        publishDate: new Date()
      }
    });

    await db.activityLog.create({
      data: {
        userId: session.id,
        action: 'CREATE_WAZIFA',
        details: `Created Wazifa: "${data.title}" in category "${data.category}"`
      }
    });

    return { success: true, data: wazifa };
  } catch (error: any) {
    console.error('Create Wazifa error:', error);
    return { success: false, error: error.message || 'Failed to create Wazifa' };
  }
}

// Delete Wazifa (Admin only)
export async function deleteWazifa(id: string) {
  const session = await checkAuth(['SUPER_ADMIN']);
  
  try {
    const wazifa = await db.wazifa.delete({
      where: { id }
    });

    await db.activityLog.create({
      data: {
        userId: session.id,
        action: 'DELETE_WAZIFA',
        details: `Deleted Wazifa: "${wazifa.title}" (ID: ${id})`
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Delete Wazifa error:', error);
    return { success: false, error: error.message || 'Failed to delete Wazifa' };
  }
}

// Create new Book/Magazine (Admin only)
export async function createBook(data: {
  title: string;
  category: string;
  description?: string;
  type: string;
  coverBase64?: string;
  coverFileName?: string;
  pdfBase64?: string;
  pdfFileName?: string;
}) {
  const session = await checkAuth(['SUPER_ADMIN']);
  
  try {
    let coverUrl = null;
    let downloadUrl = null;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'books');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save Cover Image if provided
    if (data.coverBase64 && data.coverFileName) {
      const coverExtension = path.extname(data.coverFileName);
      const uniqueCoverName = `cover-${Date.now()}${coverExtension}`;
      const coverPath = path.join(uploadDir, uniqueCoverName);
      const base64Data = data.coverBase64.replace(/^data:.*?;base64,/, "");
      fs.writeFileSync(coverPath, base64Data, 'base64');
      coverUrl = `/uploads/books/${uniqueCoverName}`;
    }

    // Save PDF if provided
    if (data.pdfBase64 && data.pdfFileName) {
      const pdfExtension = path.extname(data.pdfFileName);
      const uniquePdfName = `pdf-${Date.now()}${pdfExtension}`;
      const pdfPath = path.join(uploadDir, uniquePdfName);
      const base64Data = data.pdfBase64.replace(/^data:.*?;base64,/, "");
      fs.writeFileSync(pdfPath, base64Data, 'base64');
      downloadUrl = `/uploads/books/${uniquePdfName}`;
    }

    const book = await db.book.create({
      data: {
        title: data.title,
        category: data.category,
        description: data.description || null,
        type: data.type,
        coverUrl,
        downloadUrl,
        publishedDate: new Date()
      }
    });

    await db.activityLog.create({
      data: {
        userId: session.id,
        action: 'CREATE_BOOK',
        details: `Uploaded Book/Magazine: "${data.title}" (Type: ${data.type})`
      }
    });

    return { success: true, data: book };
  } catch (error: any) {
    console.error('Create Book error:', error);
    return { success: false, error: error.message || 'Failed to create Book' };
  }
}

// Delete Book/Magazine (Admin only)
export async function deleteBook(id: string) {
  const session = await checkAuth(['SUPER_ADMIN']);
  
  try {
    const book = await db.book.delete({
      where: { id }
    });

    // Delete local files if they exist
    const uploadDir = path.join(process.cwd(), 'public');
    if (book.coverUrl) {
      const coverPath = path.join(uploadDir, book.coverUrl);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }
    if (book.downloadUrl) {
      const pdfPath = path.join(uploadDir, book.downloadUrl);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    await db.activityLog.create({
      data: {
        userId: session.id,
        action: 'DELETE_BOOK',
        details: `Deleted Book/Magazine: "${book.title}" (ID: ${id})`
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Delete Book error:', error);
    return { success: false, error: error.message || 'Failed to delete Book' };
  }
}
