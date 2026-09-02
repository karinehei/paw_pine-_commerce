import type { CommerceErrorCode } from "@/lib/commerce/errors";
import type { Cart } from "@/lib/commerce/types";

export type CartMutationResult =
  { ok: true; cart: Cart } | { ok: false; code: CommerceErrorCode };
