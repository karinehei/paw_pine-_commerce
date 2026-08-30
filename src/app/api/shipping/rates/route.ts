import { NextResponse } from "next/server";
import { getShippingProvider } from "@/lib/shipping/mock";
import { normaliseFinnishPostalCode } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "invalid_postcode" }, { status: 400 });
  }

  const postalCode =
    typeof body === "object" &&
    body &&
    "postalCode" in body &&
    typeof body.postalCode === "string"
      ? normaliseFinnishPostalCode(body.postalCode)
      : null;

  if (!postalCode) {
    return NextResponse.json({ ok: false, message: "invalid_postcode" }, { status: 400 });
  }

  const rates = await getShippingProvider().getRates({
    destination: { country: "FI", postalCode },
    parcels: [{ grams: 500 }],
  });

  return NextResponse.json({ ok: true, demo: true, postalCode, rates });
}
