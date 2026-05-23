import { env } from '@/env.mjs';
import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { path, type, secret } = await request.json();

    if (!env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { message: 'Revalidation is not configured' },
        { status: 503 },
      );
    }

    if (typeof secret !== 'string' || secret !== env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    if (typeof path !== 'string' || path.length === 0) {
      return NextResponse.json({ message: 'Path is required' }, { status: 400 });
    }

    revalidatePath(path, type);

    return NextResponse.json({ revalidated: true });
  } catch (err) {
    console.error('Error revalidating path:', err);
    return NextResponse.json({ message: 'Error revalidating path' }, { status: 500 });
  }
}
