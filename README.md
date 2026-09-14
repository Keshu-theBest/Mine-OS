# Connecting a real backend to MineOS AI

This document is for someone who has **never wired a frontend to a backend before**. It assumes no prior knowledge — every term is explained the first time it's used. By the end, you'll understand exactly what your backend team needs to build, and exactly which lines of code to change to plug it in.

Take your time with Part 1 before touching any code. Understanding the shape of the problem makes everything after it much easier.

---

## Part 1 — The mental model (read this first)

### What you have right now

This project is a **static frontend** — a collection of HTML, CSS, and JavaScript files with no server of its own. Every number, chart, and table you see is coming from fake data stored in plain JavaScript files, sitting in the `js/data/mock/` folder. Open `js/data/mock/dashboard.js` and you'll literally see the "82%" reserve confidence number sitting there as text.

This was done on purpose. Every page was built to call **one single file** — `js/services/api.js` — whenever it needs data, instead of reading the mock files directly. That file is the seam between "fake data" and "real data." Right now, `api.js` quietly hands back the mock data. Your job is to make it fetch real data from your backend instead.

Nothing else in the project needs to change. Not the HTML, not the CSS, not the page scripts that draw the charts and tables. They all just call functions like `Api.getDashboardSummary()` and use whatever comes back — they don't know or care whether it came from a mock file or a real server.

### What a "backend" actually is, in plain terms

Your frontend (this project) runs in the user's browser. It can't directly read a database or run an AI model — browsers aren't allowed to do that, for security reasons. So instead, the frontend sends a request over the internet (or your local network) to a separate program — the **backend** — asking "what's the current production forecast?" The backend does the real work (querying a database, running a model, whatever) and sends back an answer as **JSON** (a text format for structured data — it looks like `{ "value": 82 }`).

This request/response pattern is usually built as a **REST API**: a set of URLs (called **endpoints**), each one doing one job, reached with an HTTP method:
- **GET** — "give me some data" (doesn't change anything)
- **POST** — "here's some data, do something with it" (create, trigger, update)

For example, `GET /production/forecast` means "give me the production forecast." `POST /decisions/REC-101/accept` means "mark recommendation REC-101 as accepted."

### The three things you need to do

1. **Build the backend** — a server (in any language/framework you like) that exposes the endpoints listed in Part 3 below, returning JSON in the shapes shown.
2. **Point the frontend at it** — edit `js/services/api.js` to call your real endpoints instead of the mock data (Part 2 shows exactly how).
3. **Handle login for real** — right now, typing anything into the sign-in form on `index.html` just redirects to the dashboard. Part 4 covers wiring this up properly, and it's optional if you don't need real user accounts yet.

---

## Part 2 — Editing `api.js` (the part that actually matters)

Open `js/services/api.js`. At the top you'll see:

```javascript
const Api = (() => {
  const BASE_URL = "/api/v1"; // not used yet — placeholder for the real backend
  const LATENCY_MS = 260;     // simulated network delay so loading states are visible

  function ok(data, meta) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ data, meta: meta || {}, error: null }), LATENCY_MS);
    });
  }
```

`BASE_URL` is the web address of your backend. Change it to wherever your backend actually runs, for example:

```javascript
const BASE_URL = "http://localhost:8000/api/v1";   // while developing locally
// or, once deployed:
const BASE_URL = "https://api.mineos-moil.com/api/v1";
```

Below that, every function follows the same pattern. Here's one, exactly as it exists today:

```javascript
// GET /dashboard/summary
getDashboardSummary() {
  return ok(window.MockData.dashboardSummary.kpis, window.MockData.dashboardSummary.meta);
},
```

The comment above each function already tells you which real endpoint it's supposed to call — that mapping was planned in from the start. To make it real, replace the body with a `fetch()` call. `fetch()` is the browser's built-in function for making a network request. Here's the same function, rewritten to call a real backend:

```javascript
// GET /dashboard/summary
async getDashboardSummary() {
  const response = await fetch(`${BASE_URL}/dashboard/summary`);
  const json = await response.json();
  return { data: json.data, meta: json.meta, error: null };
},
```

Walking through what changed:
- Added the `async` keyword before the function name — this is required any time a function uses `await` inside it.
- `fetch(...)` sends the actual network request. The backend's URL is `${BASE_URL}/dashboard/summary`, which combines the base URL you set above with this endpoint's path.
- `await` means "pause here until the response comes back." Without it, the code would try to use the response before the network request finished.
- `response.json()` converts the raw response into a JavaScript object you can work with. This is also asynchronous, hence the second `await`.
- The function still returns an object shaped like `{ data, meta, error }` — exactly what it returned before, as a mock. This is the part that matters most: **as long as your backend returns data in the shapes shown in Part 3, and you keep this `{ data, meta, error }` return shape, none of the page-level code has to change at all.**

### Doing this for every function

Every function in `api.js` needs the same treatment: add `async`, replace the mock lookup with a `fetch()` call to the URL in the comment above it, `await` the `.json()`, and return `{ data, meta, error }`.

For endpoints that take an ID or a parameter (like `getEquipmentDetail(id)` or `getProductionForecast(range)`), put that value into the URL:

```javascript
// GET /maintenance/equipment/{id}
async getEquipmentDetail(id) {
  const response = await fetch(`${BASE_URL}/maintenance/equipment/${id}`);
  const json = await response.json();
  return { data: json.data, meta: json.meta, error: null };
},
```

For the `POST` functions — the ones that change something, like accepting a recommendation — you need to tell `fetch()` to send a POST request instead of the default GET, and (if you're sending data) include it as JSON in the request body:

```javascript
// POST /decisions/{id}/accept | /reject | /snooze
async setRecommendationStatus(id, status) {
  const response = await fetch(`${BASE_URL}/decisions/${id}/${status}`, {
    method: "POST"
  });
  const json = await response.json();
  return { data: json.data, meta: json.meta, error: null };
},
```

And one that sends a body of data (`runSimulation`, which sends slider values):

```javascript
// POST /simulator/run
async runSimulation(params) {
  const response = await fetch(`${BASE_URL}/simulator/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  const json = await response.json();
  return { data: json.data, meta: json.meta, error: null };
},
```

`headers: { "Content-Type": "application/json" }` tells the backend "the data I'm sending you is JSON." `JSON.stringify(params)` converts the JavaScript object into a JSON text string, since that's what gets sent over the network — you can't send a JavaScript object directly.

You can convert the functions one at a time and test as you go — the app will keep working, with some pages still using mock data and others using your real backend, until you've converted them all. There's no requirement to do this all at once.

### Handling errors

Right now, nothing in `api.js` handles the backend being down or returning an error. At minimum, wrap each call in a `try/catch` so one broken endpoint doesn't crash the page:

```javascript
async getDashboardSummary() {
  try {
    const response = await fetch(`${BASE_URL}/dashboard/summary`);
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    const json = await response.json();
    return { data: json.data, meta: json.meta, error: null };
  } catch (err) {
    console.error("getDashboardSummary failed:", err);
    return { data: null, meta: {}, error: err.message };
  }
},
```

`response.ok` is `true` for successful responses (status codes 200–299) and `false` for errors (like 404 "not found" or 500 "server error"). Page scripts currently assume `data` will always be usable, so if you add this error handling, you'll also want to check `error` in the page scripts before using `data` — but that's an enhancement you can add later, not a blocker to getting things connected.

---

## Part 3 — Endpoint reference

This is the full list of endpoints the frontend expects, in the order you'll probably want to build them (most-visible pages first). For each one: the HTTP method, the path, what it's for, and a realistic example of the JSON it should return, based on the current mock data.

Every response should be wrapped as:

```json
{ "data": <the actual content>, "meta": { "generated_at": "2026-09-08T06:00:00Z" } }
```

`meta` is small metadata about the response — when it was generated, which model version produced it, and so on. It's optional to populate fully, but the frontend expects the key to exist.

### Dashboard

**`GET /dashboard/summary`** — the four KPI tiles on the executive dashboard.

```json
{
  "data": [
    { "label": "Reserve confidence", "value": 82, "unit": "%", "trend": "up", "delta": "+3 pts vs last week" },
    { "label": "Production forecast accuracy", "value": 91, "unit": "%", "trend": "flat", "delta": "steady vs last week" },
    { "label": "Equipment health index", "value": 76, "unit": "/100", "trend": "down", "delta": "-4 pts vs last week" },
    { "label": "Fleet utilization", "value": 68, "unit": "%", "trend": "up", "delta": "+2 pts vs last week" }
  ],
  "meta": { "generated_at": "2026-09-08T06:20:00Z" }
}
```
`trend` must be `"up"`, `"down"`, or `"flat"` — it controls the colour of the little arrow.

### Exploration

**`GET /exploration/reserves`** — predicted/confirmed manganese reserve zones.

```json
{
  "data": [
    { "id": "Z-14", "name": "North Ridge Block", "confidence": 0.82, "status": "predicted", "cx": 210, "cy": 150, "r": 46 },
    { "id": "Z-09", "name": "Central Trough", "confidence": 0.91, "status": "confirmed", "cx": 420, "cy": 260, "r": 58 }
  ],
  "meta": { "generated_at": "2026-09-08T04:00:00Z", "model_version": "reserve-predict-v0.5" }
}
```
`status` must be `"predicted"`, `"confirmed"`, or `"low-confidence"`. `cx`/`cy`/`r` position the zone on the schematic map (a 800×500 coordinate grid) — swap these for real coordinates once the GIS map is wired up; see the note in Part 5.

**`POST /exploration/predict`** — triggers a new prediction run. Takes no request body; returns the same shape as `GET /exploration/reserves` above, with updated confidence values.

### Ore Intelligence

**`GET /ore/blocks`**

```json
{
  "data": [
    { "block": "Block A-1", "zone": "Central Trough", "grade": 46.2, "priority": 1, "tonnage": 18400 }
  ],
  "meta": { "generated_at": "2026-09-08T04:00:00Z" }
}
```

### Production

**`GET /production/forecast?range=daily|weekly|monthly`** — note the `range` query parameter selects which time granularity to return.

```json
{
  "data": {
    "labels": ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    "actual":   [11800, 12100, 11650, 11200, 10890, 10510, null],
    "forecast": [11750, 12050, 11700, 11150, 10800, 10480, 9920]
  },
  "meta": { "generated_at": "2026-09-08T06:00:00Z", "model_version": "prod-forecast-v0.3" }
}
```
Use `null` for any point that hasn't happened yet (the chart draws the forecast as a dashed line from that point onward).

**`GET /production/shortfall-explanation`**

```json
{
  "data": {
    "headline": "Forecast dips below the 10,000t monthly threshold in the next cycle.",
    "factors": [
      { "label": "Below-average rainfall reducing haul-road usability", "weight": 0.38 },
      { "label": "Two haul trucks flagged for maintenance (Fleet Bay 3, 7)", "weight": 0.31 }
    ]
  },
  "meta": { "generated_at": "2026-09-08T06:00:00Z" }
}
```
`weight` values are shown as a percentage bar — they don't need to add up to exactly 1.0, but it reads best if they roughly do.

### Predictive Maintenance

**`GET /maintenance/equipment`**

```json
{
  "data": [
    { "id": "TRK-07", "name": "Haul Truck 07", "type": "Haul Truck", "status": "critical", "rulDays": 6, "failureProb": 0.71, "sensor": [78, 81, 84, 88, 91, 94, 97] }
  ],
  "meta": { "generated_at": "2026-09-08T05:30:00Z", "model_version": "rul-predict-v0.2" }
}
```
`status` must be `"good"`, `"watch"`, or `"critical"`. `rulDays` is Remaining Useful Life in days. `sensor` is a 7-point trend line, oldest reading first.

**`GET /maintenance/equipment/{id}`** — same shape as one item above, for a single asset.

### Fleet

**`GET /fleet/trucks`**

```json
{
  "data": [
    { "id": "TRK-01", "x": 180, "y": 220, "status": "hauling" }
  ],
  "meta": { "generated_at": "2026-09-08T06:10:00Z" }
}
```
`status` must be `"hauling"`, `"idle"`, `"maintenance"`, or `"returning"`. `x`/`y` are schematic map coordinates (see the Exploration note above).

**`GET /fleet/dispatch-queue`**

```json
{
  "data": [
    { "truck": "TRK-01", "route": "Block A-1 → Crusher 2", "eta": "8 min" }
  ],
  "meta": { "generated_at": "2026-09-08T06:10:00Z" }
}
```

**`POST /fleet/optimize-dispatch`** — no request body; returns the same shape as the dispatch queue above, recalculated.

### Space Intelligence

**`GET /space/layers`**

```json
{
  "data": {
    "ndvi":     { "label": "NDVI (vegetation)", "color": "#3C7A50" },
    "lst":      { "label": "Land Surface Temp.", "color": "#AE4438" },
    "dem":      { "label": "Elevation (DEM)", "color": "#3D6E8F" },
    "rainfall": { "label": "Rainfall", "color": "#5A7C99" }
  },
  "meta": { "generated_at": "2026-09-07T00:00:00Z", "source": "Sentinel-2 / Landsat composite" }
}
```

**`GET /space/impact-summary`**

```json
{ "data": "Vegetation index over the North Ridge buffer zone has declined 6% since June...", "meta": {} }
```

### Decision Intelligence

**`GET /decisions?limit=N`** — `limit` is optional; omit it to get everything.

```json
{
  "data": [
    {
      "id": "REC-101", "module": "Production + Fleet", "confidence": 0.84, "status": "pending",
      "title": "Reroute two trucks from Block E-4 to Block C-3 for the next 3 shifts",
      "why": "Block C-3 ore grade is 8% higher and two haul trucks are already idled near that block...",
      "sourceModules": ["Production Intelligence", "Fleet Intelligence", "Ore Intelligence"]
    }
  ],
  "meta": { "generated_at": "2026-09-08T06:00:00Z", "model_version": "decision-fusion-v0.1" }
}
```
`status` must be `"pending"`, `"accepted"`, `"rejected"`, or `"snoozed"`.

**`POST /decisions/{id}/accept`**, **`POST /decisions/{id}/reject`**, **`POST /decisions/{id}/snooze`** — no request body; return the single updated recommendation object.

### Digital Twin

**`GET /digital-twin/status`**

```json
{
  "data": [
    { "id": "H-1", "x": 22, "y": 38, "status": "good", "label": "North Ridge Block", "detail": "Active — 2 drills operating" }
  ]
}
```
`x`/`y` here are **percentages** (0–100) positioning the marker over the schematic image, not pixel coordinates.

### Scenario Simulator

**`POST /simulator/run`** — request body:
```json
{ "rainfall": 50, "fleetSize": 20, "shiftHours": 8 }
```
Response:
```json
{ "data": { "before": 10510, "after": 9800, "params": { "rainfall": 50, "fleetSize": 20, "shiftHours": 8 } } }
```

### Reports

**`GET /reports?range=&module=`**

```json
{
  "data": {
    "productionTotal": 10510,
    "recommendationsAccepted": 14,
    "recommendationsRejected": 3,
    "avgConfidence": 0.79
  }
}
```

### Alerts

**`GET /alerts?limit=N`**

```json
{
  "data": [
    { "id": "A-401", "time": "06:12", "severity": "critical", "module": "Maintenance", "text": "Haul Truck 07 vibration sensor exceeded critical threshold" }
  ],
  "meta": { "generated_at": "2026-09-08T06:20:00Z" }
}
```
`severity` must be `"critical"`, `"watch"`, or `"info"`.

### Settings

**`GET /settings/data-sources`**

```json
{
  "data": [
    { "name": "SAP ERP", "status": "connected", "meta": "Synced 4 min ago · production, inventory" }
  ]
}
```
`status` must be `"connected"` or `"pending"`.

---

## Part 4 — Login and authentication (optional, but recommended before a real launch)

Right now, `index.html` doesn't actually check the email/password against anything:

```javascript
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  window.location.href = "dashboard.html";
});
```

It just goes straight to the dashboard. This is fine for a demo, but obviously not fine for anything real. Here's the shape of a proper fix:

1. **Add a login endpoint on your backend**, typically `POST /auth/login`, that takes `{ "email": "...", "password": "..." }` and, if correct, returns a **token** — a piece of text that proves "this browser is logged in" for future requests. A common format is a JWT (JSON Web Token), but the details are up to your backend team.

2. **Update the login form's script** to call that endpoint and store the token:

```javascript
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    alert("Sign-in failed. Check your email and password.");
    return;
  }

  const { token } = await response.json();
  localStorage.setItem("mineos_token", token); // saved in the browser for later requests
  window.location.href = "dashboard.html";
});
```

   `localStorage` is the browser's built-in place to save small pieces of data between page loads — it survives a refresh, unlike a normal JavaScript variable.

3. **Send the token with every API request**, so the backend knows who's asking. In `api.js`, this means adding an `Authorization` header to every `fetch()` call:

```javascript
function authHeaders() {
  const token = localStorage.getItem("mineos_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

// example usage inside a function:
const response = await fetch(`${BASE_URL}/dashboard/summary`, {
  headers: authHeaders()
});
```

4. **Protect the other pages**, so someone can't just type `dashboard.html` into the address bar without logging in first. A simple approach: at the top of each page's script (or in `nav.js`, since it already runs on every page), check whether a token exists and redirect to the login page if not:

```javascript
if (!localStorage.getItem("mineos_token")) {
  window.location.href = "index.html";
}
```

This is genuinely a bigger topic than the rest of this document — real authentication also involves token expiry, refresh tokens, and secure storage considerations. Treat the above as "enough to get a working login," and loop in your backend team if this needs to be production-grade (e.g. handling real MOIL employee accounts).

---

## Part 5 — CORS (the error you will almost certainly hit first)

The very first time you point the frontend at a real backend running on a different address (like `localhost:8000` while the frontend is opened from a file, or a different domain in production), you'll likely see this in the browser console:

> Access to fetch at 'http://localhost:8000/api/v1/dashboard/summary' from origin 'null' has been blocked by CORS policy...

This is not a bug in your code. **CORS** (Cross-Origin Resource Sharing) is a browser security rule: by default, a web page is not allowed to fetch data from a different address than the one it was loaded from, unless that other server explicitly says "requests from this origin are allowed." Your backend needs to send a header saying so.

Fixes, by backend framework:

**Node.js / Express:**
```javascript
const cors = require("cors");
app.use(cors()); // allows all origins — fine for development
// for production, restrict it:
app.use(cors({ origin: "https://your-frontend-domain.com" }));
```

**Python / FastAPI:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict this in production
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Python / Flask:**
```python
from flask_cors import CORS
CORS(app)
```

If you're not sure which framework your backend team is using, just tell them: "the frontend needs CORS enabled for our domain" — any backend framework has a standard way to do this.

---

## Part 6 — Testing your work as you go

You don't need your whole backend finished before testing. Convert and test one endpoint at a time:

1. Open the browser's developer tools (right-click → Inspect → Network tab). This shows every request the page makes.
2. Convert one function in `api.js` (say, `getDashboardSummary`).
3. Reload the dashboard page. You should see a new request to your backend's URL in the Network tab.
4. Click that request to see exactly what came back. If the shape matches what's in Part 3, the KPI tiles should show your real numbers.
5. If something looks wrong, check the Console tab (next to Network) for red error messages — they'll usually tell you exactly what went wrong (a 404 means the URL is wrong, a CORS error means Part 5 above, and so on).

Suggested order to wire things up, easiest/most-visible first: **dashboard → alerts → recommendations (decision-center) → production → maintenance → the rest.**

---

## Part 7 — Common errors and what they mean

| What you see | What it means | Fix |
|---|---|---|
| `Failed to fetch` in the console | The backend isn't running, or the URL in `BASE_URL` is wrong | Check the backend is running and the address matches |
| CORS error mentioning "blocked by CORS policy" | See Part 5 | Enable CORS on the backend |
| Page shows nothing / stays on the loading skeleton forever | The response shape doesn't match what the page script expects | Compare your JSON to the examples in Part 3 |
| `Uncaught (in promise) TypeError: Cannot read properties of undefined` | Your backend's JSON is missing a field the page expects (e.g. no `data` key) | Make sure every response is wrapped as `{ "data": ..., "meta": ... }` |
| Mixed content warning / request silently fails in production | Frontend is served over `https://` but `BASE_URL` points to `http://` | Serve your backend over HTTPS too, or use a matching protocol |
| 401 or 403 errors after adding login | Token isn't being sent, or has expired | Check `authHeaders()` is included in the fetch call; check token storage |

---

## Glossary

- **Backend** — the server-side program that stores/computes data and answers requests from the frontend.
- **Frontend** — the part that runs in the browser (this project).
- **API / endpoint** — a specific URL on the backend that does one job (e.g. `GET /alerts`).
- **REST** — a common style of designing APIs around URLs and HTTP methods (GET, POST, etc.).
- **JSON** — a text format for structured data, e.g. `{"name": "TRK-07", "status": "critical"}`. Both JavaScript and virtually every backend language can read and write it natively.
- **`fetch()`** — the browser's built-in function for making a network request from JavaScript.
- **Promise / `async` / `await`** — JavaScript's way of handling things that take time (like a network request) without freezing the page while waiting.
- **CORS** — a browser security rule requiring the backend to explicitly allow requests from the frontend's address.
- **Token / JWT** — a piece of text proving a user is logged in, sent with each request after login.
- **`localStorage`** — a small browser-provided storage space that persists between page loads.

---

## Quick checklist

- [ ] Backend built with the endpoints in Part 3, each returning `{ "data": ..., "meta": ... }`
- [ ] CORS enabled on the backend for the frontend's address
- [ ] `BASE_URL` in `js/services/api.js` updated to point at the backend
- [ ] Each function in `api.js` converted from mock lookup to `fetch()` (Part 2)
- [ ] Tested one page at a time using the browser's Network/Console tabs
- [ ] (Optional) Real login wired up per Part 4
