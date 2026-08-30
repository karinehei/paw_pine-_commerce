import { describe, expect, it } from "vitest";
import { DEMO_SHIPPING_RATES, MockShippingProvider } from "@/lib/shipping/mock";

describe("MockShippingProvider", () => {
  const provider = new MockShippingProvider();
  const parcels = [{ grams: 400 }];

  it("returns labelled demo FI rates with EUR prices", async () => {
    const rates = await provider.getRates({
      destination: { country: "FI", postalCode: "00100" },
      parcels,
    });
    expect(rates).toHaveLength(3);
    expect(rates.map((rate) => rate.title)).toEqual([
      "Parcel locker",
      "Service point",
      "Home delivery",
    ]);
    expect(rates.map((rate) => rate.amount)).toEqual(["5.90", "6.50", "12.90"]);
    expect(rates.every((rate) => rate.currency === "EUR" && rate.demo)).toBe(true);
    expect(DEMO_SHIPPING_RATES).toHaveLength(3);
  });

  it("does not invent carrier rates for other countries", async () => {
    const rates = await provider.getRates({
      destination: { country: "SE", postalCode: "11122" },
      parcels,
    });
    expect(rates).toEqual([]);
  });

  it("creates and tracks only simulated shipments", async () => {
    const shipment = await provider.createShipment({
      rateId: "demo-locker",
      destination: { country: "FI", postalCode: "33100" },
      parcels,
      orderId: "demo-order",
    });
    expect(shipment.demo).toBe(true);
    expect(shipment.trackingCode).toBe("DEMO-33100");

    const tracking = await provider.getTracking(shipment.id);
    expect(tracking.demo).toBe(true);
    expect(tracking.status).toBe("simulated");

    await expect(
      provider.createShipment({
        rateId: "posti-real",
        destination: { country: "FI", postalCode: "00100" },
        parcels,
        orderId: "x",
      }),
    ).rejects.toThrow(/unknown demo rate/i);
  });
});
