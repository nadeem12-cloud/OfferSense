# OfferSense 💰

> **Decode your salary. Compare offers. Negotiate smarter.**  
> A free, no-signup salary intelligence tool built for Indian freshers entering the job market.

---

## Why OfferSense?

Every placement season, thousands of freshers accept offers without really understanding them.

- Is ₹6 LPA actually good for Bangalore?
- Which is better — ₹7 LPA with 20% variable, or ₹6 LPA fully fixed?
- What does "2.5x hike" even mean?
- How much of your CTC will you actually see in your bank account?

OfferSense answers all of this — instantly, without a spreadsheet, without a CA.

---

## Features

### 💰 CTC → In-Hand Breakdown
Enter your offer CTC and get a full monthly breakdown:
- Basic Pay, HRA, Special Allowance
- PF deduction, Professional Tax, TDS
- Estimated monthly in-hand with a visual doughnut chart
- Supports **New & Old Tax Regime** (FY2024-25)
- Handles whether **Employer PF is included in CTC or not** — a common source of confusion
- City-aware (Metro / Tier 2 / Remote)

### ⚖️ Offer Comparator
Compare two job offers side by side on what actually matters:
- Real take-home after commute costs
- Variable pay risk flagging (⚠️ if variable > 15%)
- Bar chart comparison across CTC, gross, in-hand, and real take-home
- Clear verdict on which offer wins and by how much per year

### 📈 Increment Simulator
Simulate any kind of hike:
- Percentage hike (e.g. 30%)
- Multiplier (e.g. 2x, 2.5x)
- Flat increase (e.g. +1.5 LPA)

Includes a **Common Confusion Cleared** box — explicitly explains the difference between `2.5x salary` and `2.5% hike`, which trips up almost every fresher.

### 📊 Salary Insights Dashboard
Static benchmarks sourced from AmbitionBox, Glassdoor & LinkedIn Salary (2023-24):
- Average fresher CTC by tech role (SDE, Data Analyst, ML, DevOps, etc.)
- Average fresher CTC by non-tech role (BA, HR, Product, Finance, etc.)
- Mass recruiter packages (TCS, Infosys, Wipro, HCL, Accenture, Cognizant)
- City-wise average rent cost so you can factor in cost of living

### 📖 Salary Glossary
12 key terms explained in plain language — CTC, LPA, Gross, In-Hand, PF, TDS, HRA, Variable Pay, Gratuity, Tax Regimes, and the infamous 2x/2.5x confusion. Click any card to expand.

### 📄 PDF Export
Every result (Breakdown, Comparison, Hike) can be exported as a PDF — useful for saving, sharing with family, or comparing offers offline.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS |
| Charts | Chart.js (CDN) |
| PDF Export | html2pdf.js (CDN) |
| Backend (optional, local dev) | FastAPI (Python) |
| Fonts | Syne, DM Sans, DM Mono (Google Fonts) |
| Deployment | GitHub Pages (frontend) |

No framework. No build step. No npm install. Just open the HTML file.

---

## Project Structure

```
offersense/
├── offersense.html       # Main HTML, page structure & nav
├── styles.css            # All styling, CSS variables, responsive layout
├── script.js             # All JS logic — salary math, charts, render functions
└── backend/
    └── main.py           # FastAPI server (optional — serves insights & glossary data)
```

---

## Running Locally

### Frontend only (recommended)
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/offersense.git
cd offersense

# Just open the HTML file — no server needed
open offersense.html
# or drag it into your browser
```

### With FastAPI backend (optional)
The backend serves the Insights and Glossary data via API. Only needed if you want to modify that data server-side.

```bash
# Install dependencies
pip install fastapi uvicorn

# Start the backend
cd backend
uvicorn main:app --reload

# Backend runs at http://127.0.0.1:8000
# API docs at http://127.0.0.1:8000/docs
```

> **Note:** The frontend falls back to static data if the backend is not running, so all features work on GitHub Pages without any backend.

---

## Deploying to GitHub Pages

1. Push the repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)`
4. Rename `offersense.html` → `index.html`
5. Your app is live at `https://YOUR_USERNAME.github.io/offersense`

---

## Salary Calculation Methodology

The tax and salary calculations are estimates based on standard Indian payroll structure. Here's what's assumed:

- **Basic Pay** = 45% of fixed CTC
- **HRA** = 50% of basic (Metro), 40% (Tier 2), 30% (Remote)
- **Special Allowance** = Gross − Basic − HRA
- **Employee PF** = 12% of basic, capped at ₹1,800/month (₹15,000 basic ceiling)
- **Professional Tax** = ₹200/month (waived for remote/small city)
- **Tax** = Calculated under New or Old Regime as selected, with 4% cess
- **Rebate u/s 87A** = Applied automatically (New: up to ₹7L; Old: up to ₹5L)

> Actual in-hand may vary by ±5-10% depending on company-specific structure, variable pay, reimbursements, and exact deductions.

---

## Disclaimer

Data in the Salary Insights section is sourced from publicly available reports on AmbitionBox, Glassdoor, and LinkedIn Salary (2023–24). These are approximate averages for freshers with 0–1 year of experience. Actual packages vary based on college tier, skills, and negotiation.

OfferSense is not a financial advisor. Use this as a reference tool, not a definitive calculation.

---

## Contributing

Found a bug? Have better salary data? Want to add a feature?

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push and open a PR

All contributions welcome — especially updated salary benchmarks, new city data, or UI improvements.

---

## Author

Built by **Nadeem Memon**  
B.Tech CSE | MBIT, Vallabh Vidyanagar  
[GitHub](https://github.com/nadeem12-cloud) · [LinkedIn](https://linkedin.com/in/nadeem10)

---

## License

MIT — free to use, modify, and share.