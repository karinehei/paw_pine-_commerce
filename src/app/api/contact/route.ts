import { NextResponse } from "next/server";
import { isEmail } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Please complete the form." }, { status: 400 });
  }

  const record = typeof body === "object" && body ? (body as Record<string, unknown>) : {};
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email = typeof record.email === "string" ? record.email.trim() : "";
  const message = typeof record.message === "string" ? record.message.trim() : "";

  if (!name || !isEmail(email) || message.length < 10) {
    return NextResponse.json(
      { ok: false, message: "Please include your name, a valid email, and a short message." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
