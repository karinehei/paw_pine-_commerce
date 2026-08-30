import { NextResponse } from "next/server";
import { isEmail } from "@/lib/validation";

/**
 * Validates the message and acknowledges it. No mailbox, helpdesk, or
 * email vendor is called. Production would swap this for a ContactProvider.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const record =
    typeof body === "object" && body ? (body as Record<string, unknown>) : {};
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email = typeof record.email === "string" ? record.email.trim() : "";
  const message = typeof record.message === "string" ? record.message.trim() : "";

  if (
    !name ||
    name.length > 120 ||
    !isEmail(email) ||
    message.length < 10 ||
    message.length > 4000
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  return NextResponse.json({ ok: true, demo: true });
}
