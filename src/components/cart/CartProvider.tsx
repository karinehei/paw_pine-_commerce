"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCart } from "@/lib/cart/actions";
import type { Cart, CommerceMode } from "@/lib/commerce/types";

interface CartContextValue {
  cart: Cart | null;
  setCart: (cart: Cart | null) => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  mode: CommerceMode;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  mode,
  children,
}: {
  mode: CommerceMode;
  children: ReactNode;
}) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getCart().then((next) => {
      if (!cancelled) {
        setCart(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ cart, setCart, isOpen, openCart, closeCart, mode }),
    [cart, isOpen, openCart, closeCart, mode],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
