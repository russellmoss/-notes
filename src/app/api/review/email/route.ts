import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const queryKey = new URL(req.url).searchParams.get("api_key");
  const key = process.env.SYNC_API_KEY;
  if (key && authHeader !== `Bearer ${key}` && queryKey !== key) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const to = process.env.REVIEW_EMAIL_TO || "russell.moss@savvywealth.com";

  const requestOrigin = new URL(req.url).origin;

  let notes: any[] = [];
  let pendingOk = false;
  let pendingError: string | undefined;
  let pendingKeys: string[] = [];

  try {
    const pendingUrl = new URL("/api/review/pending", req.url).toString();
    const pendingRes = await fetch(pendingUrl, { cache: "no-store" });
    if (pendingRes.ok) {
      const data = await pendingRes.json();
      pendingKeys = Object.keys(data || {});
      const candidate = Array.isArray(data?.notes)
        ? data.notes
        : Array.isArray((data as any)?.results)
          ? (data as any).results
          : Array.isArray((data as any)?.data?.notes)
            ? (data as any).data.notes
            : [];
      notes = candidate;
      pendingOk = true;
    } else {
      pendingError = `pending endpoint returned ${pendingRes.status}`;
    }
  } catch (e: any) {
    pendingError = e?.message || "failed to fetch pending";
  }

  const total = notes.length;
  const nextDayCount = notes.filter(
    (n: any) => n.reviewType === "next-day",
  ).length;
  const weekLaterCount = notes.filter(
    (n: any) => n.reviewType === "week-later",
  ).length;

  // Subject with emoji
  const subject =
    total > 0
      ? `📬 You have ${total} notes to review today`
      : `✨ You're all caught up — no notes to review`;

  // Build a pretty HTML email with a purple CTA button and styled list
  const linkBase = process.env.NEXT_PUBLIC_APP_URL || requestOrigin;
  const safeTitle = (t: string) =>
    (t || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const listItemsHtml =
    total > 0
      ? notes
          .map(
            (n: any) =>
              `<li style="margin: 0 0 10px 0; line-height: 1.5;">
        <span style="display:inline-block; font-weight:600; color:#111827;">${safeTitle(n.title)}</span>
        <span style="color:#6B7280;"> — ${n.reviewType === "next-day" ? "Next Day" : "Week Later"} • ${new Date(n.date).toLocaleDateString()}</span>
      </li>`,
          )
          .join("")
      : '<li style="color:#6B7280;">No pending notes.</li>';

  const detailsLine =
    total > 0
      ? `<p style="margin: 0 0 16px 0; color:#374151;">
         You have <strong>${total}</strong> notes to review today
         <span style="color:#6B7280;">(${nextDayCount} next-day, ${weekLaterCount} week-later)</span>.
       </p>`
      : `<p style="margin: 0 0 16px 0; color:#374151;">No pending notes today.</p>`;

  const html = `
  <div style="background:#F9FAFB; padding:24px;">
    <div style="max-width:640px; margin:0 auto; background:#FFFFFF; border:1px solid #E5E7EB; border-radius:12px; overflow:hidden;">
      <div style="padding:24px 24px 0 24px;">
        <h1 style="margin:0 0 8px 0; font-size:20px; font-weight:700; color:#111827;">📚 Notes Review</h1>
        ${detailsLine}
      </div>
      <div style="padding:8px 24px 0 24px;">
        <ul style="padding-left:18px; margin:0 0 8px 0;">
          ${listItemsHtml}
        </ul>
      </div>
      <div style="padding:24px; text-align:center;">
        <a href="${linkBase}/review" style="display:inline-block; background:#7C3AED; color:#FFFFFF; text-decoration:none; font-weight:600; padding:12px 20px; border-radius:10px;">
          Open Review App →
        </a>
      </div>
    </div>
    <p style="max-width:640px; margin:12px auto 0; font-size:12px; color:#9CA3AF; text-align:center;">
      Sent by Notes Middleware · <a href="${linkBase}" style="color:#7C3AED; text-decoration:none;">${linkBase.replace(/^https?:\/\//, "")}</a>
    </p>
  </div>`;

  const textList =
    total > 0
      ? notes
          .map(
            (n: any) =>
              `- ${n.title} — ${n.reviewType} — ${new Date(n.date).toLocaleDateString()}`,
          )
          .join("\n")
      : "No pending notes.";

  const text = `${total > 0 ? `You have ${total} notes to review today (${nextDayCount} next-day, ${weekLaterCount} week-later).` : "No pending notes today."}\n\n${textList}\n\nOpen: ${linkBase}/review`;

  const result = await sendEmail({ to, subject, text, html });
  if (!result.ok) {
    return NextResponse.json(
      {
        error: "Email send failed",
        details: result.error,
        pendingOk,
        pendingError,
        pendingKeys,
        sample: notes[0],
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    sent: true,
    to,
    total,
    nextDayCount,
    weekLaterCount,
    pendingOk,
    pendingError,
    pendingKeys,
    sample: notes[0],
  });
}
