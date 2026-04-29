export default function WorkflowPage() {
  const steps = [
    {
      n: '1',
      title: 'Mine parameters input (150+ parameters)',
      color: '#2E75B6',
      body: 'User enters 150+ parameters across two modes. Core mode covers 8 sections: Economic, Technical, Geological, Environmental, Social, Geographical, Risk, and Governance. Sub-topic mode covers 7 deep-dive sections: Mine Life, HEMM and Cost, Stripping Ratio, Coal Quality, Bench and Blast Design, Dewatering, and Infrastructure. Default values are pre-loaded from Rajmahal OCP (a validate-split mine with known actual scores).',
      params: [
        'Economic (18 params): Coal India Limited (CIL) Gross Calorific Value (GCV) grade, Net Present Value (NPV), Internal Rate of Return (IRR), Capital Expenditure (CAPEX), coal price, Weighted Average Cost of Capital (WACC), Break-Even Stripping Ratio (BESR), Debt-to-Equity (D/E) ratio, price volatility, export share',
        'Technical (10 params): Overall Stripping Ratio (OSR), Heavy Earth-Moving Machinery (HEMM) availability/utilisation, recovery, dilution, highwall Factor of Safety (FoS), production, mine life, fuel, advance rate',
        'Geological (4 params): Reserve (Mt), blended Gross Calorific Value (GCV), ash%, seam thickness',
        'Environmental (16 params): Environmental Clearance (EC) / Forest Clearance (FC) status, Overburden (OB) dump Factor of Safety (FoS), Greenhouse Gas (GHG) intensity, backfill, Particulate Matter 10 micrometers (PM10), water recycling, Renewable Energy (RE) share, reclamation',
        'Social (9 params): Lost Time Injury Frequency Rate (LTIFR), Fatal Accident Rate (FAR), fatalities, local employment, Corporate Social Responsibility (CSR) spend, training, women employment, community projects',
        'Geographical (6 params): Rail distance, logistics cost, working days, monsoon disruption, grid availability, power tariff',
        'Risk (13 params): Slope Factor of Safety (FoS), Probability of Failure (POF), Expected Loss E[L], Crossing Point Temperature (CPT), methane, lease years, litigation, near misses, fire incidents, Directorate General of Mines Safety (DGMS) compliance',
        'Governance (6 params — NEW): ISO 14001 Environmental Management System, ISO 45001 Occupational Health and Safety Management System, regulatory violations, Environmental, Social, and Governance (ESG) disclosure score, critical audit findings, Directorate General of Mining Safety (DGMS) compliance',
        'Sub-topic HEMM: shovel bucket, fill factor, swing cycle, output, fleet count, dumper payload, haul distance, speeds, cycle time',
        'Sub-topic Dewatering: hydraulic conductivity, aquifer thickness, water table depth, inflow rate, pump capacity, pumping head',
      ],
    },
    {
      n: '2',
      title: 'Seven dimension scoring formulas',
      color: '#1D9E75',
      body: 'Each dimension is scored 0–100 using analytical formulas. Parameters are normalised against benchmark ranges derived from 12 real Indian OC coal mines. Each dimension has sub-factor weights that sum to 1.0. v3.0 adds Governance as the 7th dimension and redistributes weights.',
      params: [
        'Technical (v3.0): 0.19×Gross Calorific Value (GCV) + 0.15×Stripping Ratio (SR) + 0.13×Recovery + 0.13×Heavy Earth-Moving Machinery (HEMM) + 0.11×MineLife + 0.09×Factor of Safety (FoS) + 0.07×Scale + 0.04×Fuel + 0.03×Advance + 0.03×FleetBalance + 0.03×BlastEff',
        'Economic (v3.0): 0.28×Net Present Value (NPV) + 0.24×Internal Rate of Return (IRR) + 0.16×Payback + 0.10×Margin + 0.06×Royalty + 0.05×Debt-to-Equity (D/E) + 0.04×Closure + 0.04×Volatility + 0.03×ExportPremium',
        'Environmental (v3.0): 0.20×EC[Environmental Clearance] + 0.11×FC[Forest Clearance] + 0.13×OBdumpFoS[OB Factor of Safety] + 0.09×GHG[Greenhouse Gas] + 0.07×Backfill + 0.07×PM10[Particulate Matter] + 0.06×ClosurePlan + 0.05×WaterRecycling + 0.04×Forest + 0.04×RE[Renewable Energy] + 0.04×Reclamation + 0.04×Topsoil + 0.02×Dewatering',
        'Social (v3.0): 0.24×LTIFR[Lost Time Injury Frequency Rate] + 0.19×FAR[Fatal Accident Rate] + 0.15×LocalEmp + 0.10×CSR[Corporate Social Responsibility] + 0.10×Fatalities + 0.07×Training + 0.07×Women + 0.05×Community + 0.03×ContractorLTIFR',
        'Geographical (v3.0): 0.25×RailDist + 0.25×Logistics + 0.22×WorkingDays + 0.18×PowerAvail + 0.10×PowerTariff',
        'Governance (NEW v3.0): 0.25×ISO45001[OH&S Mgmt] + 0.20×ISO14001[Env Mgmt] + 0.20×Violations + 0.15×ESG[Environmental Social Governance] + 0.12×DGMS[Directorate General Mines Safety] + 0.08×Audit',
        'Risk (v3.0): 0.17×FoS[Factor of Safety] + 0.14×POF[Probability of Failure] + 0.13×ExpLoss[Expected Loss] + 0.12×CPT[Crossing Point Temperature] + 0.08×Methane + 0.06×Lease + 0.04×Litigation + 0.09×NearMiss + 0.04×Fire + 0.04×BenchHeight + 0.02×HaulRoad + 0.03×DewaterRisk',
      ],
    },
    {
      n: '3',
      title: 'Ensemble weight derivation + sub-topic contribution',
      color: '#534AB7',
      body: 'Dimension weights are derived from three independent mathematical methods combined as an ensemble. This is the core methodological contribution — weights come from data, not from arbitrary expert assumption. All 7 engineering sub-topic sections feed into one or more dimension scores — subtopic parameters directly shift MCI through dimension weights.',
      params: [
        'Analytic Hierarchy Process (AHP) (50%): Expert judgement via pairwise comparisons. Consistency Ratio (CR) = 0.016 (must be < 0.10).',
        'Entropy Weight Method (30%): Shannon 1948 — weight from information diversity across mine data. Higher spread = higher weight.',
        'CRITIC Method (20%): Diakoulaki 1995 — penalises correlated dimensions to avoid double-counting.',
        'Sub-topic ⏱ Mine Life → Technical (mine life 11%, advance rate 3%, production scale 6%)',
        'Sub-topic 🚛 Heavy Earth-Moving Machinery (HEMM) & Cost → Technical (HEMM 12%, fleet balance 3%, haul efficiency 3%, fuel 4%) + Economic (Overburden (OB) mining cost 3%)',
        'Sub-topic 📐 Stripping Ratio → Technical (Stripping Ratio score 14%, seam geometry 3%)',
        'Sub-topic 🔬 Coal Quality → Technical (Gross Calorific Value (GCV) 16%, ash/moisture/volatile matter 4%) + Environmental (sulphur 3%) + Risk (Crossing Point Temperature (CPT)/dust 2%)',
        'Sub-topic 💥 Bench & Blast → Technical (blast efficiency 3%) + Risk (bench height 4%, haul road gradient 2%)',
        'Sub-topic 🍧 Dewatering → Environmental (dewatering 2%, hydro conductivity 2%, pump head 2%, depth-water table 2%) + Risk (inundation 2%)',
        'Sub-topic 🏗 Infrastructure → Geographical (rail 22%, logistics 20%, power 16%, despatch 16%, rail tariff 4%, road cost 4%)',
        'All three weight methods independently rank Economic highest and Risk (Safety Quality) as the largest positive weight — convergence validates the ensemble.',
      ],
    },
    {
      n: '4',
      title: 'MCI computation — Mine competive index (v3.0)',
      color: '#1F3864',
      body: 'The seven dimension scores are combined using ensemble weights. Risk is scored as Safety Quality (100 − hazard level) so all weights are positive — a safer mine scores higher. Result is scaled by 0.87 calibration factor and clamped to 0–100.',
      params: [
        'Mine competive index (MCI) = 0.127×Technical + 0.170×Economic + 0.101×Environmental + 0.139×Social + 0.130×Geographical + 0.066×Governance + 0.267×Risk(Safety)',
        'Grade A (80–100): Excellent — Investment grade. Proceed with full development.',
        'Grade B (65–79): Good — Viable. Address weakest dimension before capital commitment.',
        'Grade C (50–64): Marginal — High-risk. Sensitivity analysis required. Staged investment.',
        'Grade D (< 50): High Risk — Non-investment grade. Remediation plan required.',
      ],
    },
    {
      n: '5',
      title: 'Valuation method selection (CIMVAL Code)',
      color: '#1D9E75',
      body: 'Based on the mine lifecycle stage, CMEM automatically selects the appropriate economic valuation method per the CIMVAL Code (CIM, 2019). The counter-condition — when NOT to use the primary method — is also stated.',
      params: [
        'Producing stage → Discounted Cash Flow (DCF) / Net Present Value (NPV) / Internal Rate of Return (IRR) (Income Approach). Counter: commodity σ > 40% → Scenario DCF at P10/P50/P90.',
        'Development stage → Discounted Cash Flow (DCF) + Real Options Valuation. Counter: all options contractually committed → Pure DCF ±15%.',
        'Exploration stage → EV/Resource Multiple (Market Approach). Counter: no peer comparables → Real Options.',
      ],
    },
    {
      n: '6',
      title: 'Comparison — actual vs predicted (validate mines)',
      color: '#A32D2D',
      body: 'For the three validate-split mines (MINE_010, MINE_011, MINE_012) where actual assessment scores are known, CMEM automatically shows predicted vs actual comparison with per-dimension error analysis.',
      params: [
        'Error < 5 points: Excellent model fit',
        'Error 5–12 points: Acceptable — within expected variance from analytical scoring approximation',
        'Error > 12 points: Investigate — check input parameter values or scoring formula calibration',
        'Validation mines: Rajmahal Open Cast Pit (Marginal, 58.4), Bharat Coking Coal Limited North Karanpura (High Risk, 48.2), Lajkura Open Cast Pit (Marginal, 62.8)',
      ],
    },
  ];

  const weights = [
    { dim: 'Technical',     w: '+12.7%', why: 'Technical scores spread widely across mine types — strong discriminator. v3.0 slightly reduced from 13.6% as Governance captures regulatory compliance separately.', col: '#185FA5' },
    { dim: 'Economic',      w: '+17.0%', why: 'Highest information diversity across 12 mines — best discriminator between good and poor mines. Reduced from 18.2% in v2 after adding Governance.', col: '#1D9E75' },
    { dim: 'Environmental', w: '+10.1%', why: 'EC is binary — lower spread → lower weight. But refused EC = project veto. Reduced from 10.8% in v2.', col: '#3B6D11' },
    { dim: 'Social',        w: '+13.9%', why: 'LTIFR range 4–22 across mines = high spread. India mandatory CSR elevates weight. Consistent with v2.', col: '#BA7517' },
    { dim: 'Geographical',  w: '+13.0%', why: 'Rail distance and logistics cost vary significantly across India coal belts. Reduced from 13.9% in v2.', col: '#534AB7' },
    { dim: 'Governance',    w: '+6.6%',  why: 'NEW in v3.0. ISO certification and ESG disclosure vary widely. Lower weight as most Indian mines are at similar (low) maturity. Positive contribution.', col: '#6B48C4' },
    { dim: 'Risk',          w: '+26.7%', why: 'Safety Quality score = 100 \u2212 hazard_level. Higher score = safer mine = positive contribution. Highest weight because safety variance drives the largest Mine competive index (MCI) spread across mines.', col: '#A32D2D' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1F3864] mb-1">How CMEM Works — Full Workflow</h1>
        <p className="text-slate-500 text-sm">Seven steps from raw mine parameters to Mine competive index grade. v3.0 adds Governance as the 7th scoring dimension.</p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map(s => (
          <div key={s.n} className="card overflow-hidden">
            <div className="flex items-start gap-4 p-5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: s.color }}
              >
                {s.n}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[#1F3864] text-base mb-2">{s.title}</div>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">{s.body}</p>
                <div className="space-y-1">
                  {s.params.map((p, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span className="text-slate-300 flex-shrink-0 mt-0.5">›</span>
                      <span className="text-slate-600 font-mono leading-relaxed">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weight explanations */}
      <div>
        <h2 className="text-xl font-bold text-[#1F3864] mb-4">Why each dimension has its specific weight (v3.0)</h2>
        <div className="space-y-3">
          {weights.map(w => (
            <div key={w.dim} className="card overflow-hidden flex">
              <div className="w-2 flex-shrink-0" style={{ background: w.col }} />
              <div className="flex items-center gap-4 p-4 flex-1">
                <div className="font-bold text-sm w-28" style={{ color: w.col }}>{w.dim}</div>
                <div className="text-xl font-black w-20" style={{ color: w.col }}>{w.w}</div>
                <div className="text-sm text-slate-600 flex-1">{w.why}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="font-semibold text-emerald-800 text-sm mb-1">Convergence validation</div>
          <p className="text-sm text-emerald-700 leading-relaxed">
            All three weight derivation methods (Analytic Hierarchy Process, Entropy Weight Method, CRITIC Method) independently produce the same ordinal ranking: Economic highest, Risk (Safety Quality) as the largest single weight. This convergence across different mathematical approaches validates the weight structure. The Analytic Hierarchy Process Consistency Ratio of 0.016 confirms pairwise comparisons are internally coherent (must be below 0.10). In v3.0, Risk is treated as Safety Quality (100 \u2212 hazard level) so it is a positive contribution: safer mine \u2192 higher Mine competive index (MCI). Governance is added as a dedicated 7th dimension, with its own positive weight of +6.6%.
          </p>
        </div>
      </div>

      {/* MCI Formula */}
      <div className="bg-[#1F3864] rounded-2xl p-6 text-center">
        <div className="text-blue-200 text-xs mb-2 font-semibold uppercase tracking-widest">Mine competive index Formula — v3.0</div>
        <div className="text-white font-mono text-sm md:text-base font-bold leading-relaxed">
          Mine competive index (MCI) = 0.127T + 0.170E + 0.101Env + 0.139S + 0.130G + 0.066Gov + 0.267R
        </div>
        <div className="text-blue-300 text-xs mt-3 leading-relaxed">
          T = Technical · E = Economic · Env = Environmental · S = Social · G = Geographical · Gov = Governance · R = Risk (Safety Quality)
        </div>
        <div className="text-blue-300 text-xs mt-1">
          All scores ∈ [0, 100] · Risk = Safety Quality (100 − hazard level) · All weights positive · MCI ∈ [0, 100] · Derived from 12 real Indian OC coal mines
        </div>
      </div>
    </div>
  );
}
