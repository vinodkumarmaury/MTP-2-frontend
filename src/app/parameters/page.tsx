'use client';
import { useState, useMemo } from 'react';
import { CORE_SECTIONS, SUBTOPIC_SECTIONS, type SectionDef, type FieldDef } from '@/lib/fields';

// ── Parameter documentation keyed by field k ──────────────────────────────────
interface ParamDoc {
  desc: string;
  formula: string;
  scoring: string;
  benchmark: string;
}

const PARAM_DOCS: Record<string, ParamDoc> = {
  // ── Economic ──────────────────────────────────────────────────────────────
  npv_cr: {
    desc: 'Sum of all discounted future mine cash flows minus initial Capital Expenditure (CAPEX). Primary investment decision metric — higher Net Present Value (NPV) = more value created.',
    formula: 'Net Present Value (NPV) = Σ[CF_t/(1+r)^t] − CAPEX₀. CMPDI hurdle: NPV>0 at 10–12% discount rate.',
    scoring: '0–100: NPV₁₀₀₀Cr=100. Weight: 28% of Economic score.',
    benchmark: 'Kuju OCP: ₹280 Cr | Gevra OCP: ₹48,000 Cr | Rajmahal: ₹6,800 Cr',
  },
  irr_pct: {
    desc: 'Discount rate at which Net Present Value (NPV)=0. Compared against Weighted Average Cost of Capital (WACC); positive spread means the project creates shareholder value.',
    formula: 'Solve NPV(r)=0 via Newton–Raphson. Score = 50 + (Internal Rate of Return (IRR)−WACC)×5.',
    scoring: 'Weight: 24% of Economic score. Internal Rate of Return (IRR)=WACC scores 50.',
    benchmark: 'Kuju OCP: 28% | Gevra: 38% | CMPDI minimum FIRR: 10–12%',
  },
  payback_period_yr: {
    desc: 'Years to recover initial capital from operating cash flows. Shorter payback = lower capital-at-risk.',
    formula: 'Payback Period (PBP) = CAPEX₀ / Annual Operating Cash Flow. Score: (10−PBP)/(10−2)×100.',
    scoring: '2 yr=100, 10 yr=0. Weight: 16% of Economic score.',
    benchmark: 'Kuju OCP: 2.8 yr | Gevra: 1.8 yr | India OC avg: 4–7 yr',
  },
  capex_cr: {
    desc: 'Total pre-production capital: civil works, Heavy Earth-Moving Machinery (HEMM), electrical, EPCM fee, contingency, owner\'s cost.',
    formula: 'Capital Expenditure (CAPEX) = Civil + Mechanical + Electrical + EPCM% + Contingency% + Owner\'s cost.',
    scoring: 'Used as denominator for closure bond and expected loss ratios.',
    benchmark: 'Kuju OCP: ₹320 Cr | Gevra: ₹3,484 Cr | Rajmahal: ₹540 Cr',
  },
  sustaining_capex_cr: {
    desc: 'Annual capital for Heavy Earth-Moving Machinery (HEMM) replacement, Overburden (OB) dump raising, exploration, infrastructure maintenance.',
    formula: 'Benchmark: 5–10% of initial Capital Expenditure (CAPEX)/yr. Reduces free cash flow in later mine years.',
    scoring: 'Indirect — reduces margin score via cash flow model.',
    benchmark: 'Kuju: ₹18 Cr/yr | Industry: 5–10% of initial CAPEX',
  },
  opex_per_tonne: {
    desc: 'All-in cost to mine, process, and despatch one tonne of coal including mining, washing, general and administrative overheads (G&A).',
    formula: 'Operating Expenditure (OPEX)/t = Drill+Blast + Load+Haul + Processing + G&A + Royalty + Cess.',
    scoring: 'Used in gross margin = (Revenue − OPEX×Production)/Revenue. Weight: 10% of Economic.',
    benchmark: 'Kuju OCP: ₹360/t | Gevra: ₹820/t | Rajmahal: ₹640/t',
  },
  ob_mining_cost: {
    desc: 'Cost per Bank Cubic Meter (BCM) to drill, blast, load, haul, and dump Overburden (OB) — the key driver of total mining cost.',
    formula: 'OB cost/BCM = Drilling + Blasting + Shovel O&M + Dumper O&M + Tyre + Fuel per BCM.',
    scoring: 'Drives OPEX when multiplied by stripping ratio.',
    benchmark: 'Kuju: ₹85/BCM | Gevra: ₹148/BCM | Rajmahal: ₹110/BCM',
  },
  coal_price_t: {
    desc: 'Coal India Limited (CIL)-notified sale price for the declared coal grade. Grade E (4201–4940 kcal/kg) ≈ ₹2,200/t.',
    formula: 'Revenue = Price × Annual Production × Recovery%.',
    scoring: 'Primary revenue driver — used in margin and BESR calculations.',
    benchmark: 'Grade E: ₹2,200/t | Grade D: ₹2,600/t | Grade B: ₹3,400/t (2023)',
  },
  annual_revenue_cr: {
    desc: 'Coal sale price × annual production × recovery. Primary top-line metric for economic viability.',
    formula: 'Revenue = Coal Price × Annual Production (MTY) × 10⁶ × Recovery%.',
    scoring: 'Used in margin score calculation.',
    benchmark: 'Kuju: ₹188 Cr/yr | Gevra: ₹10,780 Cr/yr | Rajmahal: ₹1,980 Cr/yr',
  },
  royalty_pct: {
    desc: 'Statutory government royalty on coal production (India Coal Mines Regulations 2017). Currently 14% ad valorem.',
    formula: 'Royalty = Rate% × (Production × Notified Price). Paid to state government.',
    scoring: 'Lower royalty = better. Score: 100 − royalty×3.5. Weight: 6%.',
    benchmark: 'India standard: 14% | Some states: 14% flat',
  },
  wacc_pct: {
    desc: 'Weighted Average Cost of Capital (WACC): blended cost of equity and after-tax debt. Sets the Internal Rate of Return (IRR) hurdle rate.',
    formula: 'Weighted Average Cost of Capital (WACC) = (E/V)×Re + (D/V)×Rd×(1−T). Build-up method for unlisted Coal India Limited (CIL) subsidiaries.',
    scoring: 'Used to compute IRR spread. Higher WACC = lower IRR score.',
    benchmark: 'CMPDI: 10–12% | Kuju: 14% | Gevra: 12%',
  },
  discount_rate_pct: {
    desc: 'Rate used to discount future cash flows in Net Present Value (NPV) calculation. Usually equals Weighted Average Cost of Capital (WACC).',
    formula: 'Same as WACC for most analyses. Used in all NPV/Discounted Cash Flow (DCF) calculations.',
    scoring: 'Linked to WACC; affects NPV score.',
    benchmark: 'CMPDI minimum FIRR: 10–12%',
  },
  besr: {
    desc: 'Stripping ratio at which Open-Cast (OC) mining cost equals Underground (UG) mining cost. If Stripping Ratio (SR) > Break-Even Stripping Ratio (BESR), Underground (UG) becomes cheaper.',
    formula: 'Break-Even Stripping Ratio (BESR) = (UG OPEX − OC OPEX) / OB Mining Cost per BCM.',
    scoring: 'SR/BESR ratio drives Technical score. SR < BESR = open-cast justified.',
    benchmark: 'Kuju: 5.4 | Rajmahal: 9.0 | Gevra: 14.2 (deep OB, high BESR)',
  },
  closure_bond_cr: {
    desc: 'Financial provision for post-closure rehabilitation, monitoring, and environmental remediation. Net Present Value (NPV) of closure liabilities.',
    formula: 'Bond = NPV[Σ(Closure cost_t + Rehab + Monitoring)] at risk-free rate.',
    scoring: 'Closure bond / CAPEX ratio reduces Economic score. Lower = better.',
    benchmark: 'Industry: 3–8% of initial CAPEX | Haile Gold Mine: USD 103M bond',
  },
  coal_grade: {
    desc: 'Coal India Limited (CIL) notified coal grade based on Gross Calorific Value (GCV). Grade A (>6700) to Grade G (≤3360 kcal/kg).',
    formula: 'Grade from GCV ranges per CIL notification. Sets notified price.',
    scoring: 'Used with coal_price_t for revenue calculation.',
    benchmark: 'Rajmahal: Grade E (5200 kcal/kg) | BCCL N.Karanpura: Grade B (coking)',
  },
  debt_equity_ratio: {
    desc: 'Ratio of total debt to equity in mine financing. Lower Debt-to-Equity (D/E) = less financial leverage risk.',
    formula: 'Debt-to-Equity (D/E) = Total Debt / Shareholders\' Equity. 0 = fully equity financed.',
    scoring: '0=100 pts, ≥2.0=0 pts. Weight: 5% of Economic.',
    benchmark: 'CIL subsidiaries: 0.2–0.8 | Private mines: 1.0–2.0',
  },
  coal_price_volatility_pct: {
    desc: 'Coefficient of variation (CV%) of coal price over 3 years. Higher volatility = greater revenue uncertainty.',
    formula: 'CV% = (Standard Deviation / Mean) × 100 on last 3-year price series.',
    scoring: '<10%=100, >40%=0. Weight: 4% of Economic.',
    benchmark: 'India domestic: 8–15% | Export linkage: 15–30%',
  },
  export_revenue_pct: {
    desc: 'Percentage of mine revenue from spot markets or export contracts (premium pricing over notified price).',
    formula: 'Export Revenue% = Export Revenue / Total Revenue × 100.',
    scoring: '0%=50 pts, 100%=100 pts (premium uplift). Weight: 3%.',
    benchmark: 'CIL: ~0–5% | Private mines with FSA + spot: 10–25%',
  },

  // ── Technical ─────────────────────────────────────────────────────────────
  stripping_ratio_overall: {
    desc: 'Total Overburden (OB) volume divided by total recoverable coal for full mine life. Lower Overall Stripping Ratio (OSR) = more economic Open-Cast (OC) operation.',
    formula: 'Overall Stripping Ratio (OSR) = Total Overburden (OB) (BCM) / Total Coal (t). OB volume = Area × OB Thickness.',
    scoring: '(Break-Even Stripping Ratio (BESR)−Stripping Ratio (SR))/BESR × 100. Weight: 15% of Technical.',
    benchmark: 'Kuju: 4.2 | Gevra: 1.08 (exceptional) | Rajmahal: 5.5 | Haile: 7.9',
  },
  hemm_availability: {
    desc: 'Percentage of scheduled hours when Heavy Earth-Moving Machinery (HEMM) is ready for operation (not under breakdown or scheduled maintenance).',
    formula: 'Avail% = (Scheduled Hours − Downtime) / Scheduled Hours × 100.',
    scoring: 'Combined with utilisation: 0.6×Avail + 0.4×Util. Weight: 13%.',
    benchmark: 'Kuju: 87% | CMPDI benchmark OC coal India: 80–88% | Rajmahal: 82%',
  },
  hemm_utilisation: {
    desc: 'Percentage of available hours when Heavy Earth-Moving Machinery (HEMM) is actively operating, excluding idle and standby time.',
    formula: 'Util% = Operating Hours / Scheduled Hours × 100.',
    scoring: 'Combined with availability: 0.6×Avail + 0.4×Util. Target: 70–80%.',
    benchmark: 'Kuju: 75% | Gevra: 78% | Rajmahal: 72%',
  },
  recovery_pct: {
    desc: 'Percentage of geological coal extracted and entering Run-of-Mine (ROM) stockpile. Lost to dilution, floor/roof losses.',
    formula: 'Recovery% = ROM tonnes / In-situ tonnes × 100.',
    scoring: '(Recovery−70)/(95−70)×100. Weight: 13% of Technical.',
    benchmark: 'Kuju: 92% | Gevra: 96% (thick seam) | Rajmahal: 92%',
  },
  dilution_oc_pct: {
    desc: 'Percentage of non-coal material mixed into Run-of-Mine (ROM) due to mining methods — reduces effective Gross Calorific Value (GCV).',
    formula: 'Dilution% = (Run-of-Mine (ROM) − In-situ coal tonnes) / Run-of-Mine (ROM) × 100.',
    scoring: 'Higher dilution degrades effective Gross Calorific Value (GCV). Affects coal quality.',
    benchmark: 'OC coal India: 2–5% | Rajmahal: 2.7%',
  },
  highwall_fos: {
    desc: 'Ratio of resisting to driving forces for the Open-Cast (OC) highwall slope. Bishop\'s Simplified Method for circular failure.',
    formula: 'Factor of Safety (FoS) = ΣResisting Moments / ΣOverturning Moments (Bishop\'s). Must be ≥1.3.',
    scoring: '(Factor of Safety (FoS)−1.0)/(2.5−1.0)×100. Weight: 9% of Technical; also in Risk.',
    benchmark: 'DGMS minimum: 1.3 | Rajmahal: 1.33 | Gevra: 1.42',
  },
  annual_prod_mty: {
    desc: 'Tonnes of coal produced and despatched per year. Determines revenue, mine life, and Heavy Earth-Moving Machinery (HEMM) fleet size.',
    formula: 'Production = Shovel Output × Shovels × Hours × Availability × Util / (Overall Stripping Ratio (OSR)+1).',
    scoring: 'Log-normalised: 0.5 MTY=0, 50 MTY=100. Weight: 7% of Technical.',
    benchmark: 'Kuju: 1.3 MTY | Gevra: 49 MTY | Rajmahal: 9 MTY',
  },
  mine_life_yr: {
    desc: 'Years until proved reserves are exhausted at planned production. Affects Net Present Value (NPV) horizon and investment timeline.',
    formula: 'Mine Life = Reserve (Million tonnes, Mt) / Annual Production (Million Tonnes per Year, MTY). Cross-check with Life of Mine (LoM) schedule.',
    scoring: '(Life−5)/(50−5)×100. Weight: 11% of Technical.',
    benchmark: 'Kuju: 20 yr | Gevra: 25 yr | Rajmahal: 19 yr',
  },
  fuel_consumption_ltr_t: {
    desc: 'Diesel consumed per tonne of total material moved (coal + Overburden (OB)). Key operational efficiency and Greenhouse Gas (GHG) driver.',
    formula: 'Fuel L/t = Total diesel / (Production × (1+Stripping Ratio (SR))) in tonnes moved.',
    scoring: '2 L/t=100, 8 L/t=0. Weight: 4% of Technical.',
    benchmark: 'India OC coal: 3.5–5.5 L/t | Rajmahal: 3.8 L/t | Efficient mines: <3.5',
  },
  advance_rate_m_month: {
    desc: 'Rate at which the mine face advances per month. Higher advance = faster extraction and revenue ramp-up.',
    formula: 'Advance Rate = Monthly OB removed (BCM) / Bench face area (m²).',
    scoring: '(Rate−100)/(400−100)×100. Weight: 3% of Technical.',
    benchmark: 'Large Indian OC mines: 150–350 m/month | Rajmahal: 210 m/month',
  },

  // ── Geological ────────────────────────────────────────────────────────────
  reserve_mt: {
    desc: 'Proved + Probable Mineral Reserves per United Nations Framework Classification (UNFC, India) or JORC/NI 43-101. Foundation of all economic modelling.',
    formula: 'Reserve = Area × Seam Thickness × In-situ Density × Recovery. Needs QP sign-off.',
    scoring: 'Used to compute mine life. Weight: 11% of Technical (via life).',
    benchmark: 'Kuju: 26 Mt | Gevra: 1,200 Mt | Rajmahal: 171 Mt',
  },
  gcv_blended: {
    desc: 'Heat energy per kg of coal when burned completely. Determines Coal India Limited (CIL) grade and notified price.',
    formula: 'Blended Gross Calorific Value (GCV) = Σ(Seam GCV_i × Production weight_i). Measured by bomb calorimeter (IS 1350).',
    scoring: '(Gross Calorific Value (GCV)−2200)/(6700−2200)×100. Weight: 19% of Technical.',
    benchmark: 'Kuju: 3850 kcal/kg (Grade F) | BCCL N.Karanpura: 6800 (Grade B) | Rajmahal: 5200 (Grade E)',
  },
  ash_pct: {
    desc: 'Weight% of non-combustible mineral matter. High ash lowers Gross Calorific Value (GCV), grade, and price. >34% requires washing.',
    formula: 'Ash% = Weight of residue at 815°C / Total weight × 100 (IS 1350 Part 1).',
    scoring: 'Indirect — degrades GCV → lower Technical score.',
    benchmark: 'Kuju: 40% (needs blending) | BCCL N.K.: 22% (coking) | Rajmahal: 30%',
  },
  seam_thickness_avg_m: {
    desc: 'Average coal seam thickness weighted by areal extent. Thicker seam = lower Stripping Ratio (SR) = better economics.',
    formula: 'Avg Thickness = Σ(Thickness_i × Area_i) / Total Area from isopach map.',
    scoring: 'Drives OSR denominator. Indirect effect on Technical score.',
    benchmark: 'Kuju: 5.5m | Gevra: 18m (exceptional) | Rajmahal: 8m',
  },

  // ── Environmental ─────────────────────────────────────────────────────────
  ec_status: {
    desc: 'Environmental Clearance (EC) under Environment Protection Act 1986 / Environment Impact Assessment (EIA) Notification 2006. Without EC, mine cannot operate.',
    formula: 'Categorical: Granted=100, Conditions=65, Pending=30, Refused=0.',
    scoring: 'Weight: 20% of Environmental. Refused EC = project veto regardless of MCI.',
    benchmark: 'All producing mines must have EC. Conditions = partial clearance with mitigation.',
  },
  fc_status: {
    desc: 'Forest Clearance (FC) under Forest Conservation Act 1980 for diversion of forest land within mine lease.',
    formula: 'Categorical: Granted=100, Not Required=100, Pending=40, Refused=0.',
    scoring: 'Weight: 11% of Environmental.',
    benchmark: 'Not Required = mine has no forest land. Rajmahal: Not Required.',
  },
  forest_clearance_ha_pending: {
    desc: 'Hectares of forest land still awaiting clearance. Pending clearance blocks production from that area.',
    formula: 'Delays proportional to pending area as % of total forest within lease.',
    scoring: 'Higher pending area = lower EC/FC composite.',
    benchmark: 'Should be 0 for producing mines. Rajmahal: 0 ha',
  },
  seismic_zone: {
    desc: 'IS 1893 seismic hazard zone of the mine location. Zone 1 = lowest, Zone 5 = highest earthquake risk.',
    formula: 'Zones 1–5 per IS 1893. Score = 100 − (Zone−1)×20.',
    scoring: 'Weight: 3% of Environmental.',
    benchmark: 'Jharia coalfield: Zone 3 | Korba: Zone 2 | NE India: Zone 5',
  },
  closure_plan_status: {
    desc: 'Status of statutory Mine Closure Plan under MMDR Act. Required for environmental clearance renewal.',
    formula: 'Categorical: Approved=100, Draft=55, Not Prepared=15.',
    scoring: 'Weight: 6% of Environmental.',
    benchmark: 'Most Indian mines: Draft stage. Few have approved closure plans.',
  },
  ob_dump_fos: {
    desc: 'Factor of safety for Overburden (OB) dump slope stability. Low Factor of Safety (FoS) = dump failure risk, environmental damage.',
    formula: '(Factor of Safety (FoS)−1.0)/(2.0−1.0)×100. Directorate General of Mining Safety (DGMS) minimum: 1.3. OB dump failure = environmental disaster.',
    scoring: 'Weight: 13% of Environmental.',
    benchmark: 'Rajmahal: 1.34 | DGMS minimum: 1.3 | Target: >1.5',
  },
  backfill_ratio: {
    desc: 'Percentage of mined-out area progressively backfilled with OB before end of mine life. Key environmental indicator.',
    formula: 'Backfill% = Backfilled area / Total mined area × 100.',
    scoring: 'Direct: Backfill% = score. Weight: 7% of Environmental.',
    benchmark: 'India OC mines: 10–45% | Rajmahal: 30% | Target for green mines: >60%',
  },
  ghg_intensity: {
    desc: 'Scope 1+2 Greenhouse Gas (GHG) emissions per tonne of coal produced (tCO₂e/t). Coal mining contributes ~0.04–0.10 tCO₂e/t.',
    formula: 'GHG = (Diesel × 2.68 + Grid power × 0.71 + Methane drainage) / Production.',
    scoring: '100 − GHG×400. 0.05→80, 0.25→0. Weight: 9%.',
    benchmark: 'India OC coal: 0.04–0.12 | Rajmahal: 0.046 | Best practice: <0.05',
  },
  forest_area_ha: {
    desc: 'Hectares of forest land within the mine lease boundary requiring Forest Conservation Act compliance.',
    formula: 'From mine lease boundary GIS overlay with Forest Survey of India maps.',
    scoring: 'forest_area/lease_area ratio inverted (less forest = better score). Weight: 4%.',
    benchmark: 'Rajmahal: 95 ha within 1,820 ha lease (5.2%)',
  },
  lease_area_ha: {
    desc: 'Total mine lease area in hectares as per mining lease grant under MMDR Act.',
    formula: 'From gazette notification. Lease area sets operational boundary for all calculations.',
    scoring: 'Used as denominator in forest ratio calculation.',
    benchmark: 'Kuju: 420 ha | Gevra: 11,000 ha | Rajmahal: 1,820 ha',
  },
  annual_rainfall_mm: {
    desc: 'Annual average rainfall at mine site from IMD station data. Affects dewatering, dust suppression, productivity.',
    formula: 'Mean annual rainfall from nearest IMD station (30-year normal).',
    scoring: 'Higher rainfall → higher water inflow → dewatering complexity.',
    benchmark: 'Korba: 1,200 mm | Rajmahal: 1,480 mm | Assam mines: >2,000 mm',
  },
  pm10_ambient_ugm3: {
    desc: 'Ambient particulate matter <10μm at mine boundary. Central Pollution Control Board (CPCB) standard ≤100 μg/m³ (annual mean).',
    formula: 'Score = 100 − (Particulate Matter 10 micrometers (PM10)−60)/(200−60)×100. <60=excellent, >200=0.',
    scoring: 'Weight: 7% of Environmental.',
    benchmark: 'CPCB limit: 100 μg/m³ | Rajmahal: 115 | Gevra: 180 (large scale)',
  },
  water_recycling_pct: {
    desc: 'Percentage of mine water (pit dewatering, wash water) that is reused on-site rather than discharged.',
    formula: 'Recycling% = Volume reused / Total mine water generated × 100.',
    scoring: '(Recycle−10)/(70−10)×100. Weight: 5%.',
    benchmark: 'Good practice: >50% | Rajmahal: 35% | Target for green mine: >70%',
  },
  renewable_energy_pct: {
    desc: 'Percentage of mine\'s total power consumption from solar, wind, or other renewable sources.',
    formula: 'RE% = Renewable power generation / Total power consumption × 100.',
    scoring: '50 + RE%×(50/30). 0%=50, >30%=100. Weight: 4%.',
    benchmark: 'Most Indian OC mines: <5% | Leaders: 10–20% | Rajmahal: 5%',
  },
  land_reclamation_pct: {
    desc: 'Percentage of previously mined-out area that has been progressively rehabilitated with vegetation/topsoil.',
    formula: 'Reclamation% = Rehabilitated area / Total previously mined area × 100.',
    scoring: 'Reclaim/60×100. Weight: 4%.',
    benchmark: 'India OC coal: 10–35% | Rajmahal: 22% | World benchmark: >50%',
  },
  top_soil_management: {
    desc: 'Quality of topsoil stripping, separate stockpiling, and reuse in rehabilitation. Critical for land reclamation success.',
    formula: 'Categorical: Good=100 (full strip+store+reuse), Partial=55, Poor=15.',
    scoring: 'Weight: 4% of Environmental.',
    benchmark: 'Rajmahal: Partial | Leading mines: Good | Majority: Partial',
  },

  // ── Social ────────────────────────────────────────────────────────────────
  ltifr: {
    desc: 'Lost Time Injury Frequency Rate (LTIFR) = number of lost time injuries per million man-hours worked. Key Directorate General of Mining Safety (DGMS) safety metric.',
    formula: 'Lost Time Injury Frequency Rate (LTIFR) = (No. LTIs × 10⁶) / Total man-hours. Open-Cast (OC) coal India benchmark: 6–12.',
    scoring: '100 − (LTIFR−4)/(20−4)×100. Weight: 24% of Social.',
    benchmark: 'Kuju OCP: ~8 | India OC average: ~9 | World benchmark: <4',
  },
  far: {
    desc: 'Fatal Accident Rate (FAR) = fatalities per 100 million man-shifts. India coal mining Fatal Accident Rate (FAR) has declined from ~200 to ~15 over 40 years.',
    formula: 'Fatal Accident Rate (FAR) = (Fatalities × 10⁸) / Total man-shifts worked.',
    scoring: '100 − (FAR−10)/(50−10)×100. Weight: 19% of Social.',
    benchmark: 'India OC coal 2022: ~12 | Rajmahal: 3.0 | Target: <5',
  },
  fatalities_annual: {
    desc: 'Number of worker fatalities per year at the mine. Zero tolerance goal — directly penalises score.',
    formula: 'Count per year from DGMS accident register.',
    scoring: '100 − fatalities×20. 0=100, 5+=0. Weight: 10% of Social.',
    benchmark: 'India 2022: ~150 total coal mines | Target: 0 | Rajmahal: 1',
  },
  local_employment_pct: {
    desc: 'Percentage of mine workforce from local/project-affected communities. Key social licence metric.',
    formula: 'Local Emp% = Local workers / Total workforce × 100.',
    scoring: '(Local%−30)/(80−30)×100. Weight: 15%.',
    benchmark: 'MMDR Act requirement: prefer project-affected families | Rajmahal: 61%',
  },
  csr_spend_cr: {
    desc: 'Annual Corporate Social Responsibility (CSR) expenditure under Companies Act 2013 (Section 135). 2% of net profit mandatory for large companies.',
    formula: 'Mandatory: 2% of average net profit over last 3 years.',
    scoring: 'CSR/3×100 (₹3 Cr = 100). Weight: 10% of Social.',
    benchmark: 'Rajmahal: ₹34 Cr/yr | Small mines: ₹1–3 Cr/yr',
  },
  training_hrs_worker: {
    desc: 'Average safety training hours per worker per year. DGMS requires minimum training for all categories of workers.',
    formula: 'Training hrs = Total training hours / Total workforce headcount.',
    scoring: '(Training−20)/(80−20)×100. Weight: 7%.',
    benchmark: 'DGMS minimum: 40 hrs | Rajmahal: 42 hrs | World benchmark: >60 hrs',
  },
  women_employment_pct: {
    desc: 'Percentage of female workers (direct + contract). India coal mining national average is ~4%. Diversity indicator.',
    formula: 'Women% = Female workers / Total workforce × 100.',
    scoring: '(Women%−2)/(15−2)×100. Weight: 7%.',
    benchmark: 'India coal avg: ~4% | Rajmahal: 7% | Leading mines: 10–15%',
  },
  community_projects_count: {
    desc: 'Number of active CSR and community development projects (skill development, education, health, infrastructure).',
    formula: 'Count of active projects from CSR annual report.',
    scoring: 'Count/20×100. 20+ projects = 100. Weight: 5%.',
    benchmark: 'Rajmahal: 10 projects | Large mines: 15–25 projects',
  },
  contractor_ltifr: {
    desc: 'Lost Time Injury Frequency Rate (LTIFR) specifically for contract workers. Typically 1.5–2× higher than direct employees due to lower training.',
    formula: 'Contractor Lost Time Injury Frequency Rate (LTIFR) = (Contractor LTIs × 10⁶) / Contractor man-hours.',
    scoring: '100 − (LTIFR−6)/(25−6)×100. Weight: 3%.',
    benchmark: 'India: Contractor LTIFR ≈ 1.5× direct | Rajmahal: 9.5',
  },

  // ── Geographical ──────────────────────────────────────────────────────────
  rail_dist_km: {
    desc: 'Distance from mine pit top to nearest broad gauge railway siding. Direct determinant of logistics cost.',
    formula: 'Road-rail distance by survey/GPS. Rail freight via FOIS database.',
    scoring: '100 − rail_dist. 0 km=100, 100 km=0. Weight: 25%.',
    benchmark: 'Gevra: 2 km (own siding) | Rajmahal: 28 km | Remote mines: >100 km',
  },
  total_logistics_cost_t: {
    desc: 'All-in cost per tonne to transport coal from mine gate to customer (rail freight + handling + transit loss).',
    formula: 'Logistics = Rail Freight + Road Haulage + Port charges + Transit loss allowance.',
    scoring: '100 − (Cost−30)/(120−30)×100. Weight: 25%.',
    benchmark: 'Gevra: ₹32/t | Rajmahal: ₹46/t | Remote NE mines: >₹120/t',
  },
  annual_working_days: {
    desc: 'Actual working days per year after accounting for statutory holidays, maintenance shutdowns, and force majeure.',
    formula: 'Working days = 365 − Sundays − Statutory holidays − Planned shutdowns.',
    scoring: '(Days−240)/(330−240)×100. Weight: 22%.',
    benchmark: 'India OC coal: 280–320 days | Rajmahal: 306 days',
  },
  monsoon_disruption_days: {
    desc: 'Working days lost annually due to heavy rainfall, flooding, slope instability during monsoon season.',
    formula: 'Historical average of monsoon-related production downtime per year.',
    scoring: 'Reduces effective working days → affects Geographical score.',
    benchmark: 'High rainfall zones: 30–60 days | Rajmahal: 52 days | Dry zones: <20 days',
  },
  grid_power_availability_pct: {
    desc: 'Percentage of hours per year when grid power is available at mine (1 − unplanned outage%). Critical for continuous operations.',
    formula: 'Grid Avail% = (8760 − Outage hours) / 8760 × 100.',
    scoring: '(Avail−70)/(95−70)×100. Weight: 18%.',
    benchmark: 'Jharkhand: 85–92% | CG/Odisha: 88–95% | Rajmahal: 85%',
  },
  power_tariff_kwh: {
    desc: 'DISCOM industrial tariff for grid electricity at mine. Affects pumping, crushing, lighting, and processing costs.',
    formula: 'Tariff = Fixed charges + Energy charges (₹/kWh). From DISCOM tariff order.',
    scoring: '100 − (Tariff−4)/(10−4)×100. Weight: 10%.',
    benchmark: 'Jharkhand: ₹6.4/kWh | MP: ₹5.8/kWh | India range: ₹5.0–8.5/kWh',
  },

  // ── Risk ──────────────────────────────────────────────────────────────────
  slope_fos_mean: {
    desc: 'Mean Factor of Safety for overall mine slope stability computed by probabilistic slope analysis.',
    formula: 'FoS = ΣResisting / ΣDriving (Bishop\'s/Spencer\'s). Mean from Monte Carlo runs.',
    scoring: 'Risk: (FoS−1.1)/(2.0−1.1) inverted. Weight: 17% of Risk.',
    benchmark: 'DGMS minimum: 1.3 | Rajmahal: 1.33 | Gevra: 1.42',
  },
  slope_fos_sd: {
    desc: 'Standard deviation of slope FoS from probabilistic analysis. Higher SD = more uncertainty in stability.',
    formula: 'SD from Monte Carlo simulation varying strength parameters by CV = 15%.',
    scoring: 'Used with mean to estimate POF via normal distribution.',
    benchmark: 'Rajmahal: 0.13 | Stable slopes: <0.08 | Uncertain geology: >0.20',
  },
  prob_of_failure_pct: {
    desc: 'Probability of slope failure per annum derived from Monte Carlo simulation or reliability analysis.',
    formula: 'POF = P(FoS<1.0) from Monte Carlo distribution of FoS.',
    scoring: 'POF×10 = risk score. Weight: 14% of Risk.',
    benchmark: 'DGMS guideline: POF <5% | Rajmahal: 4.2% | Target: <1%',
  },
  flood_inflow_q100: {
    desc: 'Peak mine water inflow from 100-year return period flood event. Determines emergency pumping requirements.',
    formula: 'Q100 from regional flood frequency analysis. Used for sump sizing.',
    scoring: 'Used in dewatering risk and expected loss calculations.',
    benchmark: 'Rajmahal: 3,200 m³/hr | High rainfall zones: >5,000 m³/hr',
  },
  expected_loss_cr: {
    desc: 'Actuarial expected annual loss from geotechnical failure, flooding, or fire — probability × consequence.',
    formula: 'E[L] = Σ(Probability_i × Consequence_i) for all identified hazard scenarios.',
    scoring: 'E[L]/CAPEX × 1000 = risk score. Weight: 13%.',
    benchmark: 'Rajmahal: ₹12 Cr/yr | Should be <1% of CAPEX',
  },
  cpt_deg: {
    desc: 'Crossing Point Temperature — index of spontaneous combustion tendency. <140°C = high risk of coal fire.',
    formula: 'CPT measured by slow heating test in lab (IS 4853). <140°C = high risk.',
    scoring: '100−(CPT−140)/(175−140)×100 (inverted). Weight: 12% of Risk.',
    benchmark: '<140°C = high risk | Rajmahal: 160°C | BCCL: <140°C (Jharia fires)',
  },
  seam_methane_m3t: {
    desc: 'In-situ methane gas content per tonne of coal. Safety and CBM resource consideration.',
    formula: 'Measured by desorption test (IS 9178). >1 m³/t requires methane drainage.',
    scoring: 'Methane/2.0×100 = risk. Weight: 8%.',
    benchmark: 'OC coal: 0.1–0.8 m³/t | Deep seams: >2.0 | Rajmahal: 0.50',
  },
  lease_years_remaining: {
    desc: 'Years left on current mining lease before renewal required. Lease expiry risk affects long-term investment.',
    formula: 'Expiry date − Current date in years. MMDR Act: 30-year lease, renewable.',
    scoring: '100−(Years−5)/(30−5)×100 inverted. Weight: 6%.',
    benchmark: 'Rajmahal: 19 yr | Mines nearing expiry: <5 yr = high risk',
  },
  litigation_count: {
    desc: 'Number of active legal cases challenging mine operations, environmental compliance, or land acquisition.',
    formula: 'Count from mine legal register. Each case = potential operational delay.',
    scoring: 'Count×20 = risk. 0=0 risk, 5+=100. Weight: 4%.',
    benchmark: 'Rajmahal: 2 | Mines with heavy displacement: 5–15 cases',
  },
  insurance_premium_pct: {
    desc: 'Annual insurance premium as percentage of insured value. Higher premium = insurer perceives higher risk.',
    formula: 'Premium% = Annual premium / Insured asset value × 100.',
    scoring: '(Premium−0.5)/(3.0−0.5)×100. Weight: 3%.',
    benchmark: 'India OC mines: 0.8–2.5% | Rajmahal: 1.2%',
  },
  near_miss_count_annual: {
    desc: 'Near-miss incidents reported per year. Per Heinrich\'s Law, ~30 near misses precede each LTI. Leading safety indicator.',
    formula: 'Count from DGMS statutory near-miss register.',
    scoring: 'Count/60×100 = risk. Weight: 8% of Risk.',
    benchmark: 'India target: all near misses reported | Rajmahal: 42/yr | Low: <20',
  },
  fire_incident_count_annual: {
    desc: 'Coal spontaneous combustion or external fire incidents per year. Each incident = regulatory scrutiny + production loss.',
    formula: 'Count from DGMS fire incident register.',
    scoring: 'Count/3×100 = risk. 0 fires=0, ≥3=100. Weight: 4%.',
    benchmark: 'Jharia coalfield: >50/yr | Rajmahal: 1/yr | Target: 0',
  },
  dgms_compliance_pct: {
    desc: 'Compliance percentage in last DGMS audit. DGMS (Directorate General of Mines Safety) audits statutory safety obligations.',
    formula: 'Score = Non-compliances resolved / Total observations × 100.',
    scoring: 'Used in both Risk (non-compliance = 100−score) and Governance.',
    benchmark: 'CIL average: ~75% | Rajmahal: 74% | Best mines: >90%',
  },

  // ── Governance ────────────────────────────────────────────────────────────
  iso_14001: {
    desc: 'ISO 14001 Environmental Management System certification. Demonstrates systematic approach to environmental compliance.',
    formula: 'Categorical: Certified=100, In Progress=55, Not Started=10.',
    scoring: 'Weight: 20% of Governance.',
    benchmark: 'Few Indian coal mines are ISO 14001 certified. Most In Progress or Not Started.',
  },
  iso_45001: {
    desc: 'ISO 45001 Occupational Health & Safety Management System. Highest-weight governance indicator.',
    formula: 'Categorical: Certified=100, In Progress=55, Not Started=10.',
    scoring: 'Weight: 25% of Governance (highest).',
    benchmark: 'Rajmahal: In Progress | Large CIL mines targeting certification by 2025',
  },
  regulatory_violations_annual: {
    desc: 'Number of MMDR Act, CMR, or environmental regulation violations per year attracting penalty.',
    formula: 'Count from DGMS/IBM/MOEF violation register per year.',
    scoring: '100 − violations×20 = compliance score. Weight: 20%.',
    benchmark: '0 violations = ideal | Rajmahal: 2/yr | >5/yr = serious concern',
  },
  esg_disclosure_score: {
    desc: 'Quality and completeness of ESG (Environmental, Social, Governance) reporting. 0 = no reporting, 100 = GRI-compliant.',
    formula: 'Score based on BRSR/GRI/CDP disclosure completeness and quality.',
    scoring: 'Direct: ESG score = component score. Weight: 15%.',
    benchmark: 'Listed CIL: 55–70 | Unlisted subsidiaries: 20–40 | Rajmahal: 55',
  },
  audit_findings_critical: {
    desc: 'Critical findings (Category A/B) raised in internal or statutory audits per year. Indicator of control quality.',
    formula: 'Count of critical audit findings per year from audit reports.',
    scoring: '100 − findings×20. 0=100, ≥5=0. Weight: 8%.',
    benchmark: 'Good governance: 0–1/yr | Rajmahal: 3/yr | Concerning: >5/yr',
  },

  // ── Sub-Topic — HEMM & Cost ───────────────────────────────────────────────
  shovel_bucket_m3: {
    desc: 'Rated digging bucket capacity of electric rope shovel or hydraulic excavator in cubic metres.',
    formula: 'BCM/hr = Bucket × Fill factor × 3600 / Swing cycle seconds.',
    scoring: 'Feeds shovel output calculation → fleet balance score.',
    benchmark: 'Kuju: 4.6 m³ (4100 BE) | Gevra: 42 m³ (P&H 4100XPB) | Rajmahal: 10 m³',
  },
  bucket_fill_factor: {
    desc: 'Ratio of actual material loaded to rated bucket capacity. Depends on material fragmentation and loading conditions.',
    formula: 'Fill factor = Actual BCM loaded / Rated bucket volume. Range: 0.75–1.05.',
    scoring: 'Directly multiplies into shovel hourly output.',
    benchmark: 'Well-fragmented OB: 0.90–1.05 | Sticky coal: 0.80–0.90 | Rajmahal: 0.88',
  },
  shovel_swing_sec: {
    desc: 'Total time in seconds for one shovel dig-swing-dump-return cycle. Determines hourly productivity.',
    formula: 'Cycle time = Dig + Swing loaded + Dump + Swing empty + Travel. Typical: 30–55 sec.',
    scoring: 'BCM/hr = Bucket × Fill × 3600 / Cycle.',
    benchmark: 'Kuju (4100BE): 38 sec | Large shovels: 45–55 sec | Rajmahal: 44 sec',
  },
  shovel_output_bcmhr: {
    desc: 'Actual shovel hourly output in bulk cubic metres under site conditions. Basis of production planning.',
    formula: 'Output BCM/hr = Bucket(m³) × Fill × 3600 / Cycle(sec) × Efficiency.',
    scoring: '×num_shovels = total fleet capacity → fleet balance score (3% of Technical).',
    benchmark: 'Kuju: 320 BCM/hr | Large rope shovel: 3,000+ BCM/hr | Rajmahal: 600',
  },
  num_shovels: {
    desc: 'Total number of shovels/excavators in the active HEMM fleet. Determines total OB handling capacity.',
    formula: 'Required shovels = Annual OB (BCM) / (Output/shovel × Hours × Availability × Util).',
    scoring: 'Used in fleet balance calculation with num_dumpers.',
    benchmark: 'Kuju: 2 | Rajmahal: 3 | Gevra: 15+',
  },
  dumper_payload_t: {
    desc: 'Rated payload capacity of dump trucks in tonnes. Determines number of trucks required per shovel.',
    formula: 'Payload in tonnes = rated capacity × payload factor (0.90–1.05).',
    scoring: 'Used in fleet balance: dumper throughput = payload/density × trucks × 60/cycle.',
    benchmark: 'Kuju: 35t (Cat 773) | Rajmahal: 85t (Cat 785) | Gevra: 150t+ (Cat 793)',
  },
  haul_dist_m: {
    desc: 'One-way haul distance from dig face to OB dump or coal stockpile in metres. Main driver of cycle time.',
    formula: 'Haulage cost ∝ haul distance. Cycle = laden + dump + empty + spot time.',
    scoring: 'Longer haul → longer cycle → fewer cycles/hr → lower fleet efficiency.',
    benchmark: 'Kuju: 900m | Rajmahal: 1,400m | Deep pits: >3,000m',
  },
  laden_speed_kmhr: {
    desc: 'Loaded truck speed on haul road. Depends on road gradient, surface condition, and rolling resistance.',
    formula: 'Speed affected by: rolling resistance (kg/t), road grade (%), engine power.',
    scoring: 'Used in truck cycle time calculation.',
    benchmark: 'Laden: 16–22 km/hr | Rajmahal: 19 km/hr',
  },
  empty_speed_kmhr: {
    desc: 'Empty truck return speed. Higher than laden speed by 30–50% on typical haul profiles.',
    formula: 'Empty cycle time = haul distance / empty speed.',
    scoring: 'Used in truck cycle time calculation.',
    benchmark: 'Empty: 25–35 km/hr | Rajmahal: 29 km/hr',
  },
  truck_cycle_min: {
    desc: 'Total round-trip time for dump truck: spot + load + haul + dump + return. Determines fleet requirement.',
    formula: 'Cycle = Spot + Load (3–5 passes) + Haul laden + Dump + Return empty.',
    scoring: 'Truck output (t/hr) = Payload / Cycle × 60. Feeds fleet balance.',
    benchmark: 'Kuju: 12 min | Rajmahal: 20 min (long haul) | Deep pits: >35 min',
  },
  num_dumpers: {
    desc: 'Total number of dump trucks in HEMM fleet. Must match shovel output for balanced operation.',
    formula: 'Required trucks = Shovel output (BCM/hr) / Truck output (BCM/hr).',
    scoring: 'Fleet balance score: min(shovel_cap, dumper_cap) / max(shovel_cap, dumper_cap) × 100.',
    benchmark: 'Kuju: 6 | Rajmahal: 15 | Gevra: 100+',
  },

  // ── Sub-Topic — Stripping Ratio ───────────────────────────────────────────
  stripping_ratio_instantaneous: {
    desc: 'Current operating SR at the active face. May differ from overall life-of-mine SR due to pushback sequencing.',
    formula: 'Instantaneous SR = Current period OB (BCM) / Current period coal (t).',
    scoring: 'Used alongside overall SR for operational assessment.',
    benchmark: 'During peak strip: can be 2–3× overall SR',
  },
  ob_thickness_avg_m: {
    desc: 'Average overburden thickness above the coal seam, weighted by area. Key driver of open-cast economics.',
    formula: 'OB Thickness = (SR × Seam Thickness × Coal Density × Recovery).',
    scoring: 'Drives stripping ratio calculation.',
    benchmark: 'Kuju: 23m | Rajmahal: 44m | Gevra: 20m (thick seam, low OB)',
  },
  seam_dip_deg: {
    desc: 'Average dip angle of coal seam below horizontal. Higher dip = more complex mining geometry and SR variation.',
    formula: 'Dip from geotechnical boreholes/cross-sections.',
    scoring: 'Affects effective SR and mining geometry.',
    benchmark: 'Flat (<5°): most Gondwana coal | Rajmahal: 5° | Steep: Jharia some blocks >25°',
  },

  // ── Sub-Topic — Coal Quality ──────────────────────────────────────────────
  gcv_seamwise: {
    desc: 'GCV measured for each individual seam before blending. Used for grade declaration and price determination.',
    formula: 'Seam GCV by bomb calorimeter (IS 1350). Blended by production proportion.',
    scoring: 'Feeds into gcv_blended calculation.',
    benchmark: 'Rajmahal: 5200 kcal/kg | BCCL N.K.: 6800 (coking coal)',
  },
  total_moisture_pct: {
    desc: 'Total moisture in coal as received including inherent and surface moisture. Affects GCV and transport weight.',
    formula: 'Total Moisture% = Loss on air-drying + Inherent moisture (IS 1350 Part 2).',
    scoring: 'Indirectly affects GCV and grade declaration.',
    benchmark: 'India thermal coal: 5–12% | Rajmahal: 8.5%',
  },
  inherent_moisture_pct: {
    desc: 'Moisture held within coal pores, not surface moisture. Fundamental coal quality characteristic.',
    formula: 'Inherent moisture by equilibrium moisture method (IS 1350 Part 2).',
    scoring: 'High inherent moisture → lower CV → lower GCV.',
    benchmark: 'India: 3–8% | Rajmahal: 4.5%',
  },
  volatile_matter_pct: {
    desc: 'Percentage of combustible gases driven off on heating to 925°C. Indicates coal rank and combustion behaviour.',
    formula: 'VM% = Loss on heating to 925°C in covered crucible − moisture (IS 1350 Part 2).',
    scoring: 'Affects boiler design and combustion efficiency requirements.',
    benchmark: 'Sub-bituminous: 25–45% | Rajmahal: 31%',
  },
  fixed_carbon_pct: {
    desc: 'Non-volatile combustible carbon remaining after volatile matter driven off. Key thermal value indicator.',
    formula: 'FC% = 100 − Moisture% − Ash% − VM%.',
    scoring: 'Higher FC% = higher energy density per unit weight.',
    benchmark: 'India: 20–40% | Rajmahal: 26% | Coking coal: >55%',
  },
  sulphur_pct: {
    desc: 'Total sulphur content. High sulphur causes SO₂ emissions, equipment corrosion, and coking coal rejection.',
    formula: 'Sulphur% by Eschka method (IS 1350 Part 4).',
    scoring: 'High sulphur = regulatory liability. India coal typically 0.3–0.8%.',
    benchmark: 'India thermal: 0.3–0.8% | Rajmahal: 0.48% | US high-S: >3%',
  },

  // ── Sub-Topic — Bench & Blast ─────────────────────────────────────────────
  bench_height_ob_m: {
    desc: 'Height of overburden benches in metres. DGMS limits: ≤10m for soft rock, ≤15m for hard rock without special permission.',
    formula: 'DGMS CMR Regulation 106: bench height ≤ 1.5× shovel reach.',
    scoring: 'Bench height risk: (Height−8)/(20−8)×100. Weight: 4% of Risk.',
    benchmark: 'DGMS max (soft): 10m | Hard rock: 15m | Rajmahal: 10m',
  },
  bench_height_coal_m: {
    desc: 'Height of coal benches. Lower than OB benches due to spontaneous combustion risk and quality blending.',
    formula: 'Coal bench height limited by spontaneous combustion risk (CMR Reg. 107).',
    scoring: 'Affects mining dilution and coal quality.',
    benchmark: 'India OC coal: 3–8m | Rajmahal: 5m',
  },
  blast_hole_dia_mm: {
    desc: 'Diameter of production blast holes. Larger diameter = higher explosives column, more energy per hole.',
    formula: 'Hole dia determines burden (B = 25–40× dia) and deck loading design.',
    scoring: 'Part of blast design → fragmentation → loading efficiency.',
    benchmark: 'Large OC mines: 150–311mm | Rajmahal: 175mm',
  },
  blast_burden_m: {
    desc: 'Distance between blast hole rows (B). Determines fragmentation and muck pile shape for efficient loading.',
    formula: 'B = 25–40× hole diameter. B/S ratio typically 1:1.1–1.3.',
    scoring: 'Affects powder factor and fragmentation quality.',
    benchmark: 'Kuju: 3.5m | Rajmahal: 4.0m | Large mines: 6–9m',
  },
  blast_spacing_m: {
    desc: 'Distance between blast holes within a row (S). With burden, determines block volume per hole.',
    formula: 'S = 1.1–1.3× B. Wider spacing = better fragmentation in harder rock.',
    scoring: 'Blast design parameter — feeds powder factor.',
    benchmark: 'Rajmahal: 4.6m | Varies with rock strength',
  },
  powder_factor_kgbcm: {
    desc: 'Kilograms of explosives per BCM of rock blasted. Lower is more efficient and cost-effective.',
    formula: 'PF = Total explosive (kg) / Volume blasted (BCM).',
    scoring: '0.20=100 pts, 0.60=0 pts. Feeds blast efficiency score (3% of Technical).',
    benchmark: 'Soft OB: 0.15–0.25 kg/BCM | Hard rock: 0.40–0.60 | Rajmahal: 0.39',
  },
  ucs_ob_mpa: {
    desc: 'Unconfined Compressive Strength of overburden rock. Determines blastability and HEMM wear.',
    formula: 'UCS by point load test or unconfined compression lab test (IS 9143).',
    scoring: 'High UCS → harder blasting → higher powder factor → lower blast efficiency.',
    benchmark: 'Soft shale: 5–20 MPa | Sandstone: 20–80 MPa | Rajmahal OB: 9 MPa',
  },
  rqd_ob: {
    desc: 'Rock Quality Designation of overburden — percentage of core recovery in lengths >10cm. Indicates rock mass quality.',
    formula: 'RQD% = Σ(Core runs >10cm) / Total core run × 100.',
    scoring: 'High RQD = good rock mass → better blast efficiency score (3% of Technical).',
    benchmark: 'Poor: <25% | Fair: 25–50% | Good: 50–75% | Excellent: >75% | Rajmahal: 46%',
  },
  haul_road_width_m: {
    desc: 'Width of haul road between kerbs. DGMS CMR specifies minimum 3× vehicle width for two-way traffic.',
    formula: 'DGMS CMR Reg. 116: Road width ≥ 3× vehicle width (85t dumper = ~6.5m → 20m road).',
    scoring: '<10m = critical risk, >20m = safe. Risk score: 100−(width−10)/(20−10)×100.',
    benchmark: '85t dumper standard: 16–20m two-way | Rajmahal: 16m',
  },
  rolling_resistance_kgt: {
    desc: 'Resistance to forward motion per tonne GVW due to road surface deformation. Affects haulage fuel and speed.',
    formula: 'RR (kg/t) = (Grade resistance + Tyre penetration resistance). Typical: 20–50 kg/t.',
    scoring: 'Higher RR → lower laden speed → longer cycle → lower fleet efficiency.',
    benchmark: 'Good haul road: 20–30 kg/t | Poor: 40–60 kg/t | Rajmahal: 31 kg/t',
  },

  // ── Sub-Topic — Dewatering ────────────────────────────────────────────────
  hydraulic_conductivity_mday: {
    desc: 'Rate of groundwater flow through aquifer per unit hydraulic gradient. Measured by field pump tests.',
    formula: 'K (m/day) from Theis analysis of pump test drawdown data.',
    scoring: 'Higher K → higher water inflow → higher dewatering cost and risk.',
    benchmark: 'Clay: 0.001 | Alluvium: 1–100 | Fractured sandstone: 0.5–50 | Rajmahal: 1.5',
  },
  aquifer_thickness_m: {
    desc: 'Saturated thickness of the primary aquifer overlying or adjacent to the mine excavation.',
    formula: 'From borehole lithology logs and groundwater level data.',
    scoring: 'Thickness × Conductivity → transmissivity → sustainable yield.',
    benchmark: 'Rajmahal: 28m | High water table areas: 50–100m',
  },
  depth_below_wt_m: {
    desc: 'Depth of current mine working below the natural water table. Greater depth = higher inflow and pumping head.',
    formula: 'Depth = Ground elevation − Working floor elevation − Water table depth.',
    scoring: 'Deeper below WT → higher inflow risk → higher dewatering cost.',
    benchmark: 'Rajmahal: 30m | Deep pits at closure: >100m',
  },
  catchment_area_km2: {
    desc: 'Area of watershed that drains surface runoff into the mine pit during rainfall events.',
    formula: 'From topographic survey and watershed delineation GIS analysis.',
    scoring: 'Catchment × Rainfall × Runoff coeff = surface water inflow.',
    benchmark: 'Rajmahal: 10 km²',
  },
  runoff_coefficient: {
    desc: 'Fraction of rainfall that becomes surface runoff into the mine. Depends on land use, slope, and soil type.',
    formula: 'C = Runoff / Rainfall. Rational method: Q = C×i×A.',
    scoring: 'Lower runoff coefficient = better surface water management. Affects Env score.',
    benchmark: 'Forested: 0.30 | Mixed land use: 0.50–0.65 | Rajmahal: 0.64 | Bare soil: 0.75',
  },
  water_inflow_m3hr: {
    desc: 'Total water inflow to mine pit from groundwater and surface runoff. Determines pumping requirement.',
    formula: 'Total inflow = Groundwater + Surface runoff + Rainfall direct.',
    scoring: 'Dewatering risk: pump_cap/inflow ratio. Lower ratio → higher risk.',
    benchmark: 'Rajmahal: 2,450 m³/hr | Jharia deep mines: >10,000 m³/hr',
  },
  pump_capacity_m3hr: {
    desc: 'Installed peak pumping capacity of mine dewatering system. Must exceed peak inflow with safety factor.',
    formula: 'Pump capacity ≥ 1.5× peak inflow. Multiple pumps for redundancy.',
    scoring: 'Adequacy ratio = pump_cap/inflow → dewat_s (Env) and dewat_r (Risk).',
    benchmark: 'Rajmahal: 580 m³/hr | 2 pumps + standby | Safety factor: 1.5×',
  },
  pumping_head_m: {
    desc: 'Total dynamic head against which dewatering pumps operate — sum of static head and friction losses.',
    formula: 'TDH = Static head + Friction losses + Velocity head.',
    scoring: 'Higher head → more energy cost → feeds power consumption.',
    benchmark: 'Rajmahal: 50m | Deep pits: >200m',
  },

  // ── Sub-Topic — Infrastructure ────────────────────────────────────────────
  rail_tariff: {
    desc: 'FOIS (Freight Operations Information System) freight rate for coal movement in ₹ per tonne-km.',
    formula: 'Rail freight = Tariff × Distance × Tonnes. India: ₹0.6–1.2/t-km for Class 110 (coal).',
    scoring: 'Rail freight cost feeds total logistics cost.',
    benchmark: 'India FOIS Class 110 (coal): ~₹0.98/t-km',
  },
  road_haulage_cost: {
    desc: 'Cost to truck coal from mine to railway siding in ₹ per tonne-km. Only for mines without captive rail siding.',
    formula: 'Road cost = Trucking rate × Distance. India road haulage: ₹2–5/t-km.',
    scoring: 'Adds to logistics cost for mines far from rail siding.',
    benchmark: 'India: ₹2.5–4.5/t-km | Rajmahal: ₹3.8/t-km for 28 km',
  },
  annual_despatch_mty: {
    desc: 'Annual coal despatched to power plants and other consumers. May differ from production due to stockpile changes.',
    formula: 'Despatch = Production ± Stockpile change ± Transit loss.',
    scoring: 'Revenue based on despatch, not production.',
    benchmark: 'Rajmahal: 9 MTY | Close to production for most mines',
  },
  energy_demand_mwh: {
    desc: 'Total annual electrical energy demand of mine operations: pumps, crushers, lighting, ventilation, plant.',
    formula: 'Energy = Pump power + HEMM electrical + Plant × Hours × Availability.',
    scoring: 'Used for power cost and RE% calculation.',
    benchmark: 'Rajmahal: 195,000 MWh/yr | Drives power tariff impact',
  },
  process_water_demand_m3day: {
    desc: 'Daily freshwater requirement for dust suppression, coal washing, and auxiliary services.',
    formula: 'Process water = Dust suppression + Washery (if any) + Auxiliary.',
    scoring: 'Affects water recycling ratio and environmental sustainability.',
    benchmark: 'Rajmahal: 8,200 m³/day | Washery mines: much higher',
  },
};

// ── fallback doc for fields without a PARAM_DOCS entry ──────────────────────
function getDoc(k: string): ParamDoc {
  return PARAM_DOCS[k] ?? {
    desc: 'Parameter used in CMEM evaluation. Refer to the relevant section formula sheet.',
    formula: 'See dimension scoring formula.',
    scoring: 'Contributes to dimension score via sub-factor weight.',
    benchmark: 'Refer to CMPDI benchmark database.',
  };
}

// ── helpers ──────────────────────────────────────────────────────────────────
function totalFields(sections: SectionDef[]): number {
  return sections.reduce((acc, s) => acc + s.fields.length, 0);
}

export default function ParametersPage() {
  const [mode, setMode]       = useState<'core' | 'sub'>('core');
  const [sectionId, setSect]  = useState<string>(CORE_SECTIONS[0].id);
  const [search, setSearch]   = useState('');

  const sections = mode === 'core' ? CORE_SECTIONS : SUBTOPIC_SECTIONS;

  // when mode changes, default to first section of that mode
  function switchMode(m: 'core' | 'sub') {
    setMode(m);
    setSect(m === 'core' ? CORE_SECTIONS[0].id : SUBTOPIC_SECTIONS[0].id);
    setSearch('');
  }

  const activeSection = sections.find(s => s.id === sectionId) ?? sections[0];

  // filter fields by search
  const visibleFields = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeSection.fields;
    return activeSection.fields.filter(f => {
      const doc = getDoc(f.k);
      return (
        f.label.toLowerCase().includes(q) ||
        f.k.toLowerCase().includes(q) ||
        doc.desc.toLowerCase().includes(q)
      );
    });
  }, [activeSection.fields, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F3864] mb-1">CMEM Parameter Reference</h1>
        <p className="text-slate-500 text-sm">
          Comprehensive documentation for all 150+ parameters — formulas, scoring logic, and Indian OC coal benchmarks.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Core Parameters',   value: totalFields(CORE_SECTIONS),    color: '#185FA5' },
          { label: 'Sub-Topic Params',  value: totalFields(SUBTOPIC_SECTIONS), color: '#534AB7' },
          { label: 'Core Sections',     value: CORE_SECTIONS.length,           color: '#1D9E75' },
          { label: 'Sub-Topic Sections', value: SUBTOPIC_SECTIONS.length,      color: '#BA7517' },
        ].map(c => (
          <div key={c.label} className="card p-4 text-center">
            <div className="text-2xl font-black" style={{ color: c.color }}>{c.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="search"
        className="input-f w-full"
        placeholder="Search parameters by name or description…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button type="button"
          onClick={() => switchMode('core')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            mode === 'core'
              ? 'bg-[#1F3864] text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}>
          Core Parameters
        </button>
        <button type="button"
          onClick={() => switchMode('sub')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            mode === 'sub'
              ? 'bg-[#1F3864] text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}>
          Sub-Topic Parameters
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {sections.map(s => (
          <button type="button" key={s.id}
            onClick={() => { setSect(s.id); setSearch(''); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              sectionId === s.id
                ? 'text-white border-transparent'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
            style={sectionId === s.id ? { background: s.color, borderColor: s.color } : {}}>
            <span>{s.icon}</span>
            <span>{s.label}</span>
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
              sectionId === s.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
            }`}>
              {s.fields.length}
            </span>
          </button>
        ))}
      </div>

      {/* Section heading */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full" style={{ background: activeSection.color }} />
        <div>
          <div className="font-bold text-[#1F3864]">{activeSection.icon} {activeSection.label}</div>
          <div className="text-xs text-slate-400">
            {visibleFields.length} parameter{visibleFields.length !== 1 ? 's' : ''}
            {search ? ` matching "${search}"` : ''}
          </div>
        </div>
      </div>

      {/* Parameter cards grid */}
      {visibleFields.length === 0 ? (
        <div className="card p-8 text-center text-slate-400">
          No parameters found matching &quot;{search}&quot;. Try a different search term.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {visibleFields.map((f: FieldDef) => {
            const doc = getDoc(f.k);
            return (
              <div key={f.k} className="card overflow-hidden flex">
                {/* Left color bar */}
                <div className="w-1 flex-shrink-0" style={{ background: activeSection.color }} />

                <div className="flex-1 p-4 space-y-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-bold text-sm text-[#1F3864] leading-snug">{f.label}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{f.k}</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {f.unit && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                          {f.unit}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
                        style={{ background: activeSection.color }}>
                        {activeSection.label}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">{doc.desc}</p>

                  {/* Bottom 3-col row */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-50">
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Scoring</div>
                      <div className="text-xs text-slate-600 leading-tight">{doc.scoring}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Formula</div>
                      <div className="text-xs text-slate-600 font-mono leading-tight">{doc.formula}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Benchmark</div>
                      <div className="text-xs text-slate-600 leading-tight">{doc.benchmark}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
