import { NextResponse } from "next/server";
import { getNewsletterProvider } from "@/lib/newsletter/mock";
import { isEmail } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email =
    typeof body === "object" && body && "email" in body && typeof body.email === "string"
      ? body.email.trim()
      : "";

  if (!isEmail(email)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const result = await getNewsletterProvider().subscribe({ email });
  return NextResponse.json({
    ok: result.ok,
    demo: result.demo,
  });
}
