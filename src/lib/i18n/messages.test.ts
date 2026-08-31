import { describe, expect, it } from "vitest";
import { dictionariesShareKeys, getMessages } from "@/lib/i18n/messages";

describe("translation dictionaries", () => {
  it("keeps fi, en, and sv keys in lockstep", () => {
    expect(dictionariesShareKeys()).toBe(true);
  });

  it("interpolates without locale branches in callers", () => {
    expect(getMessages("en").searchResult(1, "oak")).toContain("1 result");
    expect(getMessages("fi").searchResult(2, "tammi")).toContain("2 tulosta");
    expect(getMessages("sv").addToBag).toBe("Lägg i varukorgen");
    expect(getMessages("sv").checkout).toBe("Till kassan");
  });
});
