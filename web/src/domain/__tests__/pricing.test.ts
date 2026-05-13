import { describe, expect, it } from "vitest";
import { buildCabinet, makeDefaultCabinet } from "../cabinets";
import { nest } from "../nesting";
import { buildPriceQuote } from "../pricing";

const pricing = {
  laborRatePerSquareMeter: 90,
  hardwareMarkup: 0.35,
  overallMarkup: 0.2,
  taxRate: 0.08,
};

describe("pricing", () => {
  it("subtotal equals sum of line amounts", () => {
    const cab = buildCabinet(makeDefaultCabinet("base", "x"));
    const sheets = nest([cab]);
    const quote = buildPriceQuote([cab], sheets, pricing);
    const lineSum = quote.lines.reduce((s, l) => s + l.amount, 0);
    expect(quote.subtotal).toBeCloseTo(lineSum, 5);
  });

  it("markup, tax, and total stack correctly", () => {
    const cab = buildCabinet(makeDefaultCabinet("base", "x"));
    const sheets = nest([cab]);
    const quote = buildPriceQuote([cab], sheets, pricing);
    expect(quote.markup).toBeCloseTo(quote.subtotal * pricing.overallMarkup, 5);
    expect(quote.preTax).toBeCloseTo(quote.subtotal + quote.markup, 5);
    expect(quote.tax).toBeCloseTo(quote.preTax * pricing.taxRate, 5);
    expect(quote.total).toBeCloseTo(quote.preTax + quote.tax, 5);
  });

  it("hardware markup increases the unit price of hardware lines", () => {
    const cab = buildCabinet(makeDefaultCabinet("base", "x"));
    const sheets = nest([cab]);
    const noMarkup = buildPriceQuote([cab], sheets, {
      ...pricing,
      hardwareMarkup: 0,
    });
    const withMarkup = buildPriceQuote([cab], sheets, pricing);
    const noHinge = noMarkup.lines.find((l) =>
      l.description.startsWith("Blum"),
    )!;
    const withHinge = withMarkup.lines.find((l) =>
      l.description.startsWith("Blum"),
    )!;
    expect(withHinge.unitPrice).toBeCloseTo(
      noHinge.unitPrice * (1 + pricing.hardwareMarkup),
      5,
    );
  });

  it("zero cabinets produces a zero total quote", () => {
    const quote = buildPriceQuote([], [], pricing);
    expect(quote.subtotal).toBe(0);
    expect(quote.total).toBe(0);
  });
});
