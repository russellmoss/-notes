// src/app/api/ingest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { IngestBody } from "@/lib/schema";
import { summarizeSingleSource } from "@/lib/llm";
import { createNotePage } from "@/lib/notion";
import crypto from "crypto";

function verifySignature(payload: string, sig?: string) {
  const secret = process.env.INGEST_SHARED_SECRET!;
  if (!sig) return true; // optional
  const h = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(sig));
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-signature") || undefined;
  if (!verifySignature(raw, sig)) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  let data;
  try {
    data = IngestBody.parse(JSON.parse(raw));
  } catch (e:any) {
    return NextResponse.json({ error: "bad payload", details: e.message }, { status: 400 });
  }

  const note = await summarizeSingleSource({
    text: data.content.text,
    transcript_raw: data.content.transcript_raw,
    default_date_iso: data.meeting_context.default_date_iso,
    known_people: data.meeting_context.known_people,
    source: data.source
  });

  const created = await createNotePage(note);
  return NextResponse.json({ ok: true, ...created });
}
