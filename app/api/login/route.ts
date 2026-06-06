import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const validUsername = process.env.AUTH_USERNAME;
  const validPassword = process.env.AUTH_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  if (!validUsername || !validPassword || !secret) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  if (username === validUsername && password === validPassword) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set('session', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return response;
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
