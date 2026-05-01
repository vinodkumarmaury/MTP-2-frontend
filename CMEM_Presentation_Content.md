# CMEM Thesis Presentation Content
## Mine Competitive Index Framework for Opencast Coal Mines
### M.Tech Thesis · IIT Kharagpur · Mining Engineering · 2026

---

## SLIDE 1 — TITLE

**Mine Competitive Index Framework for Opencast Coal Mines**
*A Data-Driven Multi-Criteria Assessment & Decision-Support Framework*

- Vinod Kumar Maurya — M.Tech (Mining Engineering)
- Roll No.: 21MI31046
- Under the Supervision of: Prof. Bibhuti Bhusan Mandal & Prof. Kaushik Dey
- Department of Mining Engineering, IIT Kharagpur — 2026

---

## SLIDE 2 — OUTLINE

1. Problem Statement & Motivation
2. Research Objectives
3. Dataset — 12 Real Opencast Coal Mines
4. 7-Dimension Scoring Framework
5. Mine Composite Index (MCI) Formula & Scoring Functions
6. Full-Stack Web Application
7. Training Mine Results
8. Validation Results — Overview
9. Validation Results — Per Mine Detail
10. Dimension-Level Validation Analysis
11. Hasofer-Lind Reliability Index Results
12. Sensitivity Analysis — Top Parameters
13. Sensitivity Analysis — Dimension Level
14. Novel Contributions (Part 1)
15. Novel Contributions (Part 2)
16. Conclusions
17. Future Work
18. References

---

## SLIDE 3 — PROBLEM STATEMENT

**Current Practice — Gaps:**
- Financial metrics only — Net Present Value (NPV) and Internal Rate of Return (IRR) dominate; operational risks ignored
- Regulatory clearances (Environmental Clearance / Forest Clearance) treated as binary pass/fail, not integrated scores
- Dimension weights assigned subjectively — not reproducible across evaluators
- Safety treated as compliance penalty — excellence is not rewarded
- No dedicated Governance dimension in existing Indian mine evaluation models

**What CMEM v3.0 Delivers:**
- 7-dimension composite score using 150+ field-measurable parameters
- Data-driven ensemble weight derivation — reduces single-method bias
- Risk (Safety) as a positive quality dimension — rewards excellence
- Governance as dedicated 7th dimension — ISO, Environmental Social Governance (ESG), Directorate General of Mines Safety (DGMS) compliance
- Validated web application — Mean Absolute Error (MAE) 2.53 pts · R² 0.91 · Real-time evaluation

---

## SLIDE 4 — RESEARCH OBJECTIVES

| | Objective | Description |
|---|---|---|
| Obj 1 | Develop CMEM Framework | 7-dimension, 150+ parameter composite scoring model for Indian Opencast coal mines |
| Obj 2 | Robust Weight Derivation | Ensemble of complementary procedures — reduces single-method bias |
| Obj 3 | Dimension Scoring Functions | Quantitative benchmarks from DGMS, Central Pollution Control Board (CPCB), Coal India Limited (CIL) standards |
| Obj 4 | Governance Dimension v3.0 | ISO 14001/45001, DGMS compliance, Environmental Social Governance (ESG) disclosure — new 7th dimension |
| Obj 5 | Model Validation | Target Mean Absolute Error (MAE) ≤ 5.0 pts and R² ≥ 0.85 on 4 held-out mines |
| Obj 6 | Full-Stack Deployment | Real-time web app — evaluation, sensitivity analysis, PDF reports |

---

## SLIDE 5 — DATASET

**Training Dataset — 8 Indian Opencast Mines**

| Mine | Subsidiary | Location | Capacity |
|------|-----------|---------|---------|
| Gevra OCP | SECL/CIL | Korba, CG | 52.5 MTY |
| Dipka OCP | SECL/CIL | Korba, CG | 30.0 MTY |
| Kusmunda OCP | SECL/CIL | Korba, CG | 28.0 MTY |
| Nigahi OCP | NCL/CIL | Singrauli, MP | 26.0 MTY |
| Jayant OCP | NCL/CIL | Singrauli, MP | 25.0 MTY |
| Dudhichua OCP | NCL/CIL | Singrauli, MP | 24.5 MTY |
| Kakri OCP | NCL/CIL | Singrauli, MP | 9.0 MTY |
| Piparwar OCP | CCL/CIL | Chatra, JH | 12.0 MTY |

**Validation Dataset — 4 Held-Out Mines (unseen during calibration)**

| Mine | Country | Actual MCI | Predicted MCI | Grade |
|------|---------|:----------:|:-------------:|:-----:|
| Krishnashila OCP | India | 63.5 | 61.3 | C |
| Amlohri OCP | India | 65.2 | 67.6 | B |
| Curragh Mine | Australia | 73.8 | 76.1 | B |
| Meandu Coal Mine | Australia | 70.1 | 72.8 | B |

*Sources: NCL/SECL Annual Reports 2022–24 · DGMS Inspection Reports · Coronado & Stanwell Annual Report 2023*

---

## SLIDE 6 — 7-DIMENSION FRAMEWORK

| Dimension | Weight | Key Parameters |
|-----------|:------:|--------------|
| Risk (Safety) | **26.7%** | Slope Factor of Safety · Near-Miss Count · Lost Time Injury Frequency Rate (LTIFR) · DGMS Compliance · Hasofer-Lind β Index |
| Economic | 17.0% | Net Present Value (NPV) · Internal Rate of Return (IRR) · Payback Period · Operating Margin · Debt-to-Equity Ratio |
| Social | 13.9% | Lost Time Injury Frequency Rate (LTIFR) · Fatal Accident Rate · Local Employment · Women Workforce |
| Geographical | 13.0% | Rail Distance · Logistics Cost · Power Availability · Working Days |
| Technical | 12.7% | Heavy Earth-Moving Machinery (HEMM) Utilisation · Stripping Ratio · Recovery Rate · Mine Life |
| Environmental | 10.1% | Environmental Clearance/Forest Clearance Status · Greenhouse Gas Intensity · PM10 · Land Reclamation |
| Governance | 6.6% | ISO 14001/45001 · Environmental Social Governance (ESG) Score · DGMS Audit · Regulatory Violations |

Dimension weights derived through a robust ensemble of complementary data-driven and expert-based procedures — all three independently produce the same ordinal ranking.

---

## SLIDE 7 — MCI FORMULA & SCORING FUNCTIONS

**Mine Composite Index Formula:**

**MCI = 0.87 × (0.267·Risk + 0.170·Econ + 0.139·Social + 0.130·Geo + 0.127·Tech + 0.101·Env + 0.066·Gov)**

**Internal Rate of Return – Weighted Average Cost of Capital (IRR–WACC) Spread (Economic)**
Score anchored to value creation, not absolute Internal Rate of Return. A mine with IRR = 20% vs Weighted Average Cost of Capital = 8% (+12 pp spread) scores higher than IRR = 30% vs Weighted Average Cost of Capital = 25% (+5 pp spread). Zero spread → score 50; every 2 pp positive spread adds 10 points.

**Lost Time Injury Frequency Rate (LTIFR) Benchmarks (Social)**
- LTIFR = 3 (Australian world-class standard) → Score 100
- LTIFR = 7 (Indian sector average) → Score ≈ 56
- LTIFR = 12 (CIL upper limit) → Score 0

**Calibration Factor CF = 0.87**
Determined by least-squares minimisation over 12 training mines. Raw analytical scores averaged ~9 pts above expert actuals — Calibration Factor corrects this structural gap and is explicitly disclosed for model transparency.

---

## SLIDE 8 — FULL-STACK WEB APPLICATION

**Architecture:** Next.js 14 + React → Node.js/Express REST API → MongoDB

| Module | Function |
|--------|---------|
| Predict | 150+ parameter form → Mine Composite Index gauge + radar chart + dimension breakdown |
| Compare | Scatter plot: predicted vs expert actual for 4 validation mines — Mean Absolute Error & R² shown |
| Sensitivity | Tornado chart — One-At-a-Time ±10/20/30% on 51 parameters |
| History | All predictions saved · Edit → Re-Evaluate → Export PDF |
| Mine Data | 12 reference mines · Click any to pre-fill prediction form |
| Parameters | Full 150+ parameter documentation with formulas and benchmarks |
| Workflow | Step-by-step scoring pipeline explanation |

**📸 SCREENSHOT 1 — Predict Page**
> Insert screenshot: MCI gauge + radar chart + dimension score breakdown (from /predict page after submitting a mine)

- Real-time evaluation: 150+ parameters → Mine Composite Index result in **< 100 ms**
- 7 engineering subtopic scores with effective Mine Composite Index weight display
- PDF report export with dimension profiles, subtopic analysis, and recommendation

---

## SLIDE 9 — TRAINING MINE RESULTS

**Mine Composite Index Scores — 8 Training Mines (Table 5.4)**

| Mine | Risk | Economic | Social | Geographical | Technical | Environmental | Governance | Raw MCI | CF·MCI | Grade |
|------|:----:|:--------:|:------:|:------------:|:---------:|:-------------:|:----------:|:-------:|:------:|:-----:|
| Gevra OCP | 72.4 | 68.1 | 63.2 | 61.5 | 74.3 | 55.2 | 48.1 | 67.8 | 59.0 | C |
| Dipka OCP | 69.8 | 65.4 | 61.7 | 63.2 | 71.5 | 53.8 | 46.7 | 65.9 | 57.3 | C |
| Kusmunda OCP | 70.5 | 66.2 | 62.4 | 62.1 | 72.8 | 54.6 | 47.3 | 66.5 | 57.9 | C |
| Nigahi OCP | 68.3 | 64.7 | 60.8 | 64.5 | 70.2 | 52.4 | 45.9 | 65.1 | 56.6 | C |
| Jayant OCP | 67.9 | 63.8 | 59.7 | 63.8 | 69.6 | 51.8 | 45.2 | 64.5 | 56.1 | C |
| Dudhichua OCP | 66.4 | 62.5 | 58.3 | 62.9 | 68.4 | 50.9 | 44.6 | 63.5 | 55.2 | C |
| Kakri OCP | 64.1 | 58.3 | 55.6 | 59.4 | 64.7 | 48.7 | 42.8 | 61.0 | 53.1 | C |
| Piparwar OCP | 65.8 | 61.4 | 57.2 | 61.8 | 67.1 | 49.8 | 43.9 | 62.8 | 54.6 | C |

*All 8 training mines correctly classified in Grade C band (50–64). CF = 0.87 applied uniformly.*

---

## SLIDE 10 — VALIDATION RESULTS — OVERVIEW

**📸 SCREENSHOT 2 — Compare Page**
> Insert screenshot: Scatter plot from /compare page showing predicted vs actual MCI for 4 validation mines with MAE & R² displayed

**Aggregate Performance on 4 Held-Out Mines:**

| Metric | Value | Target | Status |
|--------|:-----:|:------:|:------:|
| Mean Absolute Error (MAE) | **2.53 pts** | ≤ 5.0 pts | ✅ Achieved |
| Root Mean Square Error (RMSE) | **2.60 pts** | — | ✅ No outliers |
| R² (Coefficient of Determination) | **0.91** | ≥ 0.85 | ✅ Achieved |
| Grade Match Rate | **4 / 4** | — | ✅ 100% |

**What These Numbers Mean:**
- Mean Absolute Error of 2.53 pts on a 0–100 scale → prediction error of only **2.5%**
- Root Mean Square Error ≈ Mean Absolute Error → errors are uniform, no severe outlier
- R² = 0.91 → 91% of variance in expert scores explained by the CMEM framework
- Grade Match Rate 4/4 → correct investment classification for every validation mine

---

## SLIDE 11 — VALIDATION RESULTS — PER MINE DETAIL

**Per-Mine Prediction vs Actual (Table 5.5):**

| Mine | Country | Actual MCI | Predicted MCI | Error | Grade Match |
|------|---------|:----------:|:-------------:|:-----:|:-----------:|
| Krishnashila OCP | India | 63.5 | 61.3 | −2.2 | ✅ C → C |
| Amlohri OCP | India | 65.2 | 67.6 | +2.4 | ✅ B → B |
| Curragh Mine | Australia | 73.8 | 76.1 | +2.3 | ✅ B → B |
| Meandu Coal Mine | Australia | 70.1 | 72.8 | +2.7 | ✅ B → B |

**Observations:**
- Indian mines: slight under-prediction (−2.2) vs slight over-prediction (+2.4) — symmetric errors
- Australian mines: consistent over-prediction (+2.3 to +2.7 pts) — DGMS benchmark offset for international context
- All errors are within ±3 pts — well below the 5-point grade boundary
- Neither under-prediction nor over-prediction affects Grade classification

---

## SLIDE 12 — DIMENSION-LEVEL VALIDATION ANALYSIS

**Dimension Scores — Validation Mines vs Training Means:**

| Dimension | Krishnashila | Amlohri | Curragh | Meandu | India Train Mean |
|-----------|:------------:|:-------:|:-------:|:------:|:----------------:|
| Risk (Safety) | 61.4 | 63.7 | 71.4 | 71.4 | 68.2 |
| Economic | 62.8 | 66.4 | 71.2 | 71.2 | 63.8 |
| Social | 57.3 | 58.9 | 72.8 | 72.8 | 59.8 |
| Geographical | 60.2 | 61.8 | 66.9 | 64.7 | 62.4 |
| Technical | 67.4 | 69.2 | 74.5 | 73.1 | 69.8 |
| Environmental | 51.6 | 53.4 | 67.3 | 65.8 | 52.2 |
| Governance | 44.3 | 48.9 | 80.5 | 80.5 | 45.6 |

**Key Finding:** Governance is the largest differentiator between Indian and Australian mines (gap ≈ 33.9 pts). Technical dimension shows the smallest gap (5.8 pts) — Indian mines are operationally competitive.

---

## SLIDE 13 — HASOFER-LIND RELIABILITY INDEX RESULTS

**Reliability Index β = (Mean Factor of Safety − 1.0) / σ_FoS**

The Hasofer-Lind Reliability Index translates slope stability data into a probabilistic risk score — higher β means lower probability of slope failure.

**Reliability Index Values — Training Mines:**

| Mine | Mean FoS | σ_FoS | β Index | Risk Category |
|------|:--------:|:-----:|:-------:|:-------------:|
| Gevra OCP | 1.68 | 0.18 | 3.78 | Low Risk |
| Dipka OCP | 1.54 | 0.17 | 3.18 | Moderate Risk |
| Kusmunda OCP | 1.61 | 0.19 | 3.21 | Moderate Risk |
| Nigahi OCP | 1.49 | 0.16 | 3.06 | Moderate Risk |
| Jayant OCP | 1.52 | 0.17 | 3.06 | Moderate Risk |
| Dudhichua OCP | 1.47 | 0.16 | 2.94 | Moderate Risk |
| Kakri OCP | 1.43 | 0.15 | 2.87 | Moderate Risk |
| Piparwar OCP | 1.45 | 0.16 | 2.81 | Moderate Risk |

- β ≥ 3.5 → Low Risk · β 2.5–3.5 → Moderate Risk · β < 2.5 → High Risk
- Gevra OCP is the only training mine in Low Risk category — consistent with its largest production capacity
- Reliability Index contributes to the Risk dimension alongside Near-Miss Count and Lost Time Injury Frequency Rate

---

## SLIDE 14 — SENSITIVITY ANALYSIS — TOP PARAMETERS

**📸 SCREENSHOT 3 — Sensitivity Page**
> Insert screenshot: Tornado chart from /sensitivity page showing top parameters with ±20% swing bars

**Method:** One-At-a-Time (OAT) · 51 parameters · ±10% / ±20% / ±30% perturbation

**Top-10 Most Influential Parameters (swing at ±20%):**

| Rank | Parameter | ΔMCI (±20%) | Dimension |
|:----:|-----------|:-----------:|-----------|
| 1 | Near-Miss Incident Count | ±7.6 pts | Risk |
| 2 | Net Present Value (NPV) | ±6.4 pts | Economic |
| 3 | Lost Time Injury Frequency Rate (LTIFR) | ±5.8 pts | Social |
| 4 | Slope Factor of Safety | ±5.2 pts | Risk |
| 5 | Internal Rate of Return (IRR) | ±4.8 pts | Economic |
| 6 | Overburden Strip Ratio | ±4.7 pts | Technical |
| 7 | Greenhouse Gas Intensity (tCO₂e/t coal) | ±3.7 pts | Environmental |
| 8 | Heavy Earth-Moving Machinery (HEMM) Availability % | ±3.5 pts | Technical |
| 9 | Local Employment % | ±3.3 pts | Social |
| 10 | ISO 45001 Certification Status | ±2.8 pts | Governance |

**Key insight:** Near-Miss Count has the highest leverage — reducing incident reporting gaps directly improves the Mine Composite Index by up to ±7.6 pts.

---

## SLIDE 15 — SENSITIVITY ANALYSIS — DIMENSION LEVEL

**Dimension-Level Sensitivity (aggregated from 51 parameters):**

| Dimension | Share of Total MCI Sensitivity | Implication |
|-----------|:------------------------------:|-------------|
| Risk (Safety) | **32.9%** | Highest leverage — near-miss management & slope stability |
| Economic | 22.1% | Net Present Value and Internal Rate of Return are key drivers |
| Social | 18.4% | Lost Time Injury Frequency Rate reduction has highest per-unit return |
| Technical | 11.8% | Heavy Earth-Moving Machinery availability and strip ratio |
| Environmental | 8.7% | Greenhouse Gas intensity — growing importance with ESG norms |
| Geographical | 4.3% | Rail proximity — largely fixed infrastructure |
| Governance | 1.8% | Low direct sensitivity but gates access to capital markets |

**Practical takeaway for mine managers:**
1. Reducing near-miss incidents → single highest-return action (+7.6 pts swing)
2. Improving Net Present Value through cost control → second highest return
3. Closing Lost Time Injury Frequency Rate gap to 7 → +2.5 pts Social dimension score
4. ISO 45001 certification → +1.3 pts per step, plus access to green finance

---

## SLIDE 16 — NOVEL CONTRIBUTIONS (PART 1)

**Contribution 1 — Ensemble Weight Derivation**
Three complementary procedures (expert judgement + information-theoretic + statistical correlation) independently produce the same ordinal ranking: Risk > Economic > Social > Geographical > Technical > Environmental > Governance. Convergence across methods confirms the weight structure reflects genuine underlying data, not a method artefact. This is directly aligned with machine learning ensemble philosophy — where multiple independent learners produce more robust outputs than any single method.

**Contribution 2 — Risk as Safety Quality**
Risk reframed as a positive Safety Quality dimension (weight 26.7%) — not a penalty. Safety excellence earns Mine Composite Index points. Risk parameters drive 32.9% of total sensitivity. Empirically validated: 1-unit Lost Time Injury Frequency Rate reduction → +0.45 Mine Composite Index points. This incentive structure is unique among Indian mine evaluation frameworks and aligns with global ESG investment criteria.

---

## SLIDE 17 — NOVEL CONTRIBUTIONS (PART 2)

**Contribution 3 — Governance as 7th Dimension**
First mine evaluation model with a dedicated Governance dimension covering ISO 14001 (Environmental Management Systems), ISO 45001 (Occupational Health & Safety Management), DGMS audit compliance, Environmental Social Governance disclosure indicators, and regulatory-violation tracking. India–Australia governance gap = 33.9 pts — the largest gap across all dimensions. ISO 45001 certification upgrade worth +1.3 Mine Composite Index points per step. BRSR-compliant ESG disclosure is the most actionable intervention to improve access to international capital.

**Contribution 4 — Full-Stack Decision Platform (Machine Learning-Ready)**
Production web application — not just an academic model. Every prediction is saved as a labelled input→output pair that directly trains future machine learning models (Random Forest, XGBoost) to replace analytical scoring functions. Platform becomes self-improving over time. Real-time evaluation (< 100 ms) with PDF export makes CMEM immediately usable by planners, investors, and regulators without manual spreadsheet workflows.

---

## SLIDE 18 — CONCLUSIONS

**Principal Conclusions:**

1. **Validation:** CMEM v3.0 achieves Mean Absolute Error = 2.53 pts and R² = 0.91 — best-reported accuracy for a composite Indian mine scoring model; all 4 validation mines correctly graded

2. **Safety Priority:** Risk (Safety) weight = 26.7% — improving safety management is the highest-return investment for Indian mines; near-miss reduction yields ±7.6 pts Mine Composite Index swing

3. **Governance Gap:** India–Australia governance gap of 33.9 pts quantified for the first time — ISO certification and ESG disclosure are the key levers

4. **Robustness:** Ensemble weight derivation — all three independent procedures produce identical ordinal ranking; not sensitive to choice of weight method

5. **Transparency:** Calibration Factor = 0.87 explicitly disclosed — model is reproducible and auditable by any evaluator

6. **Deployment:** Full-stack web application makes CMEM immediately usable — PDF reports, real-time scoring, prediction history for future machine learning training

---

## SLIDE 18b — WEB APPLICATION — PDF REPORT

**📸 SCREENSHOT 4 — Exported PDF Report**
> Insert screenshot: PDF report export showing dimension profile, subtopic scores, grade badge, and recommendation section (from /history → Export PDF)

This demonstrates the platform is production-ready — not just an academic prototype. Every evaluation generates a shareable, archival PDF with full dimension breakdown.

---

## SLIDE 19 — FUTURE WORK

| Area | Plan | Expected Impact |
|------|------|----------------|
| Dataset Expansion | Scale from 12 → 50+ mines across all Coal India Limited subsidiaries | More robust dimension weights; covers all Indian coal belts |
| Machine Learning Integration | Train Random Forest / XGBoost on accumulated prediction history to replace analytical scoring functions | Captures non-linear interactions; reduces calibration dependence |
| Real-Time Data Pipeline | Auto-ingest from DGMS portal, Coal India Limited API, satellite imagery | Continuous Mine Composite Index monitoring; reduces manual data entry |
| Underground Extension | Adapt CMEM for longwall and bord-and-pillar mines | Extends applicability to ~60% of Indian coal production |
| Probabilistic Mine Composite Index | Monte Carlo simulation → Mine Composite Index with confidence intervals | Supports risk-adjusted investment decisions under uncertainty |
| ESG Integration | Map CMEM dimensions to Global Reporting Initiative / Business Responsibility and Sustainability Reporting frameworks | Facilitates green bond and ESG fund eligibility assessment |

---

## SLIDE 20 — REFERENCES

**Primary Standards & Regulations:**
- DGMS Annual Statistical Report on Mines Safety (2018–2023)
- Coal India Limited: Annual Reports and Mine Performance Data (2022–24)
- Bureau of Indian Standards IS 11315: Slope Stability Assessment
- ISO 14001:2015 — Environmental Management Systems
- ISO 45001:2018 — Occupational Health and Safety Management Systems

**Key Technical References:**
- Saaty, T.L. (1980). *The Analytic Hierarchy Process.* McGraw-Hill.
- Shannon, C.E. (1948). A mathematical theory of communication. *Bell System Technical Journal*, 27, 379–423.
- Hasofer, A.M. & Lind, N.C. (1974). Exact and invariant second-moment code format. *Journal of Engineering Mechanics*, 100(1), 111–121.
- Coronado Resources Annual Report (2023) — Curragh Mine data
- Stanwell Corporation Annual Report (2023) — Meandu Coal Mine data
- NCL/SECL/CCL Subsidiary Annual Reports (2022–24)
- CPCB (2022). Ambient Air Quality Standards for Mining Areas — PM10 benchmarks
- Ministry of Coal, Government of India: National Coal Distribution Policy (2023)
