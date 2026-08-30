import { NextResponse } from "next/server";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { backInStockEligibility } from "@/lib/notifications/eligibility";
import { getNotificationProvider } from "@/lib/notifications/mock";
import { isProductHandle } from "@/lib/security";
import { isEmail } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "invalid_email" }, { status: 400 });
  }

  const record =
    typeof body === "object" && body ? (body as Record<string, unknown>) : {};
  const email = typeof record.email === "string" ? record.email.trim() : "";
  const handle = typeof record.handle === "string" ? record.handle.trim() : "";
  const variantId =
    typeof record.variantId === "string" ? record.variantId.trim() : undefined;

  if (!isEmail(email)) {
    return NextResponse.json({ ok: false, message: "invalid_email" }, { status: 400 });
  }
  if (!isProductHandle(handle)) {
    return NextResponse.json({ ok: false, message: "invalid_product" }, { status: 400 });
  }

  const product = await getCatalogProvider().getProduct(handle);
  const eligibility = backInStockEligibility(product, variantId);
  if (eligibility === "not_found") {
    return NextResponse.json({ ok: false, message: "not_found" }, { status: 404 });
  }
  if (eligibility === "in_stock") {
    return NextResponse.json({ ok: false, message: "in_stock" }, { status: 400 });
  }

  await getNotificationProvider().subscribeBackInStock({
    email,
    handle,
    variantId,
  });

  return NextResponse.json({ ok: true, demo: true });
}
