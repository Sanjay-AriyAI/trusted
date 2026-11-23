import { beforeEach, describe, expect, it } from "vitest";
import { createRateLimiter, resetRateLimits } from "@/lib/server/rateLimit";

describe("createRateLimiter", () => {
  beforeEach(() => resetRateLimits());

  it("allows `limit` hits per window, then blocks", () => {
    const check = createRateLimiter(5, 10 * 60 * 1000);
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) expect(check("ip-1", now + i).ok).toBe(true);
    const blocked = check("ip-1", now + 10);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks keys independently", () => {
    const check = createRateLimiter(1, 1000);
    expect(check("a", 0).ok).toBe(true);
    expect(check("b", 0).ok).toBe(true);
    expect(check("a", 1).ok).toBe(false);
  });

  it("resets after the window expires", () => {
    const check = createRateLimiter(1, 1000);
    expect(check("a", 0).ok).toBe(true);
    expect(check("a", 999).ok).toBe(false);
    expect(check("a", 1000).ok).toBe(true);
  });

  it("keeps separate limiters isolated", () => {
    const apply = createRateLimiter(1, 1000);
    const quiz = createRateLimiter(1, 1000);
    expect(apply("ip", 0).ok).toBe(true);
    expect(quiz("ip", 0).ok).toBe(true);
  });
});
