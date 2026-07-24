import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function GET() {
  try {
    const userCount = await db.user.count();
    const questionCount = await db.question.count();
    const tasdeeqCount = await db.tasdeeqRecord.count();
    const notificationCount = await db.notification.count();
    const settingsCount = await db.setting.count();

    // Check custom fields
    const firstQuestion = await db.question.findFirst({
      select: { id: true, assignedToId: true }
    });

    return NextResponse.json({
      success: true,
      userCount,
      questionCount,
      tasdeeqCount,
      notificationCount,
      settingsCount,
      firstQuestion,
      envDatabaseUrl: process.env.DATABASE_URL ? (process.env.DATABASE_URL.substring(0, 30) + "...") : "NOT_DEFINED"
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      envDatabaseUrl: process.env.DATABASE_URL ? (process.env.DATABASE_URL.substring(0, 30) + "...") : "NOT_DEFINED"
    }, { status: 500 });
  }
}
