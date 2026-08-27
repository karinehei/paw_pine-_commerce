import { describe, expect, it } from "vitest";
import { demoProducts } from "@/lib/commerce/demo/catalog";
import {
  defaultSelections,
  findVariant,
  optionValueState,
} from "@/lib/commerce/variants";

describe("variant selection", () => {
  it("defaults to an in-stock size", () => {
    const harness = demoProducts.find((product) => product.handle === "trail-harness");
    expect(harness).toBeDefined();
    const selected = defaultSelections(harness!);
    expect(selected.Size).not.toBe("XL");
    expect(findVariant(harness!, selected)?.availableForSale).toBe(true);
  });

  it("marks out-of-stock sizes without treating them as invalid", () => {
    const harness = demoProducts.find((product) => product.handle === "trail-harness");
    expect(harness).toBeDefined();
    const selected = { Size: "M" };
    expect(optionValueState(harness!, selected, "Size", "XL")).toBe("out_of_stock");
    expect(optionValueState(harness!, selected, "Size", "M")).toBe("available");
  });
});
