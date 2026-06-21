import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const CONTACT_EMAIL = process.env.CONTACT_TO_EMAIL || 'notifications@bestlooking.skin';

type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Please submit the form again.' }, { status: 400 });
  }

  const name = clean(payload.name, 120);
  const email = clean(payload.email, 180).toLowerCase();
  const subject = clean(payload.subject, 160) || 'New contact form message';
  const message = clean(payload.message, 4000);

  if (!name || !email || !message) {
    return NextResponse.json({ message: 'Name, email and message are required.' }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: 'Please enter a valid email address.' }, { status: 400 });
  }

  try {
    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: getRequiredEnv('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: {
        user: getRequiredEnv('SMTP_USER'),
        pass: getRequiredEnv('SMTP_PASS'),
      },
    });

    await transporter.sendMail({
      from: process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `[BestLooking.Skin] ${subject}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        '',
        message,
      ].join('\n'),
    });

    return NextResponse.json({ message: 'Thanks, your message has been sent.' });
  } catch (error) {
    console.error('Contact form email failed:', error);
    return NextResponse.json(
      { message: 'The form is not ready yet. Please email hello@bestlooking.skin directly.' },
      { status: 500 },
    );
  }
}
