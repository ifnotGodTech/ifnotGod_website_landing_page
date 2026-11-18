import { describe, expect, it } from "vitest";
import { addMonths, formatLongDate, todayInLagos } from "./dates";

describe("dates", () => {
  it.each([
    ["2026-11-08", 1, "2026-12-08"],
    ["2026-11-08", 6, "2027-05-08"],
    ["2026-11-08", 12, "2027-11-08"],
    ["2026-01-31", 1, "2026-02-28"],
    ["2028-01-31", 1, "2028-02-29"],
    ["2026-08-31", 6, "2027-02-28"],
  ])("%s plus %i months is %s", (date, months, expected) => {
    expect(addMonths(date, months)).toBe(expected);
  });

  it("writes dates out in full", () => {
    expect(formatLongDate("2026-12-08")).toBe("8 December 2026");
  });

  it("uses Lagos time for today", () => {
    expect(todayInLagos(new Date("2026-11-08T23:30:00Z"))).toBe("2026-11-09");
  });
});
