from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="OfferSense API")

# Setup CORS to allow the frontend to fetch data
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (good for local dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

insights_data = {
    "tech": [
        {"role": 'Software Engineer (SDE)', "ctc": 8.5, "max": 15},
        {"role": 'Data Analyst', "ctc": 5.5, "max": 15},
        {"role": 'Data Scientist / ML', "ctc": 7.0, "max": 15},
        {"role": 'DevOps / Cloud', "ctc": 6.5, "max": 15},
        {"role": 'Frontend Developer', "ctc": 5.0, "max": 15},
        {"role": 'Cybersecurity', "ctc": 6.0, "max": 15},
    ],
    "nontech": [
        {"role": 'HR / People Ops', "ctc": 3.5, "max": 10},
        {"role": 'Business Analyst', "ctc": 5.0, "max": 10},
        {"role": 'Sales / BDM', "ctc": 4.0, "max": 10},
        {"role": 'Product Manager', "ctc": 7.0, "max": 10},
        {"role": 'Finance / Accounts', "ctc": 3.8, "max": 10},
        {"role": 'Content / Marketing', "ctc": 3.2, "max": 10},
    ],
    "company": [
        {"role": 'TCS', "ctc": 3.36, "max": 10},
        {"role": 'Infosys', "ctc": 3.6, "max": 10},
        {"role": 'Wipro', "ctc": 3.5, "max": 10},
        {"role": 'HCL Technologies', "ctc": 3.5, "max": 10},
        {"role": 'Accenture', "ctc": 4.5, "max": 10},
        {"role": 'Cognizant (CTS)', "ctc": 4.0, "max": 10},
    ],
    "city": [
        {"role": 'Bangalore (rent avg ₹15k)', "ctc": 15000, "max": 25000},
        {"role": 'Mumbai (rent avg ₹18k)', "ctc": 18000, "max": 25000},
        {"role": 'Delhi/NCR (rent avg ₹12k)', "ctc": 12000, "max": 25000},
        {"role": 'Hyderabad (rent avg ₹10k)', "ctc": 10000, "max": 25000},
        {"role": 'Pune (rent avg ₹9k)', "ctc": 9000, "max": 25000},
        {"role": 'Ahmedabad (rent avg ₹6k)', "ctc": 6000, "max": 25000},
    ]
}

glossary_terms = [
    {"name": 'CTC', "short": 'Cost to Company', "detail": 'Total amount a company spends on you annually. Includes basic pay, HRA, allowances, PF (employer\'s share), gratuity, and sometimes health insurance. CTC ≠ what you get in hand.'},
    {"name": 'In-Hand / Take-Home', "short": 'Net salary credited to your account', "detail": 'What you actually receive after all deductions — PF (your share), TDS, professional tax. Usually 65-80% of CTC for freshers.'},
    {"name": 'LPA', "short": 'Lakhs Per Annum', "detail": '1 LPA = ₹1,00,000 per year = ₹8,333/month (gross). So 6 LPA = ₹6,00,000/year. Always ask if the quoted LPA is CTC or in-hand!'},
    {"name": 'Gross Salary', "short": 'Monthly before deductions', "detail": 'Sum of Basic + HRA + all allowances per month. Tax and PF are deducted from this to get your net/in-hand.'},
    {"name": 'Basic Pay', "short": 'Core component (~40-50% of CTC)', "detail": 'Foundation of your salary. PF, gratuity, and leaves are calculated on basic. Higher basic = more PF, more gratuity, but less take-home.'},
    {"name": 'HRA', "short": 'House Rent Allowance', "detail": 'Allowance to cover rent. If you pay rent, you can claim tax exemption on HRA. Metro cities get 50% of basic, tier-2 cities get 40%.'},
    {"name": 'PF / EPF', "short": 'Employee Provident Fund', "detail": '12% of your basic salary is deducted and deposited in your PF account. Your employer also adds 12%. You get this on retirement or resignation after a certain period.'},
    {"name": 'TDS', "short": 'Tax Deducted at Source', "detail": 'Your employer deducts income tax monthly from your salary and pays it to the government on your behalf. Reflected in Form 16.'},
    {"name": 'Variable Pay', "short": 'Performance-linked bonus', "detail": 'Part of CTC that is NOT guaranteed. You get it based on your and company\'s performance. A 20% variable component in a 6 LPA offer means only 4.8 LPA is fixed.'},
    {"name": 'Gratuity', "short": 'Long-term loyalty bonus', "detail": 'Paid by employer after 5 years of continuous service. = (15 × basic × years) / 26. It\'s part of your CTC but you don\'t get it monthly.'},
    {"name": 'New vs Old Tax Regime', "short": 'Two tax calculation systems', "detail": 'New Regime (default): Lower rates, fewer deductions. Old Regime: Higher rates, but you can claim HRA, 80C, etc. For most freshers under 7 LPA, new regime = zero tax with rebate.'},
    {"name": '2x / 2.5x Salary', "short": 'Multiplier, not percentage', "detail": '2x means your new salary = 2 × current salary (100% hike). 2.5x = 150% hike. This is very different from 2% or 2.5% hike. Always clarify which is being offered!'},
]

@app.get("/api/insights")
def get_insights():
    """Returns salary insights data for the charts."""
    return insights_data

@app.get("/api/glossary")
def get_glossary():
    """Returns the glossary terms and definitions."""
    return {"terms": glossary_terms}
