import type {
  Address,
  Parcel,
  Shipment,
  ShippingProvider,
  ShippingRate,
  TrackingSnapshot,
} from "@/lib/shipping/types";

export const DEMO_SHIPPING_RATES: ShippingRate[] = [
  {
    id: "demo-locker",
    title: "Parcel locker",
    amount: "5.90",
    currency: "EUR",
    minDays: 2,
    maxDays: 4,
    demo: true,
  },
  {
    id: "demo-service-point",
    title: "Service point",
    amount: "6.50",
    currency: "EUR",
    minDays: 2,
    maxDays: 5,
    demo: true,
  },
  {
    id: "demo-home",
    title: "Home delivery",
    amount: "12.90",
    currency: "EUR",
    minDays: 3,
    maxDays: 6,
    demo: true,
  },
];

/**
 * Illustrative FI rates only. Not Posti or Matkahuolto.
 * Production would add PostiShippingProvider / MatkahuoltoShippingProvider
 * behind getShippingProvider() using server-only credentials.
 */
export class MockShippingProvider implements ShippingProvider {
  readonly name = "mock";

  async getRates(input: {
    destination: Address;
    parcels: Parcel[];
  }): Promise<ShippingRate[]> {
    if (input.destination.country !== "FI") {
      return [];
    }
    return DEMO_SHIPPING_RATES.map((rate) => ({ ...rate }));
  }

  async createShipment(input: {
    rateId: string;
    destination: Address;
    parcels: Parcel[];
    orderId: string;
  }): Promise<Shipment> {
    const rate = DEMO_SHIPPING_RATES.find((item) => item.id === input.rateId);
    if (!rate) {
      throw new Error("Unknown demo rate.");
    }
    return {
      id: `demo-shipment-${input.orderId}`,
      trackingCode: `DEMO-${input.destination.postalCode}`,
      demo: true,
    };
  }

  async getTracking(shipmentId: string): Promise<TrackingSnapshot> {
    if (!shipmentId.startsWith("demo-shipment-")) {
      throw new Error("Unknown demo shipment.");
    }
    return {
      status: "simulated",
      events: ["Demo label created. No carrier was contacted."],
      demo: true,
    };
  }
}

export function getShippingProvider(): ShippingProvider {
  return new MockShippingProvider();
}
