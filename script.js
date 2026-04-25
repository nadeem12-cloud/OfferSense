// ─── UTILS & TOAST NOTIFICATIONS ──────────────────────────────
function escapeHTML(str) {
  return String(str).replace(/[&<>'"]/g, match => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[match]));
}

function showToast(message, type = 'error') {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    document.body.appendChild(toast);
    const style = document.createElement('style');
    style.innerHTML = `
      #toast-notification {
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(100px);
        background: var(--red-dim); border: 1px solid var(--red); color: #fff;
        padding: 12px 24px; border-radius: 8px; font-weight: 500; font-size: 0.9rem;
        z-index: 1000; opacity: 0; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      #toast-notification.show { transform: translateX(-50%) translateY(0); opacity: 1; }
      #toast-notification.success { background: var(--teal-dim); border-color: var(--teal); }
    `;
    document.head.appendChild(style);
  }
  toast.className = `show ${type}`;
  toast.innerHTML = type === 'error' ? `⚠️ ${escapeHTML(message)}` : `✅ ${escapeHTML(message)}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── NAVIGATION ───────────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  
  const page = document.getElementById('page-' + id);
  page.classList.add('active');
  
  if (event) {
    event.target.classList.add('active');
    event.target.setAttribute('aria-selected', 'true');
  }
}

// ─── SALARY MATH ──────────────────────────────────────────────
function calcFromCTC(ctcLPA, city, companyType, variablePct = 0, taxRegime = 'new', pfIncluded = true) {
  const ctc = ctcLPA * 100000;
  const fixedCTC = ctc * (1 - variablePct / 100);
  const monthlyCTC = fixedCTC / 12;

  // Assume Basic is 45% of the fixed component
  const basic = monthlyCTC * 0.45;
  const pfEmployer = pfIncluded ? Math.min(basic * 0.12, 1800) : 0;
  const gratuity = pfIncluded ? (basic * 0.0481) : 0;

  // Gross is the monthly portion actually received before tax and employee PF
  const gross = pfIncluded ? (monthlyCTC - pfEmployer - gratuity) : monthlyCTC;

  // HRA & Special
  const hraRate = city === 'metro' ? 0.5 : city === 'tier2' ? 0.4 : 0.3;
  const hra = basic * hraRate;
  const specialAllowance = gross - basic - hra;

  // Employee deductions
  const pfEmployee = Math.min(basic * 0.12, 1800);
  const profTax = city === 'remote' ? 0 : 200;

  // TAX CALCULATION
  const stdDeduction = 50000;
  let deductions80C = 0;
  let hraExemptAnnual = 0;
  
  if (taxRegime === 'old') {
    // Estimating standard investments (80C) + partial rent exemption based on HRA
    deductions80C = 150000; 
    hraExemptAnnual = (hra * 12) * 0.8; 
  }

  let taxableAnnual = (gross * 12) - stdDeduction - deductions80C - hraExemptAnnual;
  if (taxableAnnual < 0) taxableAnnual = 0;

  let tax = 0;
  if (taxRegime === 'new') {
    // New regime slabs FY24-25
    if (taxableAnnual <= 300000) tax = 0;
    else if (taxableAnnual <= 700000) tax = (taxableAnnual - 300000) * 0.05;
    else if (taxableAnnual <= 1000000) tax = 20000 + (taxableAnnual - 700000) * 0.10;
    else if (taxableAnnual <= 1200000) tax = 50000 + (taxableAnnual - 1000000) * 0.15;
    else if (taxableAnnual <= 1500000) tax = 80000 + (taxableAnnual - 1200000) * 0.20;
    else tax = 140000 + (taxableAnnual - 1500000) * 0.30;
    
    // Rebate 87A
    if (taxableAnnual <= 700000 && tax <= 25000) tax = 0;
  } else {
    // Old regime slabs
    if (taxableAnnual <= 250000) tax = 0;
    else if (taxableAnnual <= 500000) tax = (taxableAnnual - 250000) * 0.05;
    else if (taxableAnnual <= 1000000) tax = 12500 + (taxableAnnual - 500000) * 0.20;
    else tax = 112500 + (taxableAnnual - 1000000) * 0.30;
    
    // Rebate 87A (Old)
    if (taxableAnnual <= 500000 && tax <= 12500) tax = 0;
  }

  // Add 4% cess
  tax = tax * 1.04;
  const taxMonthly = tax / 12;

  const inHand = gross - pfEmployee - profTax - taxMonthly;

  return {
    ctcAnnual: ctcLPA,
    monthly: monthlyCTC,
    gross, basic, hra, specialAllowance,
    pfEmployee, pfEmployer, profTax, taxMonthly,
    inHand: Math.round(inHand),
    variablePct
  };
}

function fmt(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

// ─── PAGE 1: BREAKDOWN ────────────────────────────────────────
let bChart = null;
function calcBreakdown() {
  const ctc = parseFloat(document.getElementById('b-ctc').value);
  const city = document.getElementById('b-city').value;
  const type = document.getElementById('b-type').value;
  const taxRegime = document.getElementById('b-tax-regime').value;
  const pfIncluded = document.getElementById('b-pf-included').value === 'yes';

  if (!ctc || ctc <= 0) { showToast('Please enter a valid CTC amount', 'error'); return; }

  const d = calcFromCTC(ctc, city, type, 0, taxRegime, pfIncluded);
  const box = document.getElementById('b-result');
  box.classList.add('show');

  const rows = [
    ['Basic Pay', fmt(d.basic), 'gold'],
    ['HRA (House Rent Allowance)', fmt(d.hra), ''],
    ['Special Allowance', fmt(d.specialAllowance), ''],
    ['─── Gross Monthly', fmt(d.gross), 'big'],
    ['PF Deduction (12% of Basic)', '- ' + fmt(d.pfEmployee), 'red'],
    ['Professional Tax', '- ' + fmt(d.profTax), 'red'],
    ['TDS / Income Tax (est.)', '- ' + fmt(d.taxMonthly), 'red'],
  ];

  document.getElementById('b-breakdown-rows').innerHTML = rows.map(([l, v, cls]) => `
    <div class="stat-row">
      <span class="stat-label">${l}</span>
      <span class="stat-value ${cls}">${v}</span>
    </div>`).join('');

  document.getElementById('b-inhand').textContent = fmt(d.inHand);
  document.getElementById('b-inhand-sub').textContent =
    `Annual in-hand ≈ ${fmt(d.inHand * 12)} | That's ${((d.inHand / d.monthly) * 100).toFixed(0)}% of your gross monthly`;

  document.getElementById('b-note').innerHTML =
    `<strong style="color:var(--text)">Note:</strong> Variable pay (if any) is NOT included above. 
    Gratuity (${fmt(d.basic * 0.0481 * 12)}/yr) is employer's cost — you get it only after 5 years. 
    Tax calculated under <strong style="color:var(--text)">${taxRegime === 'new' ? 'New Regime FY2024-25' : 'Old Regime (Assuming ₹1.5L 80C & est. HRA)'}</strong>. 
    Actual in-hand can vary by ±5-10%.`;

  if (bChart) bChart.destroy();
  const ctx = document.getElementById('b-chart').getContext('2d');
  bChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['In-Hand', 'PF', 'Tax', 'Prof. Tax'],
      datasets: [{
        data: [d.inHand, d.pfEmployee, d.taxMonthly, d.profTax],
        backgroundColor: ['#f5a623', '#00d4aa', '#ff5f6d', '#7a8299'],
        borderWidth: 0, hoverOffset: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#7a8299', font: { family: 'DM Sans', size: 11 } } }
      }
    }
  });
}

// ─── PAGE 2: COMPARE ──────────────────────────────────────────
let cChart = null;
function compareOffers() {
  const aName = document.getElementById('ca-name').value || 'Offer A';
  const bName = document.getElementById('cb-name').value || 'Offer B';
  const aCtc = parseFloat(document.getElementById('ca-ctc').value);
  const bCtc = parseFloat(document.getElementById('cb-ctc').value);
  const aVar = parseFloat(document.getElementById('ca-var').value) || 0;
  const bVar = parseFloat(document.getElementById('cb-var').value) || 0;
  const aCity = document.getElementById('ca-city').value;
  const bCity = document.getElementById('cb-city').value;
  const aCommute = parseFloat(document.getElementById('ca-commute').value) || 0;
  const bCommute = parseFloat(document.getElementById('cb-commute').value) || 0;

  if (!aCtc || !bCtc) { showToast('Enter valid CTC for both offers', 'error'); return; }

  const a = calcFromCTC(aCtc, aCity, 'mnc', aVar);
  const b = calcFromCTC(bCtc, bCity, 'mnc', bVar);

  // Commute deduction estimate
  const aReal = a.inHand - aCommute;
  const bReal = b.inHand - bCommute;

  const aWins = aReal >= bReal;

  document.getElementById('c-result').classList.add('show');

  const makeCard = (name, d, real, commuteCost, wins) => `
    <div class="offer-card ${wins ? 'winner' : 'loser'}">
      <div class="offer-title">
        ${escapeHTML(name)} ${wins ? '<span class="winner-badge">✓ Better</span>' : ''}
      </div>
      <div class="stat-row"><span class="stat-label">CTC</span><span class="stat-value gold">${d.ctcAnnual} LPA</span></div>
      <div class="stat-row"><span class="stat-label">Gross Monthly</span><span class="stat-value">${fmt(d.gross)}</span></div>
      <div class="stat-row"><span class="stat-label">Variable Pay</span><span class="stat-value ${d.variablePct > 15 ? 'red' : ''}">${d.variablePct}% of CTC ${d.variablePct > 15 ? '⚠️' : ''}</span></div>
      <div class="stat-row"><span class="stat-label">Est. In-Hand</span><span class="stat-value green">${fmt(d.inHand)}</span></div>
      <div class="stat-row"><span class="stat-label">Commute Est.</span><span class="stat-value red">- ${fmt(commuteCost)}</span></div>
      <div class="stat-row" style="font-weight:600"><span class="stat-label">Real Take-Home</span><span class="stat-value ${wins ? 'green' : ''} big">${fmt(real)}</span></div>
    </div>`;

  document.getElementById('c-offer-grid').innerHTML =
    makeCard(aName, a, aReal, aCommute, aWins) +
    makeCard(bName, b, bReal, bCommute, !aWins);

  const diff = Math.abs(aReal - bReal);
  const winner = aWins ? aName : bName;
  const loser = aWins ? bName : aName;

  document.getElementById('c-verdict').innerHTML = `
    <div class="highlight">
      <div class="h-label">🏆 Verdict</div>
      <div class="h-value" style="font-size:1.3rem">${escapeHTML(winner)} wins by ${fmt(diff)}/month</div>
      <div class="h-sub">That's ${fmt(diff * 12)} more per year in your pocket after commute costs.
      ${(aVar > 15 || bVar > 15) ? ' <br><span style="color:var(--red)">⚠️ High variable pay = risky. You may not get 100% of it.</span>' : ''}
      </div>
    </div>`;

  if (cChart) cChart.destroy();
  const ctx = document.getElementById('c-chart').getContext('2d');
  cChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['CTC (Annual ₹L)', 'Gross/mo (₹k)', 'In-Hand/mo (₹k)', 'Real Take-Home/mo (₹k)'],
      datasets: [
        {
          label: aName, // Chart.js implicitly escapes labels during rendering
          data: [aCtc, a.gross / 1000, a.inHand / 1000, aReal / 1000],
          backgroundColor: 'rgba(245,166,35,0.8)',
          borderRadius: 6
        },
        {
          label: bName,
          data: [bCtc, b.gross / 1000, b.inHand / 1000, bReal / 1000],
          backgroundColor: 'rgba(0,212,170,0.6)',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#7a8299', font: { family: 'DM Sans', size: 11 } } } },
      scales: {
        x: { ticks: { color: '#7a8299' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#7a8299' }, grid: { color: 'rgba(255,255,255,0.04)' } }
      }
    }
  });
}

// ─── PAGE 3: HIKE ─────────────────────────────────────────────
let hChart = null;
function toggleHikeInput() {
  const type = document.getElementById('h-type').value;
  const labels = { percent: 'Hike Percentage (%)', multiplier: 'Multiplier (e.g. 2 for 2x, 2.5 for 2.5x)', flat: 'Flat Increase (LPA)' };
  document.getElementById('h-input-label').textContent = labels[type];
  document.getElementById('h-value').placeholder = type === 'percent' ? '30' : type === 'multiplier' ? '2' : '1.5';
}

function calcHike() {
  const current = parseFloat(document.getElementById('h-current').value);
  const type = document.getElementById('h-type').value;
  const val = parseFloat(document.getElementById('h-value').value);
  const city = document.getElementById('h-city').value;

  if (!current || !val) { showToast('Fill in all fields with valid numbers', 'error'); return; }

  let newCTC;
  if (type === 'percent') newCTC = current * (1 + val / 100);
  else if (type === 'multiplier') newCTC = current * val;
  else newCTC = current + val;

  const actualPctHike = ((newCTC - current) / current * 100).toFixed(1);

  const before = calcFromCTC(current, city, 'mnc');
  const after = calcFromCTC(newCTC, city, 'mnc');

  document.getElementById('h-result').classList.add('show');

  document.getElementById('h-rows').innerHTML = `
    <div class="stat-row"><span class="stat-label">Current CTC</span><span class="stat-value">${current} LPA</span></div>
    <div class="stat-row"><span class="stat-label">New CTC</span><span class="stat-value gold">${newCTC.toFixed(2)} LPA</span></div>
    <div class="stat-row"><span class="stat-label">Actual % Hike</span><span class="stat-value green">+${actualPctHike}%</span></div>
    <div class="stat-row"><span class="stat-label">Monthly In-Hand Change</span><span class="stat-value green">+${fmt(after.inHand - before.inHand)}/mo</span></div>
    <div class="stat-row"><span class="stat-label">Annual In-Hand Change</span><span class="stat-value green">+${fmt((after.inHand - before.inHand) * 12)}/yr</span></div>
  `;
  
  document.getElementById('h-compare-cards').innerHTML = `
    <div class="offer-card">
      <div class="offer-title">Before Hike</div>
      <div class="stat-row"><span class="stat-label">CTC</span><span class="stat-value">${current} LPA</span></div>
      <div class="stat-row"><span class="stat-label">In-Hand</span><span class="stat-value">${fmt(before.inHand)}/mo</span></div>
    </div>
    <div class="offer-card winner">
      <div class="offer-title">After Hike <span class="winner-badge">New</span></div>
      <div class="stat-row"><span class="stat-label">CTC</span><span class="stat-value gold">${newCTC.toFixed(2)} LPA</span></div>
      <div class="stat-row"><span class="stat-label">In-Hand</span><span class="stat-value green">${fmt(after.inHand)}/mo</span></div>
    </div>
  `;

  // Show confusion box for multiplier
  const confBox = document.getElementById('h-confusion');
  if (type === 'multiplier') {
    confBox.style.display = 'block';
    confBox.innerHTML = `
      <div class="c-label">📌 Common Confusion Cleared</div>
      <p><strong>${val}x salary ≠ ${val * 100 - 100}% hike in the way you think.</strong><br>
      ${val}x means your new salary is <strong>${val} times</strong> the old one. 
      So a ${val}x hike on ${current} LPA = <strong>${(current * val).toFixed(1)} LPA</strong>, which is a <strong>${actualPctHike}% increase</strong>.<br><br>
      ${val === 2.5 ? `<strong>2.5x ≠ 2.5% hike!</strong> 2.5% hike would give you only ${(current * 1.025).toFixed(2)} LPA. 2.5x means ${(current * 2.5).toFixed(2)} LPA — a massive ${((2.5 - 1) * 100)}% jump.` : ''}
      </p>`;
  } else {
    confBox.style.display = 'none';
  }

  if (hChart) hChart.destroy();
  const ctx = document.getElementById('h-chart').getContext('2d');
  hChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['CTC (LPA)', 'In-Hand/mo (₹k)'],
      datasets: [
        { label: 'Before', data: [current, before.inHand / 1000], backgroundColor: 'rgba(122,130,153,0.5)', borderRadius: 6 },
        { label: 'After', data: [newCTC, after.inHand / 1000], backgroundColor: 'rgba(245,166,35,0.8)', borderRadius: 6 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#7a8299', font: { family: 'DM Sans', size: 11 } } } },
      scales: {
        x: { ticks: { color: '#7a8299' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#7a8299' }, grid: { color: 'rgba(255,255,255,0.04)' } }
      }
    }
  });
}

// ─── PAGE 4 & 5 COMPONENTS ──────────────────────────────────────
function renderBars(containerId, data, isCurrency = false, tealColor = false) {
  const container = document.getElementById(containerId);
  container.innerHTML = data.map(item => {
    const pct = (item.ctc / item.max) * 100;
    const display = isCurrency ? '₹' + item.ctc.toLocaleString('en-IN') + '/mo' : item.ctc + ' LPA';
    return `
      <div class="bar-item">
        <div class="bar-meta"><span class="role">${escapeHTML(item.role)}</span><span class="amt">${display}</span></div>
        <div class="bar-track"><div class="bar-fill ${tealColor ? 'teal' : ''}" style="width:0%" data-width="${pct}%"></div></div>
      </div>`;
  }).join('');

  // Animate bars
  setTimeout(() => {
    container.querySelectorAll('.bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  }, 100);
}

function renderGlossary(termsArray) {
  document.getElementById('glossary-grid').innerHTML = termsArray.map((t, i) => `
    <div class="term-card" tabindex="0" role="button" aria-expanded="false" onclick="toggleTerm(this, ${i})" onkeydown="if(event.key==='Enter'||event.key===' ')toggleTerm(this, ${i})">
      <div class="term-name">${escapeHTML(t.name)}</div>
      <div class="term-short">${escapeHTML(t.short)}</div>
      <div class="term-detail">${escapeHTML(t.detail)}</div>
    </div>`).join('');
}

function toggleTerm(element, i) {
  element.classList.toggle('open');
  const isOpen = element.classList.contains('open');
  element.setAttribute('aria-expanded', isOpen);
}

// ─── PDF EXPORT ───────────────────────────────────────────────
function exportPDF(elementId, filename) {
  const element = document.getElementById(elementId);
  
  // Temporarily hide the export button during capture
  const exportBtn = element.querySelector('.export-btn');
  if (exportBtn) exportBtn.style.display = 'none';

  const opt = {
    margin:       0.5,
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#080c14' },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    if (exportBtn) exportBtn.style.display = 'inline-block';
    showToast('Report downloaded successfully!', 'success');
  }).catch((err) => {
    if (exportBtn) exportBtn.style.display = 'inline-block';
    showToast('Failed to export PDF', 'error');
    console.error(err);
  });
}

// ─── INIT ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const insightsRes = await fetch('http://127.0.0.1:8000/api/insights');
        if (insightsRes.ok) {
            const insightsData = await insightsRes.json();
            renderBars('tech-bars', insightsData.tech);
            renderBars('nontech-bars', insightsData.nontech, false, true);
            renderBars('company-bars', insightsData.company);
            renderBars('city-bars', insightsData.city, true, true);
        } else {
            console.warn("Could not load insights, using fallback/empty state.");
        }
    } catch (err) {
        console.error("FastAPI backend not running for Insights.", err);
        showToast("Start the Python backend to see Insights!", "error");
    }

    try {
        const glossaryRes = await fetch('http://127.0.0.1:8000/api/glossary');
        if (glossaryRes.ok) {
            const glossaryData = await glossaryRes.json();
            renderGlossary(glossaryData.terms);
        }
    } catch (err) {
         console.error("FastAPI backend not running for Glossary.", err);
    }
});
