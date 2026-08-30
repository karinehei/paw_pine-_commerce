import { describe, expect, it } from "vitest";
import {
  consentFromCookieValue,
  cookieValueFromConsent,
  hasAnalyticsConsent,
  UNDECIDED_CONSENT,
} from "@/lib/analytics/consent";

describe("analytics consent", () => {
  it("keeps analytics off until a decision is stored", () => {
    const state = consentFromCookieValue(undefined);
    expect(state).toEqual(UNDECIDED_CONSENT);
    expect(state.necessary).toBe(true);
    expect(hasAnalyticsConsent(state)).toBe(false);
  });

  it("enables analytics only after explicit accept", () => {
    const accepted = consentFromCookieValue("analytics");
    expect(accepted.decided).toBe(true);
    expect(accepted.analytics).toBe(true);
    expect(hasAnalyticsConsent(accepted)).toBe(true);
    expect(cookieValueFromConsent(accepted)).toBe("analytics");
  });

  it("persists necessary-only as an explicit refusal", () => {
    const refused = consentFromCookieValue("necessary");
    expect(refused.decided).toBe(true);
    expect(refused.analytics).toBe(false);
    expect(hasAnalyticsConsent(refused)).toBe(false);
    expect(cookieValueFromConsent(refused)).toBe("necessary");
  });

  it("returns the same snapshot object for a given cookie value", () => {
    expect(consentFromCookieValue(undefined)).toBe(UNDECIDED_CONSENT);
    expect(consentFromCookieValue("analytics")).toBe(consentFromCookieValue("analytics"));
    expect(consentFromCookieValue("necessary")).toBe(consentFromCookieValue("necessary"));
  });
});
