import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstileToken } from '@/lib/captcha';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || '';
    const success = await verifyTurnstileToken(token, ip);

    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('API Verify Captcha Error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}
