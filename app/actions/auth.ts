"use server";

import { cookies } from 'next/headers';
import db from '../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-markazi-darul-ifta-2026';

export interface UserSession {
  id: string;
  email: string;
  role: string;
  muftiId?: string;
  muftiNameEn?: string;
  muftiNameUr?: string;
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string; role?: string }> {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { muftiProfile: true }
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Check if deactivated
    if ((user.role === 'MUFTI' || user.role === 'ADMIN_MUFTI') && user.muftiProfile?.status === 'INACTIVE') {
      return { success: false, error: 'Your account has been deactivated. Please contact Super Admin.' };
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        muftiId: user.muftiProfile?.id || null,
        muftiNameEn: user.muftiProfile?.nameEn || null,
        muftiNameUr: user.muftiProfile?.nameUr || null
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    const cookieStore = cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    // Create Audit Log
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        details: `User logged in: ${user.email} (${user.role})`
      }
    });

    return { success: true, role: user.role };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message || 'An error occurred during login' };
  }
}

export async function logout(): Promise<{ success: boolean }> {
  try {
    const session = await getMe();
    
    const cookieStore = cookies();
    cookieStore.delete('token');

    if (session) {
      await db.activityLog.create({
        data: {
          userId: session.id,
          action: 'LOGOUT',
          details: `User logged out: ${session.email}`
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: true };
  }
}

export async function getMe(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('token');
    
    if (!tokenCookie || !tokenCookie.value) {
      return null;
    }

    const decoded = jwt.verify(tokenCookie.value, JWT_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      muftiId: decoded.muftiId || undefined,
      muftiNameEn: decoded.muftiNameEn || undefined,
      muftiNameUr: decoded.muftiNameUr || undefined
    };
  } catch (error) {
    return null;
  }
}
