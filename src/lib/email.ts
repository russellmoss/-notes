import nodemailer from 'nodemailer';

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ ok: true } | { ok: false; error: string } > {
  const gmailUser = process.env.GMAIL_USER || 'russell.moss@savvywealth.com';
  const gmailPass = process.env.GMAIL_APP_PASSWORD; // e.g. app password

  if (!gmailPass) {
    console.warn('Email not sent: GMAIL_APP_PASSWORD not configured');
    return { ok: false, error: 'GMAIL_APP_PASSWORD not configured' };
  }

  const from = params.from || process.env.REVIEW_EMAIL_FROM || `Notes Review <${gmailUser}>`;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  try {
    await transporter.sendMail({
      from,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown email error';
    console.error('Failed to send email:', message);
    return { ok: false, error: message };
  }
}
