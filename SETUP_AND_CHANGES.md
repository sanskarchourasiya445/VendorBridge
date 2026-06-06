# VendorBridge — MongoDB + AI Upgrade

Yeh document batata hai kya add/change hua, MongoDB Atlas aur AI kaise setup karna
hai, kaise run karna hai, aur problem statement ke hisaab se kya abhi baaki hai.

---

## 1. Kya add / change hua (summary)

### Backend — MongoDB Atlas persistence
Pehle data sirf in-memory tha (server restart pe reset). Ab data MongoDB Atlas
pe persist hota hai, lekin app ka fast synchronous model waisa hi rehta hai.

- **`backend/src/config/db.js`** *(naya)* — Atlas se connect karta hai, har
  collection ko DB se load karta hai, pehli baar empty hone par seed daalta hai,
  aur har create/update/delete ko Atlas me mirror (write-through) karta hai.
- **`backend/src/models/Collection.js`** *(modified)* — `hydrate()` aur ek
  write-through persistence hook add hua. `MONGODB_URI` set na ho to behaviour
  bilkul pehle jaisa (pure in-memory) — project bina DB ke bhi chalega.
- **`backend/src/server.js`** *(modified)* — listen karne se pehle `initDatabase()`
  call hota hai + clean shutdown.
- **`backend/package.json`** — `mongodb` driver add hua.
- **`backend/.env.example`** — `MONGODB_URI`, `MONGODB_DB`, AI keys add hue.

### Backend — AI features
- **`backend/src/services/aiService.js`** *(naya)* — Claude (Anthropic) ya OpenAI
  use karta hai. **Key na ho to bhi** ek local heuristic se kaam karta hai (demo
  safe). 3 functions: `compareQuotations`, `generateRfq`, `askInsight`.
- **`backend/src/controllers/aiController.js`** + **`routes/aiRoutes.js`** *(naye)*
- **`backend/src/routes/index.js`** *(modified)* — `/api/ai/*` mount hua.

New endpoints:
| Method | Path | Kaam |
|--------|------|------|
| GET  | `/api/ai/status` | AI enabled hai ya nahi |
| POST | `/api/ai/compare-quotations` | quotations analyze + best vendor recommend |
| POST | `/api/ai/generate-rfq` | plain text se RFQ draft |
| POST | `/api/ai/insights` | data pe natural-language Q&A |

### Frontend — naye screens (problem statement ka gap bhara)
- **`frontend/src/lib/api.js`** *(naya)* — backend API client.
- **`frontend/src/pages/Quotations/QuotationCompare.jsx`** *(naya)* — **side-by-side
  quotation comparison** (lowest-price highlight, fastest delivery, vendor rating)
  + **"Analyze with AI"** button jo recommendation deta hai. Yeh problem statement
  ka **Quotation Comparison Screen** hai jo pehle missing tha.
- **`frontend/src/pages/Quotations/Quotations.jsx`** *(modified)* — Register / Compare tabs.
- **`frontend/src/pages/RFQ/AiRfqModal.jsx`** *(naya)* — "AI Draft" modal.
- **`frontend/src/pages/RFQ/RFQ.jsx`** *(modified)* — "AI Draft" button.
- **`frontend/.env.example`** *(naya)* — `VITE_API_URL`.

---

## 2. MongoDB Atlas setup (free tier)

1. https://www.mongodb.com/cloud/atlas pe free account banao, ek **M0 cluster** create karo.
2. **Database Access** → ek user banao (username + password yaad rakho).
3. **Network Access** → `0.0.0.0/0` allow karo (demo ke liye; production me restrict karna).
4. **Connect → Drivers → Node.js** → connection string copy karo, kuch aisa:
   ```
   mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. `backend/.env` me daalo:
   ```
   MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=vendorbridge
   ```
Pehli baar server start karte hi seed data automatically Atlas me chala jaata hai.

---

## 3. AI setup (optional but recommended)

`backend/.env` me in dono me se **koi ek** daalo:
```
ANTHROPIC_API_KEY=sk-ant-...      # Claude (preferred)
# ya
OPENAI_API_KEY=sk-...             # OpenAI
```
Key na ho to AI endpoints fir bhi chalte hain (local heuristic se), bas
recommendations utne smart nahi honge. Model override karna ho to:
```
AI_MODEL=claude-3-5-sonnet-latest
```

> Note: jo bhi model use karo, woh aapke API key ke account me available hona
> chahiye. Galti se "model not found" aaye to `AI_MODEL` change kar dena.

---

## 4. Run

Do alag terminals:

```bash
# Terminal 1 — backend
cd backend
cp .env.example .env     # phir .env me Mongo URI + AI key bharo
npm install
npm run dev              # http://localhost:4000/api

# Terminal 2 — frontend
cd frontend
cp .env.example .env     # default API URL theek hai
npm install
npm run dev              # http://localhost:5173
```

---

## 5. Naye features test kaise kare

- **Quotation Comparison + AI**: app me **Quotations → Compare** tab. Ek RFQ
  select karo (jiske paas quotes hain), table me lowest price / fastest / rating
  highlight dikhega. **"Analyze with AI"** dabao → recommended vendor + reasoning.
- **AI RFQ Draft**: **RFQs → AI Draft** button → ek line me need likho
  (e.g. "60 laptops i7 16GB 3 saal warranty") → "Generate draft".
- **API direct** (backend chal raha ho):
  ```bash
  curl -X POST http://localhost:4000/api/ai/compare-quotations \
    -H 'content-type: application/json' -d '{"rfqId":"RFQ-001"}'
  ```

---

## 6. Problem statement ke hisaab se abhi kya baaki hai (next steps)

Yeh upgrade DB + AI + comparison screen pe focus karta hai. In items pe kaam
baaki hai (priority order):

1. **Frontend ko backend API se fully wire karna** — abhi list pages (Vendors,
   RFQ, etc.) mock data se chalte hain. `lib/api.js` me baaki resources (vendors,
   rfqs, …) add karke pages ko API pe shift karo, taaki Mongo ka data UI me dikhe.
   AI screens already backend se baat karte hain.
2. **RFQ creation form** — abhi "New RFQ" / AI Draft sirf draft deta hai; ek
   actual create form banao (attachments, deadline picker, vendor assignment) jo
   `POST /api/rfqs` ko hit kare. AI draft ko is form me pre-fill kar sakte ho.
3. **Vendor quotation submission** — vendor role ke liye apna screen (pricing,
   delivery, notes, editable quotation).
4. **Invoice: PDF / Print / Email** — `jspdf` already installed hai (PDF +
   Print client-side easily ho jayega). Email ke liye backend me ek endpoint
   (`POST /api/invoices/:id/email`) + `nodemailer` add karna hoga.
5. **Notifications screen** — Activity Logs hai; alerts ka dedicated view add karo.

> Honest note: maine MongoDB persistence, AI backend (3 endpoints), aur 2 sabse
> high-value frontend AI screens (Comparison + RFQ draft) deliver kiye hain —
> yeh aapke 2 explicit asks (Mongo + AI) aur sabse bada problem-statement gap
> (comparison) cover karta hai. Upar wale 5 items baaki development hain.
