"use server";
 
import db from '../../lib/db';
import { getMe } from './auth';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { headers } from 'next/headers';

// Helper to check user authentication and role
async function checkAuth(allowedRoles: string[]) {
  const session = await getMe();
  if (!session) {
    throw new Error('Unauthorized. Please log in.');
  }
  if (!allowedRoles.includes(session.role)) {
    throw new Error('Forbidden. You do not have permission.');
  }
  // If Mufti or Admin Mufti, check active status in DB
  if ((session.role === 'MUFTI' || session.role === 'ADMIN_MUFTI') && session.muftiId) {
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
  const session = await getMe();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Common query parameters
    const [
      totalQuestions,
      newQuestions,
      assignedQuestions,
      pendingReview,
      pendingTasdeeq,
      published,
      rejected,
      sentBackCount,
      totalMuftis,
      totalAdminMuftis,
      publishedToday
    ] = await Promise.all([
      db.question.count(),
      db.question.count({ where: { status: 'NEW' } }),
      db.question.count({ where: { status: 'ASSIGNED' } }),
      db.question.count({ where: { status: 'PENDING_REVIEW' } }),
      db.question.count({ where: { status: 'PENDING_TASDEEQ' } }),
      db.question.count({ where: { status: 'PUBLISHED' } }),
      db.question.count({ where: { status: 'REJECTED' } }),
      db.question.count({ where: { status: 'SENT_BACK' } }),
      db.user.count({ where: { role: 'MUFTI' } }),
      db.user.count({ where: { role: 'ADMIN_MUFTI' } }),
      db.question.count({
        where: {
          status: 'PUBLISHED',
          fatwa: {
            publishedAt: { gte: today }
          }
        }
      })
    ]);

    // Fetch categories and activity logs for Admins
    let categoryStatsFormatted: any[] = [];
    let recentActivity: any[] = [];

    if (session.role === 'SUPER_ADMIN' || session.role === 'ADMIN_MUFTI') {
      const [cats, logs] = await Promise.all([
        db.category.findMany({
          include: { _count: { select: { fatwas: true } } }
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

      categoryStatsFormatted = cats.map(cat => ({
        nameEn: cat.nameEn,
        nameUr: cat.nameUr,
        count: cat._count.fatwas
      }));
      recentActivity = logs;
    }

    // Role-specific metrics
    let roleStats = {};
    if (session.role === 'SUPER_ADMIN') {
      roleStats = {
        totalQuestions,
        pendingQuestions: newQuestions,
        assignedQuestions,
        pendingReview,
        pendingTasdeeq,
        published,
        rejected,
        totalMuftis,
        totalAdminMuftis
      };
    } else if (session.role === 'ADMIN_MUFTI') {
      roleStats = {
        newQuestions,
        assigned: assignedQuestions,
        pendingReview,
        pendingTasdeeq,
        publishedToday,
        sentBack: sentBackCount,
        rejected
      };
    } else if (session.role === 'MUFTI') {
      if (!session.muftiId) {
        return { success: false, error: 'Mufti profile not found.' };
      }

      const [
        myAssigned,
        myDrafts,
        mySubmitted,
        myPendingTasdeeqCount,
        myPublished
      ] = await Promise.all([
        db.question.count({ where: { status: 'ASSIGNED', assignedToId: session.muftiId } }),
        db.question.count({ where: { status: { in: ['SENT_BACK', 'IN_PROGRESS'] }, assignedToId: session.muftiId } }),
        db.question.count({ 
          where: { 
            status: { in: ['PENDING_REVIEW', 'APPROVED', 'PENDING_TASDEEQ', 'TASDEEQ_COMPLETED'] }, 
            fatwa: { answeredById: session.muftiId } 
          } 
        }),
        db.tasdeeqRecord.count({ where: { status: 'PENDING', muftiId: session.muftiId } }),
        db.question.count({ where: { status: 'PUBLISHED', fatwa: { answeredById: session.muftiId } } })
      ]);

      roleStats = {
        assignedQuestions: myAssigned,
        draftAnswers: myDrafts,
        submittedAnswers: mySubmitted,
        pendingTasdeeq: myPendingTasdeeqCount,
        publishedFatwas: myPublished
      };
    }

    return {
      success: true,
      role: session.role,
      stats: roleStats,
      categoryStats: categoryStatsFormatted,
      recentActivity
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get Questions by Status
export async function getQuestions(status: string) {
  const session = await checkAuth(['SUPER_ADMIN', 'MUFTI', 'ADMIN_MUFTI']);

  try {
    const where: Prisma.QuestionWhereInput = {};
    if (status !== 'ALL') {
      where.status = status;
    }

    if (session.role === 'MUFTI') {
      where.OR = [
        { assignedToId: session.muftiId },
        { fatwa: { answeredById: session.muftiId } },
        { fatwa: { tasdeeqRecords: { some: { muftiId: session.muftiId } } } }
      ];
    }

    const questions = await db.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        fatwa: {
          include: {
            answeredBy: true,
            reviewedBy: true,
            tasdeeqRecords: {
              include: {
                mufti: true
              }
            }
          }
        },
        assignedTo: true
      }
    });

    return { success: true, data: questions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get Question Details
export async function getPortalQuestionDetails(id: string) {
  const session = await checkAuth(['SUPER_ADMIN', 'MUFTI', 'ADMIN_MUFTI']);

  try {
    const question = await db.question.findUnique({
      where: { id },
      include: {
        fatwa: {
          include: {
            references: true,
            answeredBy: true,
            reviewedBy: true,
            tasdeeqRecords: {
              include: {
                mufti: true
              }
            }
          }
        },
        assignedTo: true
      }
    });

    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    if (session.role === 'MUFTI') {
      const hasAccess = question.assignedToId === session.muftiId ||
                        question.fatwa?.answeredById === session.muftiId ||
                        question.fatwa?.tasdeeqRecords?.some(r => r.muftiId === session.muftiId);
      if (!hasAccess) {
        return { success: false, error: 'Forbidden. You do not have permission to view this question.' };
      }
    }

    return { success: true, data: question };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Put Question on Hold
export async function holdQuestion(questionId: string) {
  const session = await checkAuth(['SUPER_ADMIN', 'ADMIN_MUFTI', 'MUFTI']);

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

// Answer a Question (Submits to Review queue, does not publish immediately)
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
  const session = await checkAuth(['SUPER_ADMIN', 'MUFTI', 'ADMIN_MUFTI']);
  
  if (!session.muftiId) {
    return { success: false, error: 'Only accounts with a Mufti Profile can answer questions' };
  }

  try {
    // Check if question exists
    const question = await db.question.findUnique({
      where: { id: data.questionId },
      include: { fatwa: true }
    });

    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    // Check if the Mufti is assigned to this question (unless they are SUPER_ADMIN or ADMIN_MUFTI)
    if (session.role === 'MUFTI' && question.assignedToId !== session.muftiId) {
      return { success: false, error: 'You are not assigned to answer this question.' };
    }

    // Check if Mufti is trying to edit after submission when NOT sent back/assigned
    if (session.role === 'MUFTI' && question.status !== 'ASSIGNED' && question.status !== 'SENT_BACK' && question.status !== 'IN_PROGRESS' && question.status !== 'NEW') {
      return { success: false, error: 'You cannot edit this answer after submission unless it is sent back for correction.' };
    }

    let fatwa;
    if (question.fatwa) {
      // Update existing fatwa (e.g. resubmission after Sent Back)
      // Delete old references first
      await db.reference.deleteMany({
        where: { fatwaId: question.fatwa.id }
      });

      fatwa = await db.fatwa.update({
        where: { id: question.fatwa.id },
        data: {
          titleEn: data.titleEn,
          titleUr: data.titleUr,
          answerEn: data.answerEn,
          answerUr: data.answerUr,
          categoryId: data.categoryId,
          subCategoryId: data.subCategoryId,
          visibility: 'PRIVATE', // remain private during review
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
    } else {
      // Create new fatwa
      const fatwaNumber = await generateFatwaNumber();
      fatwa = await db.fatwa.create({
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
          visibility: 'PRIVATE', // remain private during review
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
    }

    // Update Question Status to PENDING_REVIEW
    await db.question.update({
      where: { id: data.questionId },
      data: { status: 'PENDING_REVIEW' }
    });

    // Create Notification for Admin Mufti and Super Admin
    await createNotificationForAdmins(
      'Answer Submitted',
      `Mufti ${session.muftiNameEn} submitted an answer for question tracking number ${question.trackingNumber}`,
      'SUBMITTED'
    );

    // Create Activity Log
    await createActivityLogWithDetails(
      session.id,
      'ANSWER_SUBMIT',
      `Mufti ${session.muftiNameEn} submitted answer for question: ${question.trackingNumber}`
    );

    return { success: true, data: fatwa };
  } catch (error: any) {
    console.error('Submit Fatwa error:', error);
    return { success: false, error: error.message || 'Failed to submit Fatwa' };
  }
}

// Get All Categories (For Admin)
export async function getAdminCategories() {
  await checkAuth(['SUPER_ADMIN', 'ADMIN_MUFTI', 'MUFTI']);

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
  const session = await checkAuth(['SUPER_ADMIN', 'ADMIN_MUFTI', 'MUFTI']);

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
  role?: string; // 'MUFTI' | 'ADMIN_MUFTI'
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
          role: data.role || 'MUFTI'
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

// Get Mufti Profiles list (Super Admin & Admin Mufti)
export async function getMuftiProfiles() {
  await checkAuth(['SUPER_ADMIN', 'ADMIN_MUFTI']);
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
  role?: string; // "MUFTI" | "ADMIN_MUFTI"
}) {
  const session = await checkAuth(['SUPER_ADMIN']);
  try {
    await db.$transaction(async (tx) => {
      // Update User email and role
      const userUpdateData: any = { email: data.email };
      if (data.password && data.password.trim() !== '') {
        userUpdateData.passwordHash = await bcrypt.hash(data.password, 10);
      }
      if (data.role) {
        userUpdateData.role = data.role;
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
  downloadUrl?: string;
}) {
  const session = await checkAuth(['SUPER_ADMIN']);
  
  try {
    let coverUrl = null;
    let downloadUrl = data.downloadUrl || null;

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

// Update an existing Wazifa (Admin only)
export async function updateWazifa(id: string, data: {
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
    const updated = await db.wazifa.update({
      where: { id },
      data: {
        title: data.title,
        arabicText: data.arabicText,
        translationUr: data.translationUr,
        translationEn: data.translationEn,
        benefits: data.benefits,
        method: data.method,
        references: data.references || null,
        category: data.category
      }
    });

    await db.activityLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE_WAZIFA',
        details: `Updated Wazifa: "${data.title}" (ID: ${id})`
      }
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Update Wazifa error:', error);
    return { success: false, error: error.message || 'Failed to update Wazifa' };
  }
}

// Update an existing Book (Admin only)
export async function updateBook(id: string, data: {
  title: string;
  category: string;
  description?: string;
  type: string;
  coverBase64?: string;
  coverFileName?: string;
  downloadUrl?: string;
}) {
  const session = await checkAuth(['SUPER_ADMIN']);
  try {
    const book = await db.book.findUnique({ where: { id } });
    if (!book) throw new Error("Book not found");

    let coverUrl = book.coverUrl;

    // If new cover image is provided, upload and delete old one
    if (data.coverBase64 && data.coverFileName) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'books');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Delete old cover
      if (book.coverUrl) {
        const oldCoverPath = path.join(process.cwd(), 'public', book.coverUrl);
        if (fs.existsSync(oldCoverPath)) {
          fs.unlinkSync(oldCoverPath);
        }
      }

      const coverExtension = path.extname(data.coverFileName);
      const uniqueCoverName = `cover-${Date.now()}${coverExtension}`;
      const coverPath = path.join(uploadDir, uniqueCoverName);
      const base64Data = data.coverBase64.replace(/^data:.*?;base64,/, "");
      fs.writeFileSync(coverPath, base64Data, 'base64');
      coverUrl = `/uploads/books/${uniqueCoverName}`;
    }

    const updated = await db.book.update({
      where: { id },
      data: {
        title: data.title,
        category: data.category,
        description: data.description || null,
        type: data.type,
        coverUrl,
        downloadUrl: data.downloadUrl || null
      }
    });

    await db.activityLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE_BOOK',
        details: `Updated Book/Magazine: "${data.title}" (ID: ${id})`
      }
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Update Book error:', error);
    return { success: false, error: error.message || 'Failed to update Book' };
  }
}

// ----------------------------------------------------
// WORKFLOW REDESIGN & ROLE MANAGEMENT SERVER ACTIONS
// ----------------------------------------------------

async function getHijriDateStringBackend(date: Date) {
  try {
    const offsetSetting = await db.setting.findUnique({
      where: { key: 'hijriOffset' }
    });
    const offset = offsetSetting ? parseInt(offsetSetting.value, 10) || 0 : 0;
    
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(d);
  } catch (e) {
    return '';
  }
}

async function createActivityLogWithDetails(userId: string, action: string, details: string) {
  try {
    const reqHeaders = headers();
    const ipAddress = reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip') || '127.0.0.1';
    
    const now = new Date();
    const hijriDate = await getHijriDateStringBackend(now);
    
    await db.activityLog.create({
      data: {
        userId,
        action,
        details,
        timestamp: now,
        hijriDate,
        ipAddress
      }
    });
  } catch (e) {
    console.error('Error logging activity:', e);
  }
}

async function createNotificationForAdmins(title: string, message: string, type: string) {
  try {
    const adminUsers = await db.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'ADMIN_MUFTI'] }
      }
    });
    
    await Promise.all(
      adminUsers.map(user => 
        db.notification.create({
          data: {
            userId: user.id,
            title,
            message,
            type
          }
        })
      )
    );
  } catch (e) {
    console.error('Error creating notifications:', e);
  }
}

async function createNotificationForUser(userId: string, title: string, message: string, type: string) {
  try {
    await db.notification.create({
      data: {
        userId,
        title,
        message,
        type
      }
    });
  } catch (e) {
    console.error('Error creating user notification:', e);
  }
}

// Assign Question to a Mufti (Admin / Super Admin only)
export async function assignQuestion(questionId: string, muftiId: string) {
  const session = await checkAuth(['SUPER_ADMIN', 'ADMIN_MUFTI']);
  try {
    const question = await db.question.findUnique({ where: { id: questionId } });
    if (!question) throw new Error("Question not found");

    const mufti = await db.mufti.findUnique({ 
      where: { id: muftiId },
      include: { user: true }
    });
    if (!mufti) throw new Error("Mufti not found");

    const updatedQuestion = await db.question.update({
      where: { id: questionId },
      data: {
        status: 'ASSIGNED',
        assignedToId: muftiId
      }
    });

    await createNotificationForUser(
      mufti.userId,
      'Question Assigned',
      `You have been assigned to answer question tracking number: ${question.trackingNumber}`,
      'ASSIGNED'
    );

    await createActivityLogWithDetails(
      session.id,
      'QUESTION_ASSIGN',
      `Question ${question.trackingNumber} assigned to Mufti ${mufti.nameEn} by ${session.email}`
    );

    return { success: true, data: updatedQuestion };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Review Submitted Fatwa Draft (Admin / Super Admin only)
export async function reviewFatwa(fatwaId: string, action: 'APPROVED' | 'REJECTED' | 'SENT_BACK', remarks?: string) {
  const session = await checkAuth(['SUPER_ADMIN', 'ADMIN_MUFTI']);
  try {
    const fatwa = await db.fatwa.findUnique({
      where: { id: fatwaId },
      include: { question: true, answeredBy: true }
    });
    if (!fatwa) throw new Error("Fatwa not found");

    let newStatus = 'PENDING_REVIEW';
    if (action === 'APPROVED') {
      newStatus = 'APPROVED';
    } else if (action === 'REJECTED') {
      newStatus = 'REJECTED';
    } else if (action === 'SENT_BACK') {
      newStatus = 'SENT_BACK';
    }

    await db.fatwa.update({
      where: { id: fatwaId },
      data: {
        reviewedById: session.muftiId || null
      }
    });

    await db.question.update({
      where: { id: fatwa.questionId },
      data: { status: newStatus }
    });

    await createNotificationForUser(
      fatwa.answeredBy.userId,
      `Answer ${action.replace('_', ' ')}`,
      `Your submitted answer for question ${fatwa.question.trackingNumber} has been ${action.toLowerCase()}. Remarks: ${remarks || 'None'}`,
      action
    );

    await createActivityLogWithDetails(
      session.id,
      `FATWA_REVIEW_${action}`,
      `Fatwa #${fatwa.fatwaNumber} was ${action.toLowerCase()} by ${session.email}. Remarks: ${remarks || ''}`
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Request Tasdeeq verification from other Muftis (Admin / Super Admin only)
export async function requestTasdeeq(fatwaId: string, muftiIds: string[]) {
  const session = await checkAuth(['SUPER_ADMIN', 'ADMIN_MUFTI']);
  try {
    const fatwa = await db.fatwa.findUnique({
      where: { id: fatwaId },
      include: { question: true }
    });
    if (!fatwa) throw new Error("Fatwa not found");

    await Promise.all(
      muftiIds.map(async (muftiId) => {
        const existing = await db.tasdeeqRecord.findUnique({
          where: {
            fatwaId_muftiId: { fatwaId, muftiId }
          }
        });
        if (!existing) {
          await db.tasdeeqRecord.create({
            data: {
              fatwaId,
              muftiId,
              status: 'PENDING'
            }
          });

          const mufti = await db.mufti.findUnique({ where: { id: muftiId } });
          if (mufti) {
            await createNotificationForUser(
              mufti.userId,
              'Tasdeeq Requested',
              `Verification (Tasdeeq) requested for Fatwa #${fatwa.fatwaNumber}`,
              'TASDEEQ_REQUESTED'
            );
          }
        }
      })
    );

    await db.question.update({
      where: { id: fatwa.questionId },
      data: { status: 'PENDING_TASDEEQ' }
    });

    await createActivityLogWithDetails(
      session.id,
      'TASDEEQ_REQUEST',
      `Tasdeeq verification requested for Fatwa #${fatwa.fatwaNumber}`
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Submit Tasdeeq feedback (Mufti / Admin / Super Admin)
export async function submitTasdeeqFeedback(fatwaId: string, status: 'VERIFIED' | 'REJECTED', remarks?: string) {
  const session = await checkAuth(['SUPER_ADMIN', 'MUFTI', 'ADMIN_MUFTI']);
  if (!session.muftiId) {
    return { success: false, error: 'Only accounts with a Mufti Profile can submit Tasdeeq' };
  }

  try {
    const fatwa = await db.fatwa.findUnique({
      where: { id: fatwaId },
      include: { question: true, answeredBy: true }
    });
    if (!fatwa) throw new Error("Fatwa not found");

    const record = await db.tasdeeqRecord.findUnique({
      where: {
        fatwaId_muftiId: { fatwaId, muftiId: session.muftiId }
      }
    });
    if (!record) throw new Error("No pending Tasdeeq request found for your profile.");

    const now = new Date();
    const hijriDate = await getHijriDateStringBackend(now);

    await db.tasdeeqRecord.update({
      where: { id: record.id },
      data: {
        status,
        remarks: remarks || null,
        verifiedAt: now,
        verifiedHijri: hijriDate
      }
    });

    await createNotificationForAdmins(
      'Tasdeeq Submitted',
      `Mufti ${session.muftiNameEn} submitted verification status [${status}] for Fatwa #${fatwa.fatwaNumber}`,
      'TASDEEQ_COMPLETED'
    );

    await createActivityLogWithDetails(
      session.id,
      `TASDEEQ_SUBMIT_${status}`,
      `Mufti ${session.muftiNameEn} verified Fatwa #${fatwa.fatwaNumber} with status: ${status}`
    );

    const pendingRecords = await db.tasdeeqRecord.count({
      where: { fatwaId, status: 'PENDING' }
    });

    if (pendingRecords === 0) {
      await db.question.update({
        where: { id: fatwa.questionId },
        data: { status: 'TASDEEQ_COMPLETED' }
      });
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Publish Fatwa (Admin / Super Admin only)
export async function publishFatwa(fatwaId: string) {
  const session = await checkAuth(['SUPER_ADMIN', 'ADMIN_MUFTI']);
  try {
    const fatwa = await db.fatwa.findUnique({
      where: { id: fatwaId },
      include: { question: true, answeredBy: true }
    });
    if (!fatwa) throw new Error("Fatwa not found");

    if (!['APPROVED', 'PENDING_TASDEEQ', 'TASDEEQ_COMPLETED'].includes(fatwa.question.status)) {
      throw new Error("Cannot publish. Answer must be reviewed and approved by Admin Mufti first.");
    }

    const ruleSetting = await db.setting.findUnique({
      where: { key: 'tasdeeq_publish_rule' }
    });
    const rule = ruleSetting ? ruleSetting.value : 'FIRST_VERIFIED';

    const totalRequested = await db.tasdeeqRecord.count({ where: { fatwaId } });
    const verifiedCount = await db.tasdeeqRecord.count({ where: { fatwaId, status: 'VERIFIED' } });

    if (totalRequested > 0) {
      if (rule === 'ALL_VERIFIED' && verifiedCount < totalRequested) {
        throw new Error(`Cannot publish. Rules require all assigned Tasdeeq Muftis to verify (${verifiedCount}/${totalRequested} verified).`);
      }
      if (rule === 'FIRST_VERIFIED' && verifiedCount < 1) {
        throw new Error("Cannot publish. Rules require at least one Tasdeeq Mufti verification.");
      }
    }

    const updatedFatwa = await db.fatwa.update({
      where: { id: fatwaId },
      data: {
        visibility: 'PUBLIC',
        publishedAt: new Date()
      }
    });

    await db.question.update({
      where: { id: fatwa.questionId },
      data: { status: 'PUBLISHED' }
    });

    await createNotificationForUser(
      fatwa.answeredBy.userId,
      'Fatwa Published',
      `Your answered Fatwa #${fatwa.fatwaNumber} is now live and published!`,
      'PUBLISHED'
    );

    await createActivityLogWithDetails(
      session.id,
      'FATWA_PUBLISH',
      `Fatwa #${fatwa.fatwaNumber} was published live by ${session.email}`
    );

    return { success: true, data: updatedFatwa };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get User in-app notifications
export async function getPortalNotifications() {
  const session = await getMe();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const notifications = await db.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return { success: true, data: notifications };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Mark in-app notification as read
export async function markNotificationAsRead(id: string) {
  const session = await getMe();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await db.notification.updateMany({
      where: { id, userId: session.id },
      data: { read: true }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// System settings managers
export async function updateSystemSettings(key: string, value: string) {
  const session = await checkAuth(['SUPER_ADMIN', 'ADMIN_MUFTI']);
  try {
    const setting = await db.setting.upsert({
      where: { key },
      update: { value, updatedAt: new Date() },
      create: { key, value }
    });

    await createActivityLogWithDetails(
      session.id,
      'SETTING_UPDATE',
      `System setting key "${key}" updated to "${value}" by ${session.email}`
    );

    return { success: true, data: setting };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSystemSetting(key: string) {
  try {
    const setting = await db.setting.findUnique({ where: { key } });
    return { success: true, value: setting ? setting.value : null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
