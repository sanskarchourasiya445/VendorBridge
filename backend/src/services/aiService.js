// =============================================================================
// services/aiService.js — VendorBridge AI layer.
//
// Provider-agnostic: uses Anthropic Claude if ANTHROPIC_API_KEY is set, else
// OpenAI if OPENAI_API_KEY is set, else falls back to a deterministic local
// heuristic so every AI feature still works (and demos) without any key.
//
// Set in .env:
//   ANTHROPIC_API_KEY=sk-ant-...        (preferred)
//   OPENAI_API_KEY=sk-...               (alternative)
//   AI_MODEL=claude-3-5-sonnet-latest   (optional override)
// =============================================================================

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

function provider() {
  if (ANTHROPIC_KEY) return 'anthropic';
  if (OPENAI_KEY) return 'openai';
  return 'heuristic';
}

export const aiStatus = () => ({ enabled: provider() !== 'heuristic', provider: provider() });

const DEFAULT_MODEL =
  process.env.AI_MODEL ||
  (provider() === 'openai' ? 'gpt-4o-mini' : 'claude-3-5-sonnet-latest');

// ---- low-level LLM call returning parsed JSON ------------------------------

function extractJson(text = '') {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object in model output.');
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function chatJSON({ system, user, maxTokens = 1200 }) {
  const p = provider();

  if (p === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const text = (data.content || []).map((b) => b.text || '').join('\n');
    return extractJson(text);
  }

  if (p === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return extractJson(data.choices?.[0]?.message?.content || '');
  }

  throw new Error('NO_PROVIDER');
}

// ---- objective metrics (always computed, key or no key) --------------------

function objectiveMetrics(quotations) {
  if (!quotations.length) return {};
  const byPrice = [...quotations].sort((a, b) => a.grandTotal - b.grandTotal);
  const byDelivery = [...quotations].sort((a, b) => a.deliveryDays - b.deliveryDays);
  const byRating = [...quotations].sort((a, b) => (b.vendorRating || 0) - (a.vendorRating || 0));
  return {
    lowestPriceId: byPrice[0].id,
    highestPriceId: byPrice[byPrice.length - 1].id,
    fastestId: byDelivery[0].id,
    topRatedId: byRating[0].id,
  };
}

// ---- heuristic fallback for comparison -------------------------------------

function heuristicCompare(rfq, quotations) {
  const prices = quotations.map((q) => q.grandTotal);
  const days = quotations.map((q) => q.deliveryDays);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const minD = Math.min(...days);
  const maxD = Math.max(...days);
  const norm = (v, lo, hi, invert) => {
    if (hi === lo) return 1;
    const t = (v - lo) / (hi - lo);
    return invert ? 1 - t : t;
  };

  const ranking = quotations
    .map((q) => {
      const priceScore = norm(q.grandTotal, minP, maxP, true); // lower is better
      const deliveryScore = norm(q.deliveryDays, minD, maxD, true); // faster is better
      const ratingScore = (q.vendorRating || 0) / 5;
      const score = Math.round((priceScore * 0.5 + deliveryScore * 0.3 + ratingScore * 0.2) * 100);
      const strengths = [];
      const risks = [];
      if (q.grandTotal === minP) strengths.push('Lowest total price (L1)');
      if (q.deliveryDays === minD) strengths.push(`Fastest delivery (${q.deliveryDays} days)`);
      if ((q.vendorRating || 0) >= 4.5) strengths.push(`Strong vendor rating (${q.vendorRating})`);
      if (q.grandTotal === maxP) risks.push('Highest quoted price');
      if (q.deliveryDays === maxD) risks.push(`Slowest delivery (${q.deliveryDays} days)`);
      if ((q.vendorRating || 0) < 3.5) risks.push(`Below-average vendor rating (${q.vendorRating ?? 'n/a'})`);
      const premium = minP ? Math.round(((q.grandTotal - minP) / minP) * 100) : 0;
      if (premium > 0) risks.push(`${premium}% costlier than L1`);
      return { quotationId: q.id, vendorName: q.vendorName, score, strengths, risks };
    })
    .sort((a, b) => b.score - a.score);

  const top = ranking[0];
  const winner = quotations.find((q) => q.id === top.quotationId);
  return {
    recommendedQuotationId: top.quotationId,
    recommendationReason:
      `${winner.vendorName} offers the best weighted balance of price (50%), ` +
      `delivery (30%) and vendor rating (20%) for this RFQ.`,
    summary:
      `${quotations.length} quotations compared. Price range ` +
      `₹${minP.toLocaleString('en-IN')}–₹${maxP.toLocaleString('en-IN')}, ` +
      `delivery ${minD}–${maxD} days.`,
    ranking,
    flags: [],
    engine: 'heuristic',
  };
}

// ---- public: compare quotations --------------------------------------------

export async function compareQuotations({ rfq, quotations }) {
  const metrics = objectiveMetrics(quotations);
  if (!quotations.length) {
    return { ...metrics, ranking: [], summary: 'No quotations to compare.', engine: provider() };
  }

  if (provider() === 'heuristic') {
    return { ...heuristicCompare(rfq, quotations), ...metrics };
  }

  const system =
    'You are a senior procurement analyst for an Indian B2B company. You evaluate ' +
    'vendor quotations on price, delivery time, vendor reliability/rating, payment ' +
    'terms and stated risks. Be objective and concise. Respond ONLY with valid JSON, ' +
    'no markdown, no commentary.';

  const compact = quotations.map((q) => ({
    quotationId: q.id,
    vendor: q.vendorName,
    grandTotal: q.grandTotal,
    deliveryDays: q.deliveryDays,
    paymentTerms: q.paymentTerms,
    vendorRating: q.vendorRating ?? null,
    notes: q.notes || '',
  }));

  const user =
    `RFQ: ${rfq?.title || 'N/A'} (budget ₹${rfq?.budget ?? 'n/a'}, category ${rfq?.category || 'n/a'}).\n` +
    `Quotations:\n${JSON.stringify(compact, null, 2)}\n\n` +
    'Return JSON shaped exactly as:\n' +
    '{ "recommendedQuotationId": string, "recommendationReason": string, ' +
    '"summary": string, "ranking": [ { "quotationId": string, "vendorName": string, ' +
    '"score": number (0-100), "strengths": string[], "risks": string[] } ], ' +
    '"flags": string[] }. Rank best-first.';

  try {
    const result = await chatJSON({ system, user });
    return { ...result, ...metrics, engine: provider() };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[ai] compareQuotations fell back to heuristic:', err.message);
    return { ...heuristicCompare(rfq, quotations), ...metrics, engine: 'heuristic-fallback' };
  }
}

// ---- public: generate an RFQ draft from plain language ---------------------

function heuristicRfq(prompt) {
  const qtyMatch = prompt.match(/(\d{1,6})\s*(units?|nos|pcs|pieces|laptops|chairs|kg|tons?|reams|licen[cs]es?)?/i);
  const qty = qtyMatch ? Number(qtyMatch[1]) : 1;
  const title = prompt.trim().slice(0, 70).replace(/\.$/, '');
  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    category: 'General',
    description: `Auto-drafted from request: "${prompt.trim()}". Please review and refine specs, quantities and delivery terms before publishing.`,
    items: [{ name: title, quantity: qty, unit: 'nos', specs: '' }],
    suggestedCategories: ['General', 'IT Hardware', 'Office Supplies', 'Raw Materials', 'Logistics & Transport'],
    suggestedDeadlineDays: 14,
    notes: 'Generated by the local fallback engine. Add an AI key for richer drafts.',
    engine: 'heuristic',
  };
}

export async function generateRfq({ prompt }) {
  if (!prompt || !prompt.trim()) throw new Error('A description of what you need is required.');

  if (provider() === 'heuristic') return heuristicRfq(prompt);

  const system =
    'You convert a procurement officer\'s plain-language need into a structured RFQ ' +
    'for an Indian company. Infer sensible line items, quantities and units. Respond ' +
    'ONLY with valid JSON, no markdown.';
  const user =
    `Need: "${prompt.trim()}"\n\n` +
    'Return JSON shaped exactly as:\n' +
    '{ "title": string, "category": string, "description": string, ' +
    '"items": [ { "name": string, "quantity": number, "unit": string, "specs": string } ], ' +
    '"suggestedCategories": string[], "suggestedDeadlineDays": number, "notes": string }.';

  try {
    const result = await chatJSON({ system, user });
    return { ...result, engine: provider() };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[ai] generateRfq fell back to heuristic:', err.message);
    return { ...heuristicRfq(prompt), engine: 'heuristic-fallback' };
  }
}

// ---- public: natural-language insight over procurement data ----------------

export async function askInsight({ question, context }) {
  if (!question || !question.trim()) throw new Error('A question is required.');

  if (provider() === 'heuristic') {
    return {
      answer:
        'AI insights need an ANTHROPIC_API_KEY or OPENAI_API_KEY. Once set, ask questions ' +
        'like "which vendor has the highest spend?" or "what is overdue this month?".',
      engine: 'heuristic',
    };
  }

  const system =
    'You are VendorBridge\'s procurement analytics assistant. Answer the user\'s ' +
    'question using ONLY the provided JSON context. Be brief and specific with numbers. ' +
    'Respond ONLY with valid JSON: { "answer": string }.';
  const user = `Context:\n${JSON.stringify(context).slice(0, 12000)}\n\nQuestion: ${question.trim()}`;

  try {
    const result = await chatJSON({ system, user, maxTokens: 600 });
    return { answer: result.answer || 'No answer produced.', engine: provider() };
  } catch (err) {
    return { answer: `AI request failed: ${err.message}`, engine: 'error' };
  }
}

export default { compareQuotations, generateRfq, askInsight, aiStatus };
