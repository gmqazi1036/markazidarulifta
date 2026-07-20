"use server";

import db from '../../lib/db';
import { Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Search Fatwas
export async function searchFatwas(filters: {
  keyword?: string;
  fatwaNumber?: string;
  categoryId?: string;
  subCategoryId?: string;
  sortBy?: 'date' | 'views' | 'popularity';
}) {
  try {
    const whereClause: Prisma.FatwaWhereInput = {
      visibility: 'PUBLIC'
    };

    if (filters.fatwaNumber) {
      whereClause.fatwaNumber = {
        contains: filters.fatwaNumber
      };
    }

    if (filters.categoryId && filters.categoryId !== 'all') {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters.subCategoryId && filters.subCategoryId !== 'all') {
      whereClause.subCategoryId = filters.subCategoryId;
    }

    if (filters.keyword) {
      const keyword = filters.keyword.trim();
      whereClause.OR = [
        { titleEn: { contains: keyword } },
        { titleUr: { contains: keyword } },
        { answerEn: { contains: keyword } },
        { answerUr: { contains: keyword } },
        {
          references: {
            some: {
              OR: [
                { bookTitle: { contains: keyword } },
                { text: { contains: keyword } }
              ]
            }
          }
        }
      ];
    }

    let orderBy: Prisma.FatwaOrderByWithRelationInput = { createdAt: 'desc' };
    if (filters.sortBy === 'views' || filters.sortBy === 'popularity') {
      orderBy = { views: 'desc' };
    }

    const fatwas = await db.fatwa.findMany({
      where: whereClause,
      include: {
        category: true,
        subCategory: true,
        answeredBy: true,
        references: true,
        question: true
      },
      orderBy
    });

    return { success: true, data: fatwas };
  } catch (error: any) {
    console.error('Search Fatwas error:', error);
    return { success: false, error: error.message || 'Failed to search Fatwas' };
  }
}

// Get Fatwa by ID (and increment view count)
export async function getFatwaDetails(id: string) {
  try {
    const fatwa = await db.fatwa.findUnique({
      where: { id },
      include: {
        category: true,
        subCategory: true,
        answeredBy: true,
        references: true,
        question: true
      }
    });

    if (fatwa && fatwa.visibility === 'PUBLIC') {
      // Increment views asynchronously
      await db.fatwa.update({
        where: { id },
        data: { views: { increment: 1 } }
      });
    }

    return { success: true, data: fatwa };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Ask a new Question
export async function askQuestion(data: {
  name: string;
  phone: string;
  email?: string;
  city: string;
  questionText: string;
  fileName?: string;
  fileBase64?: string;
}) {
  try {
    if (!data.name || !data.phone || !data.city || !data.questionText) {
      return { success: false, error: 'Required fields are missing' };
    }

    // Generate unique tracking number (e.g. MDI-2026-7382)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingNumber = `MDI-${new Date().getFullYear()}-${randomSuffix}`;

    let attachmentUrl = null;

    // Handle file attachment saving locally in /public/uploads
    if (data.fileBase64 && data.fileName) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileExtension = path.extname(data.fileName);
      const uniqueFileName = `${trackingNumber}-${Date.now()}${fileExtension}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      // Strip metadata prefix if exists (e.g. data:image/png;base64,)
      const base64Data = data.fileBase64.replace(/^data:.*?;base64,/, "");
      fs.writeFileSync(filePath, base64Data, 'base64');
      attachmentUrl = `/uploads/${uniqueFileName}`;
    }

    const question = await db.question.create({
      data: {
        trackingNumber,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        city: data.city,
        questionText: data.questionText,
        attachmentUrl,
        status: 'PENDING'
      }
    });

    return { 
      success: true, 
      data: {
        id: question.id,
        trackingNumber: question.trackingNumber,
        status: question.status,
        createdAt: question.createdAt
      } 
    };
  } catch (error: any) {
    console.error('Ask Question error:', error);
    return { success: false, error: error.message || 'Failed to submit question' };
  }
}

// Track Question by Tracking Number
export async function trackQuestion(trackingNumber: string) {
  try {
    const question = await db.question.findUnique({
      where: { trackingNumber },
      include: {
        fatwa: {
          include: {
            category: true,
            subCategory: true,
            answeredBy: true
          }
        }
      }
    });

    if (!question) {
      return { success: false, error: 'Tracking number not found' };
    }

    return { success: true, data: question };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get Categories and Subcategories with counts
export async function getCategoriesWithCounts() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      include: {
        subCategories: {
          where: { isActive: true }
        },
        _count: {
          select: { fatwas: { where: { visibility: 'PUBLIC' } } }
        }
      }
    });

    return { success: true, data: categories };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get Wazaif List
export async function getWazaif(category?: string) {
  try {
    const where: Prisma.WazifaWhereInput = {};
    if (category && category !== 'all') {
      where.category = category;
    }

    const wazaif = await db.wazifa.findMany({
      where,
      orderBy: { publishDate: 'desc' }
    });

    // Get unique categories list
    const allWazaif = await db.wazifa.findMany({ select: { category: true } });
    const categories = Array.from(new Set(allWazaif.map(w => w.category)));

    return { success: true, data: wazaif, categories };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get Books & Magazines
export async function getBooks(filters?: { query?: string; type?: string; category?: string }) {
  try {
    const where: Prisma.BookWhereInput = {};
    
    if (filters?.type && filters.type !== 'all') {
      where.type = filters.type;
    }
    
    if (filters?.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    if (filters?.query) {
      where.OR = [
        { title: { contains: filters.query } },
        { description: { contains: filters.query } }
      ];
    }

    const books = await db.book.findMany({
      where,
      orderBy: { publishedDate: 'desc' }
    });

    // Get unique categories list
    const allBooks = await db.book.findMany({ select: { category: true } });
    const categories = Array.from(new Set(allBooks.map(b => b.category)));

    return { success: true, data: books, categories };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Fetch global Hijri Date calibration offset
export async function getGlobalHijriOffset(): Promise<number> {
  try {
    const setting = await db.setting.findUnique({
      where: { key: 'hijriOffset' }
    });
    if (setting) {
      return parseInt(setting.value, 10) || 0;
    }
    return 0;
  } catch (e) {
    console.error('Error fetching global Hijri offset:', e);
    return 0;
  }
}
