'use client';
import { useState, useEffect } from 'react';
import { api, DIM_META, gradeStyle } from '@/lib/api';
import { ResultPanel, MCIGauge } from '@/components/ResultPanel';
import { CORE_SECTIONS, SUBTOPIC_SECTIONS } from '@/lib/fields';

// ── Default values — Rajmahal OCP (MINE_010, Validate split, actual scores known) ──
const DEFAULTS_CORE = {
  mine_name:'Rajmahal OCP', mine_type:'Coal OC', lifecycle_stage:'Producing',
  // Economic
  npv_cr:6800, irr_pct:22, payback_period_yr:3.5, capex_cr:540,
  sustaining_capex_cr:36, opex_per_tonne:640, ob_mining_cost:110,
  coal_price_t:2200, annual_revenue_cr:1980, royalty_pct:14, cit_pct:25,
  besr:9.0, epcm_pct:8, contingency_pct:12, wacc_pct:14, discount_rate_pct:14,
  annual_depreciation_cr:44, closure_bond_cr:22, coal_grade:'Grade E',
  debt_equity_ratio:0.35, coal_price_volatility_pct:18, export_revenue_pct:15,
  // Technical
  stripping_ratio_overall:5.5, hemm_availability:82, hemm_utilisation:72,
  recovery_pct:92, dilution_oc_pct:2.7, highwall_fos:1.33,
  annual_prod_mty:9, mine_life_yr:19,
  fuel_consumption_ltr_t:3.8, advance_rate_m_month:210,
  // Geological
  reserve_mt:171, gcv_blended:5200, ash_pct:30, seam_thickness_avg_m:8,
  // Environmental
  ec_status:'Granted', fc_status:'Not Required', forest_clearance_ha_pending:0,
  seismic_zone:3, closure_plan_status:'Draft',
  ob_dump_fos:1.34, backfill_ratio:30, ghg_intensity:0.046,
  forest_area_ha:95, lease_area_ha:1820, annual_rainfall_mm:1480,
  pm10_ambient_ugm3:115, water_recycling_pct:35, renewable_energy_pct:5,
  land_reclamation_pct:22, top_soil_management:'Partial',
  // Social
  ltifr:7.2, far:3.0, fatalities_annual:1, local_employment_pct:61,
  csr_spend_cr:34, training_hrs_worker:42,
  women_employment_pct:7, community_projects_count:10, contractor_ltifr:9.5,
  // Geographical
  rail_dist_km:28, total_logistics_cost_t:46, annual_working_days:306,
  monsoon_disruption_days:52, grid_power_availability_pct:85, power_tariff_kwh:6.4,
  // Risk
  slope_fos_mean:1.33, slope_fos_sd:0.13, prob_of_failure_pct:4.2,
  flood_inflow_q100:3200, expected_loss_cr:12, cpt_deg:160,
  seam_methane_m3t:0.50, lease_years_remaining:19, litigation_count:2,
  insurance_premium_pct:1.2,
  near_miss_count_annual:42, fire_incident_count_annual:1, dgms_compliance_pct:74,
  // Governance
  iso_14001:'In Progress', iso_45001:'In Progress',
  regulatory_violations_annual:2, esg_disclosure_score:55, audit_findings_critical:3,
};

const DEFAULTS_SUBTOPIC = {
  mine_name:'Rajmahal OCP', mine_type:'Coal OC', lifecycle_stage:'Producing',
  reserve_mt:171, stripping_ratio_overall:5.5, hemm_availability:82, hemm_utilisation:72,
  annual_prod_mty:9, mine_life_yr:19,
  shovel_bucket_m3:10, bucket_fill_factor:0.88, shovel_swing_sec:44,
  shovel_output_bcmhr:600, num_shovels:3, dumper_payload_t:85,
  haul_dist_m:1400, laden_speed_kmhr:19, empty_speed_kmhr:29,
  truck_cycle_min:20, num_dumpers:15, capex_cr:540, opex_per_tonne:640, ob_mining_cost:110,
  fuel_consumption_ltr_t:3.8, advance_rate_m_month:210,
  stripping_ratio_instantaneous:5.5, besr:9.0, coal_price_t:2200,
  ob_thickness_avg_m:44, seam_thickness_avg_m:8, seam_dip_deg:5,
  gcv_seamwise:5200, gcv_blended:5200, ash_pct:30, total_moisture_pct:8.5,
  inherent_moisture_pct:4.5, volatile_matter_pct:31, fixed_carbon_pct:26,
  sulphur_pct:0.48, cpt_deg:160,
  bench_height_ob_m:10, bench_height_coal_m:5, blast_hole_dia_mm:175,
  blast_burden_m:4.0, blast_spacing_m:4.6, powder_factor_kgbcm:0.39,
  ucs_ob_mpa:9, rqd_ob:46, highwall_fos:1.33, haul_road_width_m:16, rolling_resistance_kgt:31,
  hydraulic_conductivity_mday:1.5, aquifer_thickness_m:28, depth_below_wt_m:30,
  catchment_area_km2:10, annual_rainfall_mm:1480, runoff_coefficient:0.64,
  water_inflow_m3hr:2450, pump_capacity_m3hr:580, pumping_head_m:50, power_tariff_kwh:6.4,
  rail_dist_km:28, rail_tariff:0.98, road_haulage_cost:3.8, annual_despatch_mty:9,
  total_logistics_cost_t:46, grid_power_availability_pct:85,
  energy_demand_mwh:195000, process_water_demand_m3day:8200,
  npv_cr:6800, irr_pct:22, payback_period_yr:3.5, royalty_pct:14, wacc_pct:14,
  discount_rate_pct:14, annual_revenue_cr:1980, closure_bond_cr:22,
  debt_equity_ratio:0.35, coal_price_volatility_pct:18, export_revenue_pct:15,
  ec_status:'Granted', fc_status:'Not Required', forest_clearance_ha_pending:0,
  seismic_zone:3, closure_plan_status:'Draft', ob_dump_fos:1.34,
  backfill_ratio:30, ghg_intensity:0.046, forest_area_ha:95, lease_area_ha:1820,
  pm10_ambient_ugm3:115, water_recycling_pct:35, renewable_energy_pct:5,
  land_reclamation_pct:22, top_soil_management:'Partial',
  ltifr:7.2, far:3.0, fatalities_annual:1, local_employment_pct:61,
  csr_spend_cr:34, training_hrs_worker:42,
  women_employment_pct:7, community_projects_count:10, contractor_ltifr:9.5,
  annual_working_days:306, monsoon_disruption_days:52,
  slope_fos_mean:1.33, slope_fos_sd:0.13, prob_of_failure_pct:4.2,
  flood_inflow_q100:3200, expected_loss_cr:12, seam_methane_m3t:0.50,
  lease_years_remaining:19, litigation_count:2, insurance_premium_pct:1.2,
  near_miss_count_annual:42, fire_incident_count_annual:1, dgms_compliance_pct:74,
  iso_14001:'In Progress', iso_45001:'In Progress',
  regulatory_violations_annual:2, esg_disclosure_score:55, audit_findings_critical:3,
};

type Inp = Record<string, unknown>;

// Sections imported from @/lib/fields; ResultPanel, MCIGauge from @/components/ResultPanel

// ── Main Page ─────────────────────────────────────────────────────────────
export default function PredictPage() {
  const [mode, setMode]         = useState<'core' | 'subtopic'>('core');
  const [coreForm, setCoreForm] = useState<Inp>({ ...DEFAULTS_CORE });
  const [subForm,  setSubForm]  = useState<Inp>({ ...DEFAULTS_SUBTOPIC });
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [sec,      setSec]      = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [result,        setResult]        = useState<any>(null);
  const [submittedInputs, setSubmittedInputs] = useState<Record<string,unknown>>({});
  const [comparison, setComparison] = useState<any>(null);
  const [err,      setErr]      = useState('');
  const [validateMines,   setValidateMines]   = useState<any[]>([]);
  const [compareMineid,   setCompareMineid]   = useState<string>('');

  const sections    = mode === 'core' ? CORE_SECTIONS : SUBTOPIC_SECTIONS;
  const currentForm = mode === 'core' ? coreForm : subForm;
  const updFn       = mode === 'core'
    ? (k: string, v: unknown) => setCoreForm(f => ({ ...f, [k]: v }))
    : (k: string, v: unknown) => setSubForm(f  => ({ ...f, [k]: v }));

  function switchMode(m: 'core' | 'subtopic') {
    setMode(m); setSec(0);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    const merged = { ...subForm, ...coreForm };
    if (!merged.npv_cr     || Number(merged.npv_cr) === 0)          e.npv_cr        = 'Net Present Value is required';
    if (!merged.irr_pct    || Number(merged.irr_pct) < 1)           e.irr_pct       = 'IRR must be ≥ 1%';
    if (!merged.capex_cr   || Number(merged.capex_cr) === 0)        e.capex_cr      = 'CAPEX is required';
    if (!merged.coal_price_t || Number(merged.coal_price_t) < 100)  e.coal_price_t  = 'Coal price must be > ₹100/t';
    if (!merged.wacc_pct   || Number(merged.wacc_pct) === 0)        e.wacc_pct      = 'WACC is required';
    if (!merged.stripping_ratio_overall || Number(merged.stripping_ratio_overall) === 0)
      e.stripping_ratio_overall = 'Overall stripping ratio is required';
    if (!merged.hemm_availability || Number(merged.hemm_availability) < 50)
      e.hemm_availability = 'HEMM availability must be > 50%';
    if (!merged.annual_prod_mty || Number(merged.annual_prod_mty) === 0)
      e.annual_prod_mty = 'Annual production is required';
    if (!merged.gcv_blended || Number(merged.gcv_blended) < 2000)
      e.gcv_blended = 'GCV must be ≥ 2000 kcal/kg';
    if (!merged.reserve_mt || Number(merged.reserve_mt) === 0)
      e.reserve_mt = 'Reserve is required';
    if (merged.ec_status === 'Refused')
      e.ec_status = 'Warning: Refused EC = project veto. Score will be Grade D regardless.';
    if (Number(merged.recovery_pct) > 100 || Number(merged.recovery_pct) < 0)
      e.recovery_pct = 'Recovery must be 0–100';
    if (Number(merged.ob_dump_fos) < 1.0)
      e.ob_dump_fos = 'OB dump FoS below 1.0 means failure — check input';
    if (Number(merged.seismic_zone) < 1 || Number(merged.seismic_zone) > 5)
      e.seismic_zone = 'Seismic zone must be 1–5';
    if (Number(merged.slope_fos_mean) < 1.0)
      e.slope_fos_mean = 'Slope FoS mean below 1.0 means failure — check input';
    setErrors(e);
    return Object.entries(e).filter(([k]) => k !== 'ec_status').length === 0;
  }

  async function predict() {
    if (!validate()) {
      document.querySelector('.error-msg')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setLoading(true); setErr('');
    try {
      const merged = { ...subForm, ...coreForm };
      const data = await api.post('/api/predict', {
        params: merged,
        mine_name: String(merged.mine_name || 'Custom Mine'),
        mine_ref: compareMineid || '',
        input_mode: 'combined',
        session_label: `combined — ${new Date().toLocaleTimeString()}`,
      });
      // Handle API-level errors (e.g. backend 500)
      if (data.error) throw new Error(data.error);
      if (!data.results) throw new Error('No results returned — check backend console for details');
      setResult(data.results);
      setSubmittedInputs(merged);
      setComparison(data.comparison ?? { has_actual: false });
    } catch (e: any) {
      setErr(e.message || 'Backend unreachable — start with: cd backend && node server.js');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api.get('/api/mines/validate')
      .then(data => { setValidateMines(data); if (data.length > 0) setCompareMineid(data[0].mine_id); })
      .catch(() => {});
  }, []);

  const curSec = sections[sec];
  const completedSecs = sections.filter(s =>
    s.fields.every(f => currentForm[f.k] !== undefined && currentForm[f.k] !== '')
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]">Mine Evaluation — Predict</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Default values from <strong>Rajmahal OCP</strong> (validate split — actual scores will be compared after prediction)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Compare with:</label>
          <select
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700"
            value={compareMineid}
            onChange={e => setCompareMineid(e.target.value)}
          >
            <option value="">— None —</option>
            {validateMines.map(m => (
              <option key={m.mine_id} value={m.mine_id}>{m.mine_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mine identity strip */}
      <div className="card p-3 flex flex-wrap gap-3 items-end bg-[#1F3864]/5 border-[#1F3864]/20">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mine Name</label>
          <input className="input-f text-sm font-semibold"
            value={String(currentForm.mine_name || '')}
            onChange={e => updFn('mine_name', e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mine Type</label>
          <select className="select-f text-sm"
            value={String(currentForm.mine_type || 'Coal OC')}
            onChange={e => updFn('mine_type', e.target.value)}>
            <option>Coal OC</option>
            <option>Coal UG</option>
            <option>Metal OC</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lifecycle Stage</label>
          <select className="select-f text-sm"
            value={String(currentForm.lifecycle_stage || 'Producing')}
            onChange={e => updFn('lifecycle_stage', e.target.value)}>
            <option>Exploration</option>
            <option>Development</option>
            <option>Producing</option>
          </select>
        </div>
      </div>

      {/* Mode switcher */}
      <div className="card p-3 flex flex-wrap gap-3 items-center">
        <div className="text-xs font-semibold text-slate-500">Input Mode:</div>
        {(['core', 'subtopic'] as const).map(m => (
          <button key={m} onClick={() => switchMode(m)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === m ? 'bg-[#1F3864] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            {m === 'core' ? 'Core Parameters (8 sections)' : 'Sub-Topics (7 sections)'}
          </button>
        ))}
        <div className="text-[10px] text-slate-400 ml-auto">
          {completedSecs}/{sections.length} sections filled
        </div>
      </div>

      {/* Main content: form + results */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* ── Form column ── */}
        <div className="lg:col-span-3 space-y-3">

          {/* Section tabs */}
          <div className="flex flex-wrap gap-1.5">
            {sections.map((s, i) => (
              <button key={s.id} onClick={() => setSec(i)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={i === sec
                  ? { background: s.color, color: '#fff', boxShadow: `0 2px 8px ${s.color}50` }
                  : { background: '#f1f5f9', color: '#475569' }
                }>
                <span>{(s as any).icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Active section card */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: curSec.color }}>
              <span className="text-white text-lg">{(curSec as any).icon}</span>
              <div>
                <span className="text-white font-bold text-sm">{curSec.label}</span>
                <div className="text-white/70 text-[10px]">{curSec.fields.length} parameters</div>
              </div>
              {curSec.id === 'gov' && (
                <span className="ml-auto text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">
                  NEW — v3.0
                </span>
              )}
            </div>

            <div className="p-4 grid sm:grid-cols-2 gap-3">
              {curSec.fields.map(f => (
                <div key={f.k}
                  className={`${(f as any).type === 'select' && (f as any).opts?.length > 3 ? '' : ''}`}>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {f.label}
                    {(f as any).unit && (
                      <span className="normal-case font-normal text-slate-400 ml-1">({(f as any).unit})</span>
                    )}
                  </label>
                  {(f as any).type === 'select' ? (
                    <select
                      className="select-f"
                      value={String(currentForm[f.k] ?? '')}
                      onChange={e => updFn(f.k, e.target.value)}>
                      {(f as any).opts.map((o: string) => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type="number"
                      className={`input-f ${errors[f.k] ? 'border-red-400 bg-red-50' : ''}`}
                      value={String(currentForm[f.k] ?? '')}
                      step="any"
                      onChange={e => updFn(f.k, parseFloat(e.target.value) || 0)} />
                  )}
                  {(f as any).help && (
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{(f as any).help}</p>
                  )}
                  {errors[f.k] && (
                    <p className={`text-[10px] mt-0.5 error-msg font-medium ${
                      errors[f.k].startsWith('Warning') ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {errors[f.k]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section navigation */}
          <div className="flex items-center justify-between">
            <button disabled={sec === 0}
              onClick={() => setSec(s => s - 1)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-600 rounded-xl disabled:opacity-40 hover:bg-slate-200 transition">
              ← Previous
            </button>
            <div className="flex gap-1">
              {sections.map((_, i) => (
                <button key={i} onClick={() => setSec(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: i === sec ? curSec.color : '#cbd5e1' }} />
              ))}
            </div>
            {sec < sections.length - 1 ? (
              <button onClick={() => setSec(s => s + 1)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">
                Next →
              </button>
            ) : (
              <button onClick={predict} disabled={loading}
                className="px-5 py-2 text-sm font-bold bg-[#1F3864] text-white rounded-xl hover:bg-[#2E75B6] transition disabled:opacity-60 shadow-md">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Calculating…
                  </span>
                ) : 'Calculate MCI →'}
              </button>
            )}
          </div>

          {/* Predict button (always visible at bottom) */}
          {sec < sections.length - 1 && (
            <button onClick={predict} disabled={loading}
              className="w-full py-3 text-sm font-bold bg-[#1F3864] text-white rounded-xl hover:bg-[#2E75B6] transition disabled:opacity-60 shadow-md">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Calculating MCI…
                </span>
              ) : 'Calculate Mine Composite Index →'}
            </button>
          )}

          {err && (
            <div className="rounded-xl bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-700 font-semibold flex items-start gap-2">
              <span className="text-red-500 flex-shrink-0 mt-0.5">⚠</span>
              <div>
                <div>{err}</div>
                <div className="text-xs font-normal text-red-500 mt-0.5">
                  Make sure the backend is running: <code className="bg-red-100 px-1 rounded">cd backend &amp;&amp; node server.js</code>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Results column ── */}
        <div className="lg:col-span-2">
          {result ? (
            <ResultPanel results={result} comparison={comparison} inputs={submittedInputs} />
          ) : (
            <div className="card p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[340px] border-dashed">
              <div className="text-5xl opacity-20">📊</div>
              <div className="text-slate-400 text-sm font-medium">
                Results will appear here after you calculate
              </div>
              <div className="text-slate-300 text-xs">
                7 dimensions · 150+ parameters · AHP+EWM+CRITIC ensemble weights
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 w-full max-w-xs">
                {Object.entries(DIM_META).map(([k, m]) => (
                  <div key={k} className="flex items-center gap-1.5 text-[10px]" style={{ color: m.color }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
                    <span className="font-medium">{m.label}</span>
                    <span className="text-slate-300 ml-auto">{m.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
