// =============================================================================
// AiRfqModal — describe a procurement need in plain language; the AI drafts a
// structured RFQ (title, category, line items, suggested deadline). Calls the
// backend /api/ai/generate-rfq endpoint.
// =============================================================================
import { useState } from 'react';
import { Sparkles, X, Loader2, AlertTriangle, Wand2 } from 'lucide-react';

import { aiApi } from '../../lib/api';

const EXAMPLES = [
  'Need 60 business laptops (i7/16GB/512GB SSD) with 3-year warranty by next month',
  'Annual rate contract for office stationery and pantry supplies across 3 offices',
  '200 sheets of 10mm MS steel plate, IS 2062 grade, with test certificates',
];

export default function AiRfqModal({ open, onClose, onUseDraft }) {
  const [prompt, setPrompt] = useState('');
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setDraft(null);
    try {
      setDraft(await aiApi.generateRfq(prompt.trim()));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 pt-[8vh] backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Draft an RFQ with AI</h3>
            <p className="text-xs text-slate-500">Describe what you need; review and refine the draft before publishing.</p>
          </div>
          <button onClick={onClose} className="focus-ring ml-auto rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="e.g. Need 60 business laptops with docking stations and 3-year warranty by end of next month…"
              className="focus-ring w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200"
                >
                  {ex.slice(0, 38)}…
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {loading ? 'Drafting…' : 'Generate draft'}
          </button>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {draft && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                  {draft.category}
                </span>
                <span className="text-xs text-slate-400">
                  Suggested deadline: {draft.suggestedDeadlineDays} days
                </span>
                <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">
                  {draft.engine?.startsWith('heuristic') ? 'local engine' : draft.engine}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{draft.title}</h4>
              <p className="mt-1 text-sm text-slate-600">{draft.description}</p>

              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th className="py-1.5">Item</th>
                    <th className="py-1.5 text-right">Qty</th>
                    <th className="py-1.5 pl-3">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(draft.items || []).map((it, i) => (
                    <tr key={i}>
                      <td className="py-1.5 pr-3 text-slate-700">
                        {it.name}
                        {it.specs && <span className="block text-xs text-slate-400">{it.specs}</span>}
                      </td>
                      <td className="py-1.5 text-right tabular-nums text-slate-700">{it.quantity}</td>
                      <td className="py-1.5 pl-3 text-slate-500">{it.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={onClose} className="focus-ring rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                  Close
                </button>
                <button
                  onClick={() => { onUseDraft?.(draft); onClose?.(); }}
                  className="focus-ring rounded-lg bg-success-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-success-700"
                >
                  Use this draft
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
