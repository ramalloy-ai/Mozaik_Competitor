import { useMemo } from "react";
import type { ProjectStore } from "../store";
import { nest } from "../domain/nesting";
import {
  buildPriceQuote,
  type PriceTotal,
} from "../domain/pricing";

async function downloadQuotePdf(opts: {
  projectName: string;
  customer: string;
  quote: PriceTotal;
  filename: string;
}) {
  const pdf = await import("../domain/pdf");
  pdf.downloadBlob(opts.filename, pdf.generateQuotePdf(opts));
}

export function QuoteView({ store }: { store: ProjectStore }) {
  const sheets = useMemo(() => nest(store.cabinets), [store.cabinets]);
  const quote = useMemo(
    () => buildPriceQuote(store.cabinets, sheets, store.project.pricing),
    [store.cabinets, sheets, store.project.pricing],
  );
  const p = store.project.pricing;

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Quote</h1>
        <div>
          <button
            onClick={() =>
              downloadQuotePdf({
                projectName: store.project.name,
                customer: store.project.customer,
                quote,
                filename: `${store.project.name}-quote.pdf`,
              })
            }
          >
            Download quote (PDF)
          </button>
        </div>
      </div>

      <div className="screen-body two-col">
        <table className="data-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="num">Qty</th>
              <th>Unit</th>
              <th className="num">Unit price</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((line, i) => (
              <tr key={i}>
                <td>{line.description}</td>
                <td className="num">{line.quantity}</td>
                <td>{line.unit}</td>
                <td className="num">${line.unitPrice.toFixed(2)}</td>
                <td className="num">${line.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="num">Subtotal</td>
              <td className="num">${quote.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={4} className="num">Markup ({(p.overallMarkup * 100).toFixed(0)}%)</td>
              <td className="num">${quote.markup.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={4} className="num">Tax ({(p.taxRate * 100).toFixed(1)}%)</td>
              <td className="num">${quote.tax.toFixed(2)}</td>
            </tr>
            <tr className="grand-total">
              <td colSpan={4} className="num">Total</td>
              <td className="num">${quote.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="quote-side">
          <h3>Project</h3>
          <div className="field">
            <label>Project name</label>
            <input
              value={store.project.name}
              onChange={(e) => store.updateMeta({ name: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Customer</label>
            <input
              value={store.project.customer}
              onChange={(e) => store.updateMeta({ customer: e.target.value })}
            />
          </div>

          <h3>Pricing levers</h3>
          <div className="field">
            <label>Labor $/m²</label>
            <input
              type="number"
              value={p.laborRatePerSquareMeter}
              min={0}
              step={5}
              onChange={(e) =>
                store.updatePricing({
                  laborRatePerSquareMeter: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="field">
            <label>Hardware markup</label>
            <input
              type="number"
              value={p.hardwareMarkup}
              min={0}
              max={2}
              step={0.05}
              onChange={(e) =>
                store.updatePricing({ hardwareMarkup: Number(e.target.value) })
              }
            />
          </div>
          <div className="field">
            <label>Overall markup</label>
            <input
              type="number"
              value={p.overallMarkup}
              min={0}
              max={2}
              step={0.05}
              onChange={(e) =>
                store.updatePricing({ overallMarkup: Number(e.target.value) })
              }
            />
          </div>
          <div className="field">
            <label>Tax rate</label>
            <input
              type="number"
              value={p.taxRate}
              min={0}
              max={1}
              step={0.005}
              onChange={(e) =>
                store.updatePricing({ taxRate: Number(e.target.value) })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
