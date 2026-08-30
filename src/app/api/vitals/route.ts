import { NextResponse } from "next/server";
import { logOpsEvent } from "@/lib/commerce/shopify/log";
import { parseWebVitalReport } from "@/lib/ops/vitals";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const report = parseWebVitalReport(body);
  if (!report) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  logOpsEvent("cwv", {
    name: report.name,
    value: Math.round(report.value * 1000) / 1000,
    rating: report.rating,
    path: report.path,
  });

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
