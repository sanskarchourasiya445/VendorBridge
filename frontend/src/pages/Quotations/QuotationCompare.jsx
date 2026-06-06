// =============================================================================
// QuotationCompare — side-by-side quotation comparison for a chosen RFQ.
// Fulfils the problem statement's Comparison screen (lowest-price highlight,
// delivery + rating comparison, sorting) and adds an AI recommendation that
// calls the backend /api/ai/compare-quotations endpoint.
// =============================================================================
import { useMemo, useState } from 'react';
import {
  Sparkles, Trophy, TrendingDown, Clock, Star, AlertTriangle, Loader2, Award,
} from 'lucide-react';

import { QUOTATIONS, RFQS, VENDORS } from '../../data/mockData';
import { aiApi } from '../../lib/api';
import { formatCurrency } from '../../utils/formatters';

const vendorRating = (q) => VENDORS.find((v) => v.id === q.vendorId)?.rating ?? null;

export default function QuotationCompare() {
  // RFQs that actually have quotations to compare.
  const rfqOptions = useMemo(() => {
    const counts = QUOTATIONS.reduce((m, q) => ({ ...m, [q.rfqId]: (m[q.rfqId] || 0) + 1 }), {});
    return RFQS.filter((r) => counts[r.id]).map((r) => ({ ...r, count: counts[r.id] }));
  }, []);

  const [rfqId, setRfqId] = useState(rfqOptions[0]?.id || '');
  const [ai, setAi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const rfq = RFQS.find((r) => r.id === rfqId);
  const quotes = useMemo(
    () => QUOTATIONS.filter((q) => q.rfqId === rfqId).map((q) => ({ ...q, vendorRating: vendorRating(q) })),
    [rfqId]
  );

  const lowestPrice = quotes.length ? Math.min(...quotes.map((q) => q.grandTotal)) : 0;
  const fastest = quotes.length ? Math.min(...quotes.map((q) => q.deliveryDays)) : 0;
  const bestRating = quotes.length ? Math.max(...quotes.map((q) => q.vendorRating || 0)) : 0;

  async function runAi() {
    setLoading(true);
    setError('');
    setAi(null);
    try {
      const result = await aiApi.compareQuotations({ rfq, quotations: quotes });
      setAi(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const recommendedId = ai?.recommendedQuotationId;

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-card">
        <div className="min-w-[16rem] flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Compare quotations for
          </label>
          <select
            value={rfqId}
            onChange={(e) => { setRfqId(e.target.value); setAi(null); setError(''); }}
            className="focus-ring w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900"
          >
            {rfqOptions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.rfqNumber} — {r.title} ({r.count} quotes)
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={runAi}
          disabled={loading || quotes.length < 1}
          className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Analyzing…' : 'Analyze with AI'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* AI recommendation */}
      {ai && (
        <div className="overflow-hidden rounded-lg border border-primary-200 bg-gradient-to-br from-primary-50 to-white shadow-card">
          <div className="flex items-center gap-2 border-b border-primary-100 bg-primary-600/5 px-5 py-3">
            <Sparkles className="h-4 w-4 text-primary-600" />
            <h3 className="text-sm font-bold text-primary-800">AI Recommendation</h3>
            <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
              {ai.engine?.startsWith('heuristic') ? 'local engine' : ai.engine}
            </span>
          </div>
          <div className="p-5">
            {(() => {
              const rec = quotes.find((q) => q.id === recommendedId);
              return (
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-100 px-3 py-1 text-sm font-bold text-success-700">
                    <Trophy className="h-4 w-4" /> {rec?.vendorName || '—'}
                  </span>
                  {rec && <span className="text-sm font-semibold text-slate-700">{formatCurrency(rec.grandTotal)} · {rec.deliveryDays} days</span>}
                </div>
              );
            })()}
            <p className="text-sm leading-relaxed text-slate-700">{ai.recommendationReason}</p>
            {ai.summary && <p className="mt-2 text-xs text-slate-500">{ai.summary}</p>}
            {Array.isArray(ai.flags) && ai.flags.length > 0 && (
              <ul className="mt-3 space-y-1">
                {ai.flags.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-warning-700">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Side-by-side comparison */}
      {quotes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No quotations received for this RFQ yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-card scrollbar-thin">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-500">Metric</th>
                {quotes.map((q) => {
                  const score = ai?.ranking?.find((r) => r.quotationId === q.id)?.score;
                  const isRec = q.id === recommendedId;
                  return (
                    <th key={q.id} className={`px-4 py-3 align-top ${isRec ? 'bg-success-50' : ''}`}>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        {isRec && <Award className="h-4 w-4 text-success-600" />}
                        {q.vendorName}
                      </div>
                      <div className="mt-0.5 text-xs font-normal text-slate-400">{q.quotationNumber}</div>
                      {typeof score === 'number' && (
                        <div className="mt-1 inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-bold text-primary-700">
                          AI score {score}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <Row label="Grand Total" icon={TrendingDown}>
                {quotes.map((q) => (
                  <Cell key={q.id} highlight={q.grandTotal === lowestPrice} tone="success">
                    <span className="font-semibold tabular-nums">{formatCurrency(q.grandTotal)}</span>
                    {q.grandTotal === lowestPrice && <Tag>Lowest</Tag>}
                  </Cell>
                ))}
              </Row>
              <Row label="Delivery" icon={Clock}>
                {quotes.map((q) => (
                  <Cell key={q.id} highlight={q.deliveryDays === fastest} tone="primary">
                    {q.deliveryDays} days
                    {q.deliveryDays === fastest && <Tag tone="primary">Fastest</Tag>}
                  </Cell>
                ))}
              </Row>
              <Row label="Vendor Rating" icon={Star}>
                {quotes.map((q) => (
                  <Cell key={q.id} highlight={(q.vendorRating || 0) === bestRating && bestRating > 0} tone="warning">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
                      {q.vendorRating ?? '—'}
                    </span>
                  </Cell>
                ))}
              </Row>
              <Row label="Payment Terms">
                {quotes.map((q) => <Cell key={q.id}>{q.paymentTerms || '—'}</Cell>)}
              </Row>
              <Row label="Premium vs L1">
                {quotes.map((q) => {
                  const premium = lowestPrice ? Math.round(((q.grandTotal - lowestPrice) / lowestPrice) * 100) : 0;
                  return <Cell key={q.id}>{premium === 0 ? '—' : `+${premium}%`}</Cell>;
                })}
              </Row>
              {ai?.ranking?.some((r) => r.strengths?.length || r.risks?.length) && (
                <Row label="AI Notes">
                  {quotes.map((q) => {
                    const r = ai.ranking.find((x) => x.quotationId === q.id);
                    return (
                      <Cell key={q.id}>
                        <ul className="space-y-0.5 text-xs">
                          {r?.strengths?.map((s, i) => (
                            <li key={`s${i}`} className="text-success-700">+ {s}</li>
                          ))}
                          {r?.risks?.map((s, i) => (
                            <li key={`r${i}`} className="text-danger-600">− {s}</li>
                          ))}
                        </ul>
                      </Cell>
                    );
                  })}
                </Row>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, icon: Icon, children }) {
  return (
    <tr>
      <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />} {label}
        </span>
      </th>
      {children}
    </tr>
  );
}

function Cell({ children, highlight, tone = 'success' }) {
  const tones = { success: 'bg-success-50', primary: 'bg-primary-50', warning: 'bg-warning-50' };
  return (
    <td className={`px-4 py-3 text-slate-700 ${highlight ? tones[tone] : ''}`}>
      <span className="inline-flex items-center gap-2">{children}</span>
    </td>
  );
}

function Tag({ children, tone = 'success' }) {
  const tones = {
    success: 'bg-success-600 text-white',
    primary: 'bg-primary-600 text-white',
  };
  return <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tones[tone]}`}>{children}</span>;
}
