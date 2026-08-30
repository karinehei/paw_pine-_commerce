export interface Address {
  country: string;
  postalCode: string;
  city?: string;
}

export interface Parcel {
  grams: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

export interface ShippingRate {
  id: string;
  title: string;
  amount: string;
  currency: "EUR";
  minDays?: number;
  maxDays?: number;
  demo: true;
}

export interface Shipment {
  id: string;
  trackingCode?: string;
  labelUrl?: string;
  demo: true;
}

export interface TrackingSnapshot {
  status: string;
  events: string[];
  demo: true;
}

export interface ShippingProvider {
  readonly name: string;
  getRates(input: { destination: Address; parcels: Parcel[] }): Promise<ShippingRate[]>;
  createShipment(input: {
    rateId: string;
    destination: Address;
    parcels: Parcel[];
    orderId: string;
  }): Promise<Shipment>;
  getTracking(shipmentId: string): Promise<TrackingSnapshot>;
}
