export class CommerceError extends Error {
  readonly code:
    | "unavailable"
    | "not_found"
    | "invalid_cart"
    | "out_of_stock"
    | "network";

  constructor(
    code: CommerceError["code"],
    message = "Something went wrong while loading the shop.",
  ) {
    super(message);
    this.name = "CommerceError";
    this.code = code;
  }
}

export function toUserErrorMessage(error: unknown): string {
  if (error instanceof CommerceError) {
    switch (error.code) {
      case "unavailable":
        return "The shop is temporarily unavailable. Please try again shortly.";
      case "not_found":
        return "We could not find that item.";
      case "invalid_cart":
        return "Your cart could not be loaded. Please add the item again.";
      case "out_of_stock":
        return "That option is currently out of stock.";
      case "network":
        return "A network error interrupted the request. Please try again.";
    }
  }

  return "Something went wrong. Please try again.";
}
