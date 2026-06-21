import { NextResponse } from 'next/server';

const BASE = (process.env.NEXT_PUBLIC_STRAPI_URL || 'https://cms.fxnstudio.com').replace(/\/$/, '');
const WRITE_TOKEN = process.env.STRAPI_WRITE_TOKEN || process.env.STRAPI_API_TOKEN || '';

type ReviewPayload = {
  productDocumentId?: string;
  authorName?: string;
  email?: string;
  rating?: number | string;
  title?: string;
  body?: string;
};

function clean(v: unknown, max: number) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  let payload: ReviewPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Please submit the form again.' }, { status: 400 });
  }

  const productDocumentId = clean(payload.productDocumentId, 60);
  const authorName = clean(payload.authorName, 80);
  const email = clean(payload.email, 180).toLowerCase();
  const title = clean(payload.title, 140);
  const body = clean(payload.body, 4000);
  const rating = Math.round(Number(payload.rating));

  if (!productDocumentId) {
    return NextResponse.json({ message: 'Missing product reference.' }, { status: 400 });
  }
  if (!authorName) {
    return NextResponse.json({ message: 'Please enter your name.' }, { status: 400 });
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ message: 'Please choose a rating from 1 to 5 stars.' }, { status: 400 });
  }
  if (!body) {
    return NextResponse.json({ message: 'Please write your review.' }, { status: 400 });
  }
  if (!WRITE_TOKEN) {
    return NextResponse.json({ message: 'Reviews are not configured yet.' }, { status: 500 });
  }

  try {
    const res = await fetch(`${BASE}/api/commerce-reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WRITE_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          product: productDocumentId,
          authorName,
          ...(email ? { email } : {}),
          rating,
          ...(title ? { title } : {}),
          body,
          reviewStatus: 'pending',
          source: 'bestlooking.skin',
        },
      }),
    });

    if (!res.ok) {
      console.error('Review create failed:', res.status, await res.text().catch(() => ''));
      return NextResponse.json({ message: 'Could not submit your review. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({
      message: 'Thanks! Your review was submitted and will appear once approved.',
    });
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ message: 'Could not submit your review. Please try again.' }, { status: 500 });
  }
}
