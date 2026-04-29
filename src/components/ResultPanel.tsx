'use client';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ReferenceLine, Cell,
} from 'recharts';
import { DIM_META, gradeStyle, errColor } from '@/lib/api';

// ── Types ────────────────────────────────────────────────────────────────────
interface ContribItem {
  key: string; label: string; color: string; bg: string;
  score: number; weight: number; contribution: number;
}
type Inp = Record<string, unknown>;

// ── Helpers ───────────────────────────────────────────────────────────────────
const s2n = (v: unknown, d = 0) => { const n = parseFloat(String(v ?? '')); return isNaN(n) ? d : n; };
function computeContributions(scores: Record<string,number>, weights: Record<string,number>): ContribItem[] {
  return Object.entries(scores).map(([k, v]) => ({
    key: k, label: DIM_META[k]?.label ?? k,
    color: DIM_META[k]?.color ?? '#888', bg: DIM_META[k]?.bg ?? '#f1f5f9',
    score: v, weight: weights[k] ?? 0,
    contribution: Math.round((weights[k] ?? 0) * v * 10) / 10,
  }));
}

// Status from 0-100 score
function status(sc: number): { label: string; bg: string; tc: string; dot: string } {
  if (sc >= 80) return { label:'Excellent', bg:'#dcfce7', tc:'#14532d', dot:'#22c55e' };
  if (sc >= 65) return { label:'Good',      bg:'#dbeafe', tc:'#1e3a8a', dot:'#3b82f6' };
  if (sc >= 50) return { label:'Moderate',  bg:'#fef9c3', tc:'#713f12', dot:'#eab308' };
  if (sc >= 35) return { label:'Weak',      bg:'#ffe4e6', tc:'#7f1d1d', dot:'#ef4444' };
  return               { label:'Critical',  bg:'#fecaca', tc:'#450a0a', dot:'#dc2626' };
}

// Inline metric row used inside dimension cards
function MetricRow({
  label, val, unit, sub, score, benchmark
}: { label: string; val: string | number; unit?: string; sub?: string; score: number; benchmark: string }) {
  const st = status(score);
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-slate-100 last:border-0 gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: st.dot }} />
          <span className="text-[10px] text-slate-500 font-medium">{label}</span>
        </div>
        {sub && <div className="text-[9px] text-slate-400 ml-3 mt-0.5">{sub}</div>}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-xs font-black tabular-nums text-slate-800">
          {val}{unit ? ` ${unit}` : ''}
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
          style={{ background: st.bg, color: st.tc }}>
          {st.label}
        </span>
      </div>
    </div>
  );
}

// ── Dimension Score Bar Chart ─────────────────────────────────────────────────
function DimBarChart({ scores }: { scores: Record<string, number> }) {
  const DIM_SHORT: Record<string, string> = {
    economic: 'Eco', technical: 'Tech', geographical: 'Geo',
    environmental: 'Env', social: 'Soc', governance: 'Gov', risk: 'Risk',
  };
  const data = Object.entries(scores).map(([k, v]) => ({
    key: k,
    name: DIM_SHORT[k] ?? k,
    score: Math.round(v * 10) / 10,
    color: DIM_META[k]?.color ?? '#888',
  }));

  return (
    <div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
        2b. Dimension Scores — Bar Chart
      </div>
      <div className="text-[9px] text-slate-400 mb-3">
        Dashed lines: Grade B threshold (65) and Grade A threshold (80).
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <RTooltip
            formatter={(value: number, _: string, entry: any) => [
              `${value.toFixed(1)} / 100`,
              DIM_META[entry.payload?.key]?.label ?? entry.payload?.key,
            ]}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <ReferenceLine y={65} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1.5}
            label={{ value: 'Grade B (65)', position: 'insideTopRight', fontSize: 9, fill: '#f59e0b' }} />
          <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 3" strokeWidth={1.5}
            label={{ value: 'Grade A (80)', position: 'insideTopRight', fontSize: 9, fill: '#22c55e' }} />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Input Parameter Summary Table ─────────────────────────────────────────────
function InputSummary({ inputs }: { inputs: Inp }) {
  const fmt = (v: unknown, decimals = 2): string => {
    if (v === undefined || v === null || v === '') return '—';
    const n = parseFloat(String(v));
    if (isNaN(n) || n === 0) return String(v) !== '0' ? String(v) || '—' : '—';
    return n % 1 === 0 ? n.toLocaleString('en-IN') : n.toFixed(decimals);
  };

  type Row = { label: string; val: string; unit?: string };
  type Group = { title: string; color: string; rows: Row[] };

  const groups: Group[] = [
    {
      title: 'Economic', color: '#1D9E75',
      rows: [
        { label: 'Net Present Value (NPV)', val: fmt(inputs.npv_cr, 0), unit: '₹ Crore' },
        { label: 'Internal Rate of Return (IRR)', val: fmt(inputs.irr_pct), unit: '%' },
        { label: 'Weighted Average Cost of Capital (WACC)', val: fmt(inputs.wacc_pct), unit: '%' },
        { label: 'Payback Period', val: fmt(inputs.payback_period_yr), unit: 'yr' },
        { label: 'Break-Even Stripping Ratio (BESR)', val: fmt(inputs.besr), unit: 'BCM:t' },
      ].filter(r => r.val !== '—'),
    },
    {
      title: 'Technical', color: '#185FA5',
      rows: [
        { label: 'Overall Stripping Ratio (OSR)', val: fmt(inputs.stripping_ratio_overall), unit: 'BCM:t' },
        { label: 'HEMM Availability', val: fmt(inputs.hemm_availability, 1), unit: '%' },
        { label: 'Annual Production', val: fmt(inputs.annual_prod_mty, 2), unit: 'MTPA' },
        { label: 'Mine Life', val: fmt(inputs.mine_life_yr, 0), unit: 'yr' },
        { label: 'Coal Recovery', val: fmt(inputs.recovery_pct, 1), unit: '%' },
      ].filter(r => r.val !== '—'),
    },
    {
      title: 'Geological', color: '#534AB7',
      rows: [
        { label: 'Mineable Reserve', val: fmt(inputs.reserve_mt, 1), unit: 'Mt' },
        { label: 'Gross Calorific Value (GCV)', val: fmt(inputs.gcv_blended, 0), unit: 'kcal/kg' },
        { label: 'Ash Content', val: fmt(inputs.ash_pct, 1), unit: '%' },
        { label: 'Seam Thickness', val: fmt(inputs.seam_thickness_avg_m, 1), unit: 'm' },
      ].filter(r => r.val !== '—'),
    },
    {
      title: 'Environmental', color: '#3B6D11',
      rows: [
        { label: 'EC Status', val: String(inputs.ec_status ?? ''), unit: undefined },
        { label: 'GHG Intensity', val: fmt(inputs.ghg_intensity, 3), unit: 'tCO₂/t' },
        { label: 'Ambient PM10', val: fmt(inputs.pm10_ambient_ugm3, 0), unit: 'µg/m³' },
      ].filter(r => r.val !== '—' && r.val !== ''),
    },
    {
      title: 'Social', color: '#BA7517',
      rows: [
        { label: 'Lost Time Injury Frequency Rate (LTIFR)', val: fmt(inputs.ltifr, 1), unit: 'per 10⁶ man-hrs' },
        { label: 'Fatal Accident Rate (FAR)', val: fmt(inputs.far, 1), unit: 'per 10⁸ man-hrs' },
        { label: 'Local Employment', val: fmt(inputs.local_employment_pct, 0), unit: '%' },
      ].filter(r => r.val !== '—'),
    },
    {
      title: 'Risk', color: '#A32D2D',
      rows: [
        { label: 'Slope FoS (Mean)', val: fmt(inputs.slope_fos_mean, 2), unit: undefined },
        { label: 'Probability of Failure (POF)', val: fmt(inputs.prob_of_failure_pct, 1), unit: '%' },
        { label: 'Crossing Point Temperature (CPT)', val: fmt(inputs.cpt_deg, 0), unit: '°C' },
      ].filter(r => r.val !== '—'),
    },
  ].filter(g => g.rows.length > 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="text-xs font-bold text-slate-600 uppercase tracking-widest">
          Input Parameters Summary
        </div>
        <div className="text-[9px] text-slate-400 mt-0.5">Key input values grouped by dimension</div>
      </div>
      <div className="p-4 grid md:grid-cols-2 gap-4">
        {groups.map(g => (
          <div key={g.title}>
            <div className="text-[10px] font-black uppercase tracking-wider mb-1.5 pb-1 border-b"
              style={{ color: g.color, borderColor: g.color + '30' }}>
              {g.title}
            </div>
            <table className="w-full">
              <tbody>
                {g.rows.map(r => (
                  <tr key={r.label} className="border-b border-slate-50 last:border-0">
                    <td className="py-0.5 pr-2 text-[9px] text-slate-500 leading-snug">{r.label}</td>
                    <td className="py-0.5 text-right text-[9px] font-black tabular-nums whitespace-nowrap"
                      style={{ color: g.color }}>
                      {r.val}{r.unit ? <span className="font-normal text-slate-400 ml-0.5">{r.unit}</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Decision Summary Box ──────────────────────────────────────────────────────
function DecisionSummary({
  mci, grade, scores,
}: {
  mci: number; grade: string; scores: Record<string, number>;
}) {
  const gs = gradeStyle(grade);

  const gradeRec: Record<string, string> = {
    A: 'Strong investment — proceed with full capital commitment.',
    B: 'Viable project — address weakest dimension before final commitment.',
    C: 'Marginal case — staged investment with sensitivity analysis required.',
    D: 'Non-investment grade — remediation plan required before funding.',
  };

  const nextSteps: Record<string, string> = {
    A: 'Fast-track board approval and financial close within current quarter.',
    B: 'Commission targeted improvement plan for lowest-scoring dimension, then re-evaluate.',
    C: 'Conduct phased feasibility study; revisit full commitment only after reaching Grade B.',
    D: 'Halt capital deployment; initiate comprehensive remediation and re-assessment.',
  };

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const strengths = sorted.filter(([, v]) => v >= 70).slice(0, 3);
  const weaknesses = [...sorted].reverse().slice(0, 3);

  return (
    <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: gs.bc }}>
      {/* Header band */}
      <div className="px-5 py-3 flex items-center gap-4" style={{ background: gs.bg }}>
        <span className="text-3xl font-black leading-none" style={{ color: gs.tc }}>
          {mci}
        </span>
        <div className="flex-1">
          <div className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: gs.tc, opacity: 0.7 }}>
            Mine Composite Index — Decision Summary
          </div>
          <div className="text-sm font-bold leading-snug" style={{ color: gs.tc }}>
            {gradeRec[grade] ?? 'Evaluation complete.'}
          </div>
        </div>
        <span className="text-2xl font-black px-4 py-2 rounded-xl border-2 flex-shrink-0"
          style={{ color: gs.tc, background: gs.bc + '22', borderColor: gs.bc }}>
          Grade {grade}
        </span>
      </div>

      <div className="p-4 bg-white grid md:grid-cols-3 gap-4">
        {/* Strengths */}
        <div>
          <div className="text-[10px] font-black text-emerald-700 uppercase tracking-wider mb-2">
            Top Strengths
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-1.5">
              {strengths.map(([k, v]) => (
                <li key={k} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-[10px] text-slate-700 font-semibold">
                    {DIM_META[k]?.label ?? k}
                    <span className="ml-1 font-black text-emerald-600">{v.toFixed(0)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[9px] text-slate-400 italic">No dimension scored ≥ 70.</p>
          )}
        </div>

        {/* Weaknesses */}
        <div>
          <div className="text-[10px] font-black text-red-700 uppercase tracking-wider mb-2">
            Areas to Improve
          </div>
          <ul className="space-y-1.5">
            {weaknesses.map(([k, v]) => (
              <li key={k} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <span className="text-[10px] text-slate-700 font-semibold">
                  {DIM_META[k]?.label ?? k}
                  <span className="ml-1 font-black text-red-500">{v.toFixed(0)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next steps */}
        <div className="md:border-l md:border-slate-100 md:pl-4">
          <div className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: gs.tc }}>
            Recommended Next Step
          </div>
          <p className="text-[10px] text-slate-600 leading-relaxed">
            {nextSteps[grade] ?? 'Review all dimensions and re-submit for evaluation.'}
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: gs.bg, color: gs.tc, border: `1px solid ${gs.bc}` }}>
              MCI = {mci} / 100
            </span>
            <span className="text-[9px] text-slate-400">
              {mci >= 80 ? 'Top quartile' : mci >= 65 ? 'Above average' : mci >= 50 ? 'Below average' : 'Bottom quartile'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mine Composite Index (MCI) Gauge ────────────────────────────────────────────────────────────────────

export function MCIGauge({ mci, grade }: { mci: number; grade: string }) {
  const gs = gradeStyle(grade);
  const r = 60, cx = 80, cy = 80;
  const theta = (1 - mci / 100) * Math.PI;
  const x2 = cx + r * Math.cos(theta), y2 = cy - r * Math.sin(theta);
  const bgPath  = `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`;
  const valPath = mci > 0 ? `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${x2.toFixed(1)} ${y2.toFixed(1)}` : '';
  return (
    <svg viewBox="0 0 160 95" className="w-full max-w-[180px] mx-auto">
      <path d={bgPath}   stroke="#e2e8f0" strokeWidth="14" fill="none" strokeLinecap="round"/>
      {valPath && <path d={valPath} stroke={gs.bc} strokeWidth="14" fill="none" strokeLinecap="round"/>}
      <text x="80" y="70" textAnchor="middle" fontFamily="ui-sans-serif" fontSize="30" fontWeight="900" fill={gs.tc}>{mci}</text>
      <text x="80" y="84" textAnchor="middle" fontFamily="ui-sans-serif" fontSize="9" fill="#94a3b8">/ 100</text>
    </svg>
  );
}

// ── Dimension Deep-Dive Cards ─────────────────────────────────────────────────
function DimCard({ dimKey, score, contribution, inputs, breakdowns }: {
  dimKey: string; score: number; contribution: number;
  inputs: Inp; breakdowns: Record<string, any>;
}) {
  const meta = DIM_META[dimKey];
  const st   = status(score);
  const B    = breakdowns[dimKey] ?? {};
  const isRisk = dimKey === 'risk';

  // Per-dimension metric definitions
  const metrics: JSX.Element[] = [];

  if (dimKey === 'technical') {
    const gcv   = s2n(inputs.gcv_blended, s2n(inputs.gcv_seamwise));
    const osr   = s2n(inputs.stripping_ratio_overall);
    const besr  = s2n(inputs.besr);
    const srViab = besr > 0 ? Math.max(0, (besr - osr) / besr * 100) : 0;
    const life  = s2n(inputs.mine_life_yr, s2n(inputs.reserve_mt) / Math.max(s2n(inputs.annual_prod_mty, 1), 0.01));
    const hemm  = (s2n(inputs.hemm_availability) + s2n(inputs.hemm_utilisation)) / 2;
    const recov = s2n(inputs.recovery_pct);
    const prod  = s2n(inputs.annual_prod_mty);
    metrics.push(
      <MetricRow key="gcv"   label="Gross Calorific Value (GCV) (Coal Quality)" val={gcv > 0 ? gcv.toFixed(0) : '—'} unit="kcal/kg"
        sub={gcv>=6700?'Premium coking coal':gcv>=4940?'Grade C/D (Power)':gcv>=3360?'Grade F/G (Low rank)':'—'}
        score={s2n(B.gcv_s)} benchmark="Grade A >6700 · Grade G <3360" />,
      <MetricRow key="sr"    label="Stripping Ratio (SR) Viability" val={srViab > 0 ? `${srViab.toFixed(1)}%` : `Overall Stripping Ratio (OSR) ${osr.toFixed(2)}`}
        sub={besr>0?`Overall Stripping Ratio (OSR) ${osr.toFixed(2)} vs Break-Even Stripping Ratio (BESR) ${besr.toFixed(1)} · ${osr<=besr?'Profitable stripping':'⚠ OSR exceeds BESR'}`:undefined}
        score={s2n(B.sr_s)} benchmark="SR Viability >40% = excellent; <0% = loss on OB removal" />,
      <MetricRow key="life"  label="Mine Life" val={life > 0 ? `${life.toFixed(0)} yr` : '—'}
        sub={prod>0?`at ${prod.toFixed(1)} MTPA production rate`:undefined}
        score={s2n(B.life_s)} benchmark=">30 yr excellent · 15–30 good · <10 yr marginal" />,
      <MetricRow key="hemm"  label="Heavy Earth-Moving Machinery (HEMM) Performance" val={hemm > 0 ? `${hemm.toFixed(0)}%` : '—'}
        sub={`Availability ${s2n(inputs.hemm_availability).toFixed(0)}% · Utilisation ${s2n(inputs.hemm_utilisation).toFixed(0)}% · Fleet balance ${s2n(B.fleet_s).toFixed(0)}/100`}
        score={s2n(B.hemm_s)} benchmark="Avail ≥88% + Util ≥80% = world-class" />,
      <MetricRow key="rec"   label="Coal Recovery" val={recov > 0 ? `${recov.toFixed(1)}%` : '—'}
        sub={`Dilution ${s2n(inputs.dilution_oc_pct).toFixed(1)}% · Powder factor ${s2n(inputs.powder_factor_kgbcm).toFixed(2)} kg/BCM`}
        score={s2n(B.rec_s)} benchmark=">95% excellent · <85% investigate dilution" />,
    );
    // Subtopic: Coal Quality
    const ash   = s2n(inputs.ash_pct);
    const moist = s2n(inputs.total_moisture_pct);
    const vm    = s2n(inputs.volatile_matter_pct);
    const sulph = s2n(inputs.sulphur_pct);
    if (ash > 0 || moist > 0) metrics.push(
      <MetricRow key="coal_qual" label="Coal Quality (Ash / Moisture)" val={ash > 0 ? `${ash.toFixed(1)}% ash` : '—'}
        sub={[moist > 0 ? `Moisture ${moist.toFixed(1)}%` : '', vm > 0 ? `Volatile Matter (VM) ${vm.toFixed(1)}%` : '', sulph > 0 ? `Sulphur (S) ${sulph.toFixed(2)}%` : ''].filter(Boolean).join(' · ')}
        score={s2n(B.ash_s)} benchmark="Ash <20% excellent · >40% washery needed · Moisture <8% good" />,
    );
    // Subtopic: Seam Geometry
    const seamT = s2n(inputs.seam_thickness_avg_m);
    const obT   = s2n(inputs.ob_thickness_avg_m);
    const dip   = s2n(inputs.seam_dip_deg);
    if (seamT > 0 || dip > 0) metrics.push(
      <MetricRow key="seam_geom" label="Seam Geometry (Dip / Thickness)" val={dip > 0 ? `${dip.toFixed(1)}° dip` : seamT > 0 ? `${seamT.toFixed(1)} m seam` : '—'}
        sub={seamT > 0 && obT > 0 ? `Seam ${seamT.toFixed(1)} m · Overburden (OB) ${obT.toFixed(1)} m · Net seam fraction ${(seamT/(seamT+obT)*100).toFixed(0)}%` : dip > 0 ? `Seam dip — steeper angles increase slope instability in OC` : undefined}
        score={s2n(B.seam_geom_s, 60)} benchmark="Dip <5° ideal · <15° acceptable · >20° mechanisation constraints" />,
    );
    // Subtopic: Haul efficiency
    const haulDist = s2n(inputs.haul_dist_m);
    const ladenSpd = s2n(inputs.laden_speed_kmhr);
    const emptySpd = s2n(inputs.empty_speed_kmhr);
    const burden   = s2n(inputs.blast_burden_m);
    const spacing  = s2n(inputs.blast_spacing_m);
    const ucs      = s2n(inputs.ucs_ob_mpa);
    if (haulDist > 0) metrics.push(
      <MetricRow key="haul_eff" label="Haul Transport Efficiency" val={haulDist > 0 ? `${haulDist.toFixed(0)} m` : '—'}
        sub={[ladenSpd > 0 ? `Laden ${ladenSpd.toFixed(0)} km/hr` : '', emptySpd > 0 ? `Empty ${emptySpd.toFixed(0)} km/hr` : ''].filter(Boolean).join(' · ') || 'One-way haul distance to dump'}
        score={s2n(B.haul_eff_s, 65)} benchmark="<500 m excellent · <1000 m good · >1500 m investigate conveyor" />,
    );
    if (burden > 0 || ucs > 0) metrics.push(
      <MetricRow key="blast_des" label="Blast Design (Burden / Uniaxial Compressive Strength (UCS))" val={burden > 0 ? `Burden:Spacing (B:S) = ${burden.toFixed(1)}:${spacing.toFixed(1)} m` : ucs > 0 ? `${ucs.toFixed(0)} MPa UCS` : '—'}
        sub={ucs > 0 ? `Overburden (OB) rock UCS ${ucs.toFixed(0)} MPa · ${ucs < 50 ? 'Soft — low powder factor' : ucs < 100 ? 'Medium — standard blast' : 'Hard — pre-splitting required'}` : 'Burden:Spacing ratio versus ideal 1:1.25'}
        score={s2n(B.blast_s)} benchmark="B:S ratio ~0.8 ideal · UCS <50 MPa easy blasting" />,
    );
  } else if (dimKey === 'economic') {
    const irr  = s2n(inputs.irr_pct);
    const wacc = s2n(inputs.wacc_pct);
    const spread = irr - wacc;
    const npv  = s2n(inputs.npv_cr);
    const pbp  = s2n(inputs.payback_period_yr);
    const de   = s2n(inputs.debt_equity_ratio);
    metrics.push(
      <MetricRow key="npv"  label="Net Present Value (NPV)" val={npv > 0 ? `₹${npv.toLocaleString('en-IN')} Crore` : '—'}
        sub="Discounted cash flow at given Weighted Average Cost of Capital (WACC)" score={s2n(B.npv_s)} benchmark=">₹5000 Crore = excellent; >₹1000 Crore = good" />,
      <MetricRow key="irr"  label="Internal Rate of Return (IRR) versus Weighted Average Cost of Capital (WACC) Spread" val={spread !== 0 ? `${spread>0?'+':''}${spread.toFixed(1)} percentage points` : '—'}
        sub={`Internal Rate of Return (IRR) ${irr.toFixed(1)}% − Weighted Average Cost of Capital (WACC) ${wacc.toFixed(1)}% = ${spread.toFixed(1)} percentage points positive spread`}
        score={s2n(B.irr_s)} benchmark=">15 pp excellent · >5 pp viable · <0 = WACC not met" />,
      <MetricRow key="pbp"  label="Payback Period" val={pbp > 0 ? `${pbp.toFixed(1)} yr` : '—'}
        sub="Time to recover capital investment" score={s2n(B.pbp_s)} benchmark="<2 yr excellent · <4 yr good · >7 yr high risk" />,
      <MetricRow key="de"   label="Debt-to-Equity (D/E) Ratio" val={de > 0 ? de.toFixed(2) : '—'}
        sub={de > 0 ? (de<=0.5?'Conservative leverage':de<=1.5?'Moderate leverage':'High leverage') : undefined}
        score={s2n(B.de_s ?? (de > 0 ? Math.max(0, 100 - de * 50) : 70))}
        benchmark="<0.5 = conservative · >2.0 = over-leveraged" />,
    );
    // Subtopic: OB Mining Cost
    const obCost = s2n(inputs.ob_mining_cost);
    if (obCost > 0) metrics.push(
      <MetricRow key="ob_cost" label="Overburden (OB) Mining Cost" val={`₹${obCost.toFixed(0)} / Bank Cubic Meter (BCM)`}
        sub={obCost < 80 ? 'Low-cost OB removal — competitive OPEX' : obCost < 150 ? 'Moderate — review HEMM efficiency' : 'High-cost — redesign bench/blast or renegotiate contract'}
        score={s2n(B.obcost_s, 60)} benchmark="<₹80/BCM excellent · <₹150 acceptable · >₹200 uncompetitive" />,
    );
  } else if (dimKey === 'environmental') {
    const ghg  = s2n(inputs.ghg_intensity);
    const pm10 = s2n(inputs.pm10_ambient_ugm3);
    const pump = s2n(inputs.pump_capacity_m3hr);
    const flow = s2n(inputs.water_inflow_m3hr);
    const dr   = pump > 0 && flow > 0 ? pump / flow : 0;
    metrics.push(
      <MetricRow key="ec"   label="EC / FC Status"
        val={`EC: ${inputs.ec_status ?? '—'} · FC: ${inputs.fc_status ?? '—'}`}
        sub="Environmental Clearance + Forest Clearance under EIA/FCA"
        score={s2n(B.ec) * 0.65 + s2n(B.fc) * 0.35}
        benchmark="Both Granted = 100 · Any Pending = high project risk" />,
      <MetricRow key="ghg"  label="Greenhouse Gas (GHG) Intensity" val={ghg > 0 ? `${ghg.toFixed(3)} tCO₂/tonne` : '—'}
        sub={`Scope 1: ${s2n(inputs.ghg_scope1_tco2yr).toLocaleString('en-IN')} tonnes/year · Scope 2: ${s2n(inputs.ghg_scope2_tco2yr).toLocaleString('en-IN')} tonnes/year`}
        score={s2n(B.ghg_s)} benchmark="<0.04 tCO₂/t excellent · >0.08 investigate diesel usage" />,
      <MetricRow key="pm10" label="Particulate Matter 10 micrometers (PM10) Ambient" val={pm10 > 0 ? `${pm10.toFixed(0)} µg/m³` : '—'}
        sub="Central Pollution Control Board (CPCB) limit: 100 µg/m³ (24 hour average)" score={s2n(B.pm10_s)}
        benchmark="<60 excellent · 60–100 acceptable · >100 violation risk" />,
      <MetricRow key="dew"  label="Dewatering Safety" val={dr > 0 ? `${dr.toFixed(2)}× ratio` : '—'}
        sub={pump>0&&flow>0?`Pump ${pump.toFixed(0)} m³/hour versus Inflow ${flow.toFixed(0)} m³/hour`:`Overburden (OB) dump Factor of Safety (FoS): ${s2n(inputs.ob_dump_fos).toFixed(2)}`}
        score={s2n(B.dewat_s)} benchmark="Pump/Inflow ≥1.5 = safe · <0.8 = critical flood risk" />,
    );
    // Subtopic: Sulphur / SO2 Risk
    const sulpE = s2n(inputs.sulphur_pct);
    if (sulpE > 0) metrics.push(
      <MetricRow key="sulphur" label="Coal Sulphur (SO₂ Risk)" val={`${sulpE.toFixed(2)}% S`}
        sub={sulpE < 0.5 ? 'Low sulphur — minimal SO₂ impact' : sulpE < 1.5 ? 'Moderate — FGD may be required by consumers' : 'High sulphur — significant SO₂ emissions, restrict to FGD-equipped plants'}
        score={s2n(B.sulphur_env_s)} benchmark="<0.5% low · 0.5–1.5% medium · >1.5% high SO₂ burden" />,
    );
    // Subtopic: Hydrogeology
    const hydCond   = s2n(inputs.hydraulic_conductivity_mday);
    const aquiferT  = s2n(inputs.aquifer_thickness_m);
    const depthWT   = s2n(inputs.depth_below_wt_m);
    const pumpHead  = s2n(inputs.pumping_head_m);
    if (hydCond > 0 || depthWT > 0 || pumpHead > 0) metrics.push(
      <MetricRow key="hydro" label="Hydrogeological Conditions"
        val={depthWT > 0 ? `${depthWT.toFixed(0)} m below WT` : hydCond > 0 ? `K=${hydCond.toFixed(1)} m/d` : `Head ${pumpHead.toFixed(0)} m`}
        sub={[hydCond > 0 ? `K=${hydCond.toFixed(1)} m/day` : '', aquiferT > 0 ? `Aquifer ${aquiferT.toFixed(0)} m thick` : '', pumpHead > 0 ? `Pump head ${pumpHead.toFixed(0)} m` : ''].filter(Boolean).join(' · ')}
        score={s2n(B.hyd_cond_s, 70)} benchmark="K <1 m/day low ingress · depth >60 m below WT = safe · pump head <30 m good" />,
    );
  } else if (dimKey === 'social') {
    const ltifr = s2n(inputs.ltifr);
    const far   = s2n(inputs.far);
    const fat   = s2n(inputs.fatalities_annual);
    const locEmp = s2n(inputs.local_employment_pct);
    const women  = s2n(inputs.women_employment_pct);
    metrics.push(
      <MetricRow key="ltifr" label="Lost Time Injury Frequency Rate (LTIFR)" val={ltifr > 0 ? ltifr.toFixed(1) : '—'}
        sub="Lost Time Injury Frequency Rate per million man-hours"
        score={s2n(B.ltifr_s)} benchmark="<4 excellent · 4–8 acceptable · >12 critical (India OC avg: 6–10)" />,
      <MetricRow key="far"   label="Fatal Accident Rate (FAR)" val={far > 0 ? far.toFixed(1) : '—'}
        sub="Fatal Accident Rate per million man-hours"
        score={s2n(B.far_s)} benchmark="<10 acceptable · >30 critical (national benchmark)" />,
      <MetricRow key="fat"   label="Fatalities / Year" val={fat.toFixed(0)}
        sub={fat === 0 ? '✓ Zero fatality record' : `${fat} fatality/ies in reporting year`}
        score={s2n(B.fat_s)} benchmark="0 = target · 1 = mandatory DGMS inquiry · >2 = operations review" />,
      <MetricRow key="emp"   label="Local Employment" val={locEmp > 0 ? `${locEmp.toFixed(0)}%` : '—'}
        sub={women > 0 ? `Women: ${women.toFixed(0)}% of workforce · CSR: ₹${s2n(inputs.csr_spend_cr).toFixed(1)} Cr/yr` : `CSR: ₹${s2n(inputs.csr_spend_cr).toFixed(1)} Cr/yr`}
        score={s2n(B.emp_s)} benchmark=">70% excellent · >50% good · <30% poor community alignment" />,
    );
  } else if (dimKey === 'geographical') {
    const rail  = s2n(inputs.rail_dist_km);
    const logi  = s2n(inputs.total_logistics_cost_t);
    const pwr   = s2n(inputs.grid_power_availability_pct);
    const wdays = s2n(inputs.annual_working_days);
    metrics.push(
      <MetricRow key="rail"  label="Rail Distance to Siding" val={rail > 0 ? `${rail.toFixed(0)} km` : '—'}
        sub={`Tariff: ₹${s2n(inputs.rail_tariff).toFixed(2)}/tkm · Road: ₹${s2n(inputs.road_haulage_cost).toFixed(1)}/tkm`}
        score={s2n(B.rail_s)} benchmark="<10 km excellent · <25 km good · >50 km competitive disadvantage" />,
      <MetricRow key="logi"  label="Total Logistics Cost" val={logi > 0 ? `₹${logi.toFixed(0)}/t` : '—'}
        sub={`Annual despatch: ${s2n(inputs.annual_despatch_mty).toFixed(1)} MTPA`}
        score={s2n(B.logi_s)} benchmark="<₹35/t excellent · >₹80/t competes with imports" />,
      <MetricRow key="pwr"   label="Grid Power Availability" val={pwr > 0 ? `${pwr.toFixed(0)}%` : '—'}
        sub={`Tariff: ₹${s2n(inputs.power_tariff_kwh).toFixed(1)}/kWh · Demand: ${(s2n(inputs.energy_demand_mwh)/1000).toFixed(1)} GWh/yr`}
        score={s2n(B.pwr_s)} benchmark=">95% excellent · <80% operations at risk" />,
      <MetricRow key="work"  label="Annual Working Season" val={wdays > 0 ? `${wdays.toFixed(0)} days/yr` : '—'}
        sub={`Monsoon disruption: ${s2n(inputs.monsoon_disruption_days).toFixed(0)} days/yr`}
        score={s2n(B.work_s)} benchmark=">320 days excellent · <280 days marginal (seasonal constraint)" />,
    );
    // Subtopic: Infrastructure tariffs
    const railTariff = s2n(inputs.rail_tariff);
    const roadHaul   = s2n(inputs.road_haulage_cost);
    if (railTariff > 0 || roadHaul > 0) metrics.push(
      <MetricRow key="tariffs" label="Transport Tariffs" val={railTariff > 0 ? `₹${railTariff.toFixed(2)}/t-km rail` : `₹${roadHaul.toFixed(1)}/t-km road`}
        sub={[railTariff > 0 ? `Rail ₹${railTariff.toFixed(2)}/t-km` : '', roadHaul > 0 ? `Road ₹${roadHaul.toFixed(1)}/t-km` : ''].filter(Boolean).join(' · ')}
        score={(s2n(B.tariff_s, 65) + s2n(B.road_s, 65)) / 2} benchmark="Rail <₹1.0/t-km excellent · Road <₹5/t-km excellent" />,
    );
    // Subtopic: Despatch & Energy
    const despatch   = s2n(inputs.annual_despatch_mty);
    const energyMwh  = s2n(inputs.energy_demand_mwh);
    const prodMty    = s2n(inputs.annual_prod_mty, 1);
    if (despatch > 0 || energyMwh > 0) metrics.push(
      <MetricRow key="despatch_e" label="Despatch & Energy Demand"
        val={despatch > 0 ? `${despatch.toFixed(1)} MTPA despatch` : `${(energyMwh/1000).toFixed(0)} GWh/yr`}
        sub={[despatch > 0 ? `${(despatch/prodMty*100).toFixed(0)}% utilisation of production` : '', energyMwh > 0 ? `Energy intensity ${(energyMwh/1000/prodMty).toFixed(0)} GWh/MTPA` : ''].filter(Boolean).join(' · ')}
        score={s2n(B.despatch_s, 70)} benchmark="Despatch >90% of production = excellent market access" />,
    );
  } else if (dimKey === 'governance') {
    const dgms  = s2n(inputs.dgms_compliance_pct);
    const esg   = s2n(inputs.esg_disclosure_score);
    const viol  = s2n(inputs.regulatory_violations_annual);
    const audit = s2n(inputs.audit_findings_critical);
    metrics.push(
      <MetricRow key="iso"   label="ISO Certifications"
        val={`ISO 14001: ${inputs.iso_14001 ?? '—'} · ISO 45001: ${inputs.iso_45001 ?? '—'}`}
        sub="Environmental & OH&S Management System certification"
        score={(s2n(B.iso14) + s2n(B.iso45)) / 2}
        benchmark="Both Certified = 100 · In Progress = 55 · Not Started = 10" />,
      <MetricRow key="dgms"  label="Directorate General of Mines Safety (DGMS) Compliance" val={dgms > 0 ? `${dgms.toFixed(0)}%` : '—'}
        sub="Directorate General of Mines Safety audit compliance score"
        score={s2n(B.dgms_s)} benchmark=">90% excellent · <70% regulatory action risk" />,
      <MetricRow key="esg"   label="Environmental, Social, and Governance (ESG) Disclosure Score" val={esg > 0 ? `${esg.toFixed(0)} / 100` : '—'}
        sub="Transparency: sustainability reporting, GRI/BRSR framework"
        score={s2n(B.esg_s)} benchmark=">70 strong · 40–70 developing · <30 opaque" />,
      <MetricRow key="viol"  label="Regulatory Violations" val={viol.toFixed(0)}
        sub={`Critical audit findings: ${audit.toFixed(0)} per year`}
        score={s2n(B.viol_s)} benchmark="0 violations = 100 · each violation −20 pts" />,
    );
  } else if (dimKey === 'risk') {
    const fosMean = s2n(inputs.slope_fos_mean);
    const fosSd   = s2n(inputs.slope_fos_sd);
    const beta    = fosSd > 0 ? (fosMean - 1.0) / fosSd : 0;
    const pof     = s2n(inputs.prob_of_failure_pct);
    const cpt     = s2n(inputs.cpt_deg);
    const meth    = s2n(inputs.seam_methane_m3t);
    const lease   = s2n(inputs.lease_years_remaining);
    const nearM   = s2n(inputs.near_miss_count_annual);
    metrics.push(
      <MetricRow key="fos"  label="Slope Stability (FoS)" val={fosMean > 0 ? `${fosMean.toFixed(2)} ± ${fosSd > 0 ? fosSd.toFixed(2) : '—'}` : '—'}
        sub={beta !== 0 ? `β = ${beta.toFixed(2)} (Hasofer-Lind) · Probability of Failure (POF) ${pof.toFixed(1)}% · ${beta>=3?'Very safe':beta>=2?'Acceptable':beta>=1.5?'Marginal':'Critical review needed'}` : `Probability of Failure (POF): ${pof.toFixed(1)}%`}
        score={100 - s2n(B.fos_r)} benchmark="β ≥ 3.0 very safe · β 2–3 acceptable · β < 1.5 critical" />,
      <MetricRow key="cpt"  label="Spontaneous Combustion" val={cpt > 0 ? `CPT ${cpt.toFixed(0)}°C` : '—'}
        sub={cpt >= 175 ? 'Fire-safe coal (Crossing Point Temperature ≥175°C)' : cpt >= 140 ? 'Moderate risk — monitoring required' : 'High fire risk — preventive measures critical'}
        score={100 - s2n(B.cpt_r)} benchmark="CPT >175°C = safe · <140°C = high fire risk" />,
      <MetricRow key="meth" label="Seam Methane" val={meth > 0 ? `${meth.toFixed(2)} m³/t` : '—'}
        sub={meth < 0.5 ? 'Low methane — standard OC procedures' : meth < 1.5 ? 'Moderate — degasification monitoring' : 'High methane — mandatory degasification'}
        score={100 - s2n(B.meth_r)} benchmark="<0.5 m³/t low risk · >1.5 mandatory degasification" />,
      <MetricRow key="nm"   label="Near-Miss Incidents" val={nearM > 0 ? `${nearM.toFixed(0)}/yr` : '—'}
        sub={`Lease remaining: ${lease.toFixed(0)} yr · Litigation: ${s2n(inputs.litigation_count).toFixed(0)} cases`}
        score={100 - s2n(B.nm_r)} benchmark="<15/yr world class · >60/yr systemic safety failure" />,
    );
    // Subtopic: Haul road gradient
    const haulGrad = s2n(inputs.haul_road_gradient_pct);
    const roadW    = s2n(inputs.haul_road_width_m);
    if (haulGrad > 0 || roadW > 0) metrics.push(
      <MetricRow key="road_geo" label="Haul Road Geometry" val={haulGrad > 0 ? `${haulGrad.toFixed(1)}% gradient` : `${roadW.toFixed(0)} m width`}
        sub={[haulGrad > 0 ? (haulGrad <= 6 ? '✓ Gradient within safe limit' : haulGrad <= 10 ? '⚠ Approaching DGMS limit (10%)' : '✗ Exceeds DGMS 10% gradient limit') : '', roadW > 0 ? `Road width ${roadW.toFixed(0)} m (min 12 m for 85 t dumpers)` : ''].filter(Boolean).join(' · ')}
        score={100 - s2n(B.grad_r, 30)} benchmark="Gradient ≤6% excellent · ≤10% DGMS limit · >10% high collision risk" />,
    );
    // Subtopic: Hydrogeological inundation risk
    const depthWTr = s2n(inputs.depth_below_wt_m);
    const aquiferR = s2n(inputs.aquifer_thickness_m);
    if (depthWTr > 0 || aquiferR > 0) metrics.push(
      <MetricRow key="hydro_r" label="Inundation / Groundwater Risk"
        val={depthWTr > 0 ? `${depthWTr.toFixed(0)} m below WT` : `${aquiferR.toFixed(0)} m aquifer`}
        sub={[depthWTr > 0 ? (depthWTr > 60 ? '✓ Deep — low inundation risk' : depthWTr > 20 ? '⚠ Moderate — monitor piezometers' : '✗ Shallow WT — high flood risk') : '', aquiferR > 0 ? `Aquifer ${aquiferR.toFixed(0)} m thick` : ''].filter(Boolean).join(' · ')}
        score={100 - s2n(B.hydro_r, 30)} benchmark="Depth >60 m safe · <10 m requires extensive dewatering plan" />,
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ background: meta?.color + '12', borderBottom: `2px solid ${meta?.color}30` }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta?.color }} />
          <span className="text-xs font-bold" style={{ color: meta?.color }}>
            {meta?.label ?? dimKey}
          </span>
          <span className="text-[9px] text-slate-400 font-medium">{meta?.weight}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
            style={{ background: status(score).bg, color: status(score).tc }}>
            {status(score).label}
          </span>
          <span className="text-base font-black tabular-nums" style={{ color: meta?.color }}>
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] font-bold text-slate-500">
            {contribution >= 0 ? '+' : ''}{contribution.toFixed(1)} pts
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div className="px-4 pt-2.5">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, score)}%`, background: meta?.color }} />
        </div>
      </div>

      {/* Metrics */}
      <div className="px-4 pb-3 pt-1">
        {metrics}
      </div>
    </div>
  );
}

// ── Subtopic Analysis Panel ──────────────────────────────────────────────────
function SubtopicPanel({ breakdowns, inputs }: {
  breakdowns: Record<string, any>;
  inputs: Inp;
}) {
  const B_T = breakdowns.technical     ?? {};
  const B_V = breakdowns.environmental ?? {};
  const B_G = breakdowns.geographical  ?? {};
  const B_R = breakdowns.risk          ?? {};

  const DIM_COLORS: Record<string, string> = {
    technical: '#185FA5', economic: '#1D9E75', environmental: '#3B6D11',
    geographical: '#534AB7', risk: '#A32D2D',
  };
  const DIM_WEIGHTS: Record<string, string> = {
    technical: '12.7%', economic: '17.0%', environmental: '10.1%',
    social: '13.9%', geographical: '13.0%', governance: '6.6%', risk: '26.7%',
  };

  const subtopics = [
    {
      id: 'minelife', icon: '⏱', label: 'Mine Life',
      dims: ['technical'],
      score: 0.55 * s2n(B_T.life_s, 50) + 0.30 * s2n(B_T.prod_s, 50) + 0.15 * s2n(B_T.adv_s, 50),
      keys: [
        { label: 'Mine Life',   val: s2n(inputs.mine_life_yr, s2n(inputs.reserve_mt) / Math.max(s2n(inputs.annual_prod_mty, 1), 0.01)), unit: 'yr' },
        { label: 'Production',  val: s2n(inputs.annual_prod_mty), unit: 'MTPA' },
        { label: 'Reserves',    val: s2n(inputs.reserve_mt), unit: 'Mt' },
      ],
      finding: (sc: number) => sc >= 75 ? 'Long operational horizon — strong investor ROI profile' : sc >= 55 ? 'Adequate mine life — monitor annual production targets' : 'Short mine life — review reserves or reduce production rate',
    },
    {
      id: 'hemm', icon: '🚛', label: 'Heavy Earth-Moving Machinery (HEMM) & Cost',
      dims: ['technical', 'economic'],
      score: 0.40 * s2n(B_T.hemm_s, 65) + 0.25 * s2n(B_T.fleet_s, 65) + 0.20 * s2n(B_T.haul_eff_s, 65) + 0.15 * s2n(B_T.fuel_s, 65),
      keys: [
        { label: 'Heavy Earth-Moving Machinery (HEMM) Avg Avail & Util', val: (s2n(inputs.hemm_availability) + s2n(inputs.hemm_utilisation)) / 2, unit: '%' },
        { label: 'Haul Distance',   val: s2n(inputs.haul_dist_m), unit: 'm' },
        { label: 'Overburden (OB) Cost', val: s2n(inputs.ob_mining_cost), unit: '₹/BCM' },
      ],
      finding: (sc: number) => sc >= 75 ? 'High HEMM productivity — efficient fleet balance and transport' : sc >= 55 ? 'HEMM utilisation or haul distance needs improvement' : 'Low HEMM efficiency — review availability, cycle times, haul design',
    },
    {
      id: 'sr', icon: '📐', label: 'Stripping Ratio',
      dims: ['technical'],
      score: 0.65 * s2n(B_T.sr_s, 50) + 0.35 * s2n(B_T.seam_geom_s, 60),
      keys: [
        { label: 'Overall Stripping Ratio (OSR)', val: s2n(inputs.stripping_ratio_overall), unit: 'BCM:t' },
        { label: 'Break-Even Stripping Ratio (BESR)', val: s2n(inputs.besr), unit: 'BCM:t' },
        { label: 'Seam Dip', val: s2n(inputs.seam_dip_deg), unit: '°' },
      ],
      finding: (sc: number) => sc >= 75 ? 'Favorable SR — OSR well within break-even strip ratio' : sc >= 55 ? 'OSR approaching BESR — monitor unit production costs' : 'SR uneconomic or steep seam dip — reassess mine design',
    },
    {
      id: 'coal', icon: '🔬', label: 'Coal Quality',
      dims: ['technical', 'environmental', 'risk'],
      score: 0.45 * s2n(B_T.gcv_s, 50) + 0.30 * s2n(B_T.ash_s, 50) + 0.15 * s2n(B_V.sulphur_env_s, 70) + 0.10 * (100 - s2n(B_R.cpt_r, 40)),
      keys: [
        { label: 'Gross Calorific Value (GCV)', val: s2n(inputs.gcv_blended), unit: 'kcal/kg' },
        { label: 'Ash',     val: s2n(inputs.ash_pct), unit: '%' },
        { label: 'Sulphur', val: s2n(inputs.sulphur_pct), unit: '%' },
      ],
      finding: (sc: number) => sc >= 75 ? 'Premium coal quality — supports strong price realisation' : sc >= 55 ? 'Marketable — blending or washery may improve grade' : 'Low grade or high ash/sulphur — evaluate beneficiation plant',
    },
    {
      id: 'blast', icon: '💥', label: 'Bench & Blast',
      dims: ['technical', 'risk'],
      score: 0.50 * s2n(B_T.blast_s, 65) + 0.30 * (100 - s2n(B_R.bench_r, 40)) + 0.20 * (100 - s2n(B_R.grad_r, 30)),
      keys: [
        { label: 'Powder Factor', val: s2n(inputs.powder_factor_kgbcm), unit: 'kg/BCM' },
        { label: 'Bench Ht OB',  val: s2n(inputs.bench_height_ob_m), unit: 'm' },
        { label: 'Road Gradient', val: s2n(inputs.haul_road_gradient_pct), unit: '%' },
      ],
      finding: (sc: number) => sc >= 75 ? 'Good blast design — efficient fragmentation and safe geometry' : sc >= 55 ? 'Review burden/spacing design or bench heights for DGMS compliance' : 'Blast design or bench geometry requires urgent geotechnical review',
    },
    {
      id: 'dewater', icon: '💧', label: 'Dewatering',
      dims: ['environmental', 'risk'],
      score: 0.30 * s2n(B_V.dewat_s, 65) + 0.25 * s2n(B_V.hyd_cond_s, 70) + 0.20 * (100 - s2n(B_R.dewat_r, 30)) + 0.15 * s2n(B_V.pump_head_s, 65) + 0.10 * (100 - s2n(B_R.hydro_r, 30)),
      keys: [
        { label: 'Water Inflow Rate', val: s2n(inputs.water_inflow_m3hr), unit: 'm³/hr' },
        { label: 'Pump Capacity',     val: s2n(inputs.pump_capacity_m3hr), unit: 'm³/hr' },
        { label: 'Depth Below Water Table (WT)', val: s2n(inputs.depth_below_wt_m), unit: 'm' },
      ],
      finding: (sc: number) => sc >= 75 ? 'Adequate dewatering — pump capacity safely exceeds inflow rate' : sc >= 55 ? 'Marginal capacity — install piezometer network and standby pumps' : 'High inundation risk — pump capacity must be urgently increased',
    },
    {
      id: 'infra', icon: '🏗', label: 'Infrastructure',
      dims: ['geographical'],
      score: 0.28 * s2n(B_G.rail_s, 60) + 0.22 * s2n(B_G.logi_s, 60) + 0.20 * s2n(B_G.pwr_s, 70) + 0.16 * s2n(B_G.despatch_s, 70) + 0.14 * s2n(B_G.tariff_s, 65),
      keys: [
        { label: 'Rail Distance', val: s2n(inputs.rail_dist_km), unit: 'km' },
        { label: 'Despatch',      val: s2n(inputs.annual_despatch_mty), unit: 'MTPA' },
        { label: 'Grid Power Availability', val: s2n(inputs.grid_power_availability_pct), unit: '%' },
      ],
      finding: (sc: number) => sc >= 75 ? 'Strong logistics infrastructure — competitive rail and power access' : sc >= 55 ? 'Logistics adequate but rail tariff or distance is a constraint' : 'Infrastructure gap — rail connectivity or power reliability must be addressed',
    },
  ];

  return (
    <div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
        Subtopic Analysis — 7 Engineering Sections
      </div>
      <div className="text-[9px] text-slate-400 mb-3">Each subtopic composite score (0–100) aggregates relevant dimension sub-scores and affects MCI through its parent dimension(s).</div>
      <div className="grid md:grid-cols-2 gap-3">
        {subtopics.map(st => {
          const sc = Math.round(Math.min(100, Math.max(0, st.score)) * 10) / 10;
          const st_ = status(sc);
          const keyVals = st.keys.filter(k => k.val > 0);
          return (
            <div key={st.id} className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-sm transition">
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{st.icon}</span>
                  <span className="text-xs font-bold text-slate-700">{st.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: st_.bg, color: st_.tc }}>{st_.label}</span>
                  <span className="text-sm font-black tabular-nums" style={{ color: st_.dot }}>{sc.toFixed(0)}<span className="text-[9px] font-normal text-slate-400">/100</span></span>
                </div>
              </div>
              {/* Score bar */}
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${sc}%`, background: st_.dot }} />
              </div>
              {/* Dimension tags */}
              <div className="flex flex-wrap gap-1 mb-2">
                {st.dims.map(d => (
                  <span key={d} className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                    style={{ background: DIM_COLORS[d] + '1A', color: DIM_COLORS[d] }}>
                    → {d.charAt(0).toUpperCase() + d.slice(1)}{DIM_WEIGHTS[d] ? ` (${DIM_WEIGHTS[d]})` : ''}
                  </span>
                ))}
              </div>
              {/* Key inputs */}
              {keyVals.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {keyVals.map(k => (
                    <span key={k.label} className="text-[9px] bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 text-slate-500">
                      {k.label}: <span className="font-bold text-slate-700">{k.val > 0 ? k.val.toFixed(k.val < 10 ? 2 : 0) : '—'} {k.unit}</span>
                    </span>
                  ))}
                </div>
              )}
              {/* Finding */}
              <p className="text-[9px] text-slate-500 leading-relaxed">{st.finding(sc)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Improvement Roadmap ───────────────────────────────────────────────────────
function ImprovementRoadmap({ contributions }: { contributions: ContribItem[] }) {
  const items = contributions.map(c => {
    const potentialGain = c.weight > 0
      ? +(Math.abs(c.weight) * (100 - c.score)).toFixed(1)
      : +(Math.abs(c.weight) * c.score).toFixed(1);
    const actions: Record<string, string> = {
      economic:     'Reduce OPEX/tonne, renegotiate coal price contracts, optimise D/E ratio',
      technical:    'Improve HEMM utilisation, optimise blast design, increase recovery factor',
      social:       'Implement safety training programs, increase local procurement and hiring',
      geographical: 'Negotiate rail siding upgrade, explore conveyor/ropeway alternatives',
      governance:   'Pursue ISO 14001/45001 certification, strengthen ESG reporting framework',
      environmental:'Increase backfill ratio, install dust suppression, solar power adoption',
      risk:         'Geotechnical monitoring, near-miss reporting culture, CPT testing protocol',
    };
    return { ...c, potentialGain, action: actions[c.key] ?? '' };
  }).sort((a, b) => b.potentialGain - a.potentialGain);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Improvement Roadmap
        </span>
        <span className="text-[9px] text-slate-400">— ranked by potential MCI gain</span>
      </div>
      <div className="space-y-2">
        {items.slice(0, 5).map((item, i) => {
          const st = status(item.score);
          const barW = items[0].potentialGain > 0 ? (item.potentialGain / items[0].potentialGain) * 100 : 0;
          return (
            <div key={item.key} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white"
                style={{ background: item.color }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                  <span className="text-xs font-bold" style={{ color: item.color }}>{item.label}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: st.bg, color: st.tc }}>
                      Score {item.score.toFixed(0)}/100
                    </span>
                    <span className="text-[10px] font-black text-green-700">
                      ▲ +{item.potentialGain.toFixed(1)} pts possible
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full rounded-full" style={{ width: `${barW}%`, background: item.color, opacity: 0.7 }} />
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">{item.action}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[9px] text-slate-400 mt-2 italic">
        * Potential gain assumes score improves to 100 (theoretical maximum); actual gain depends on site-specific constraints.
      </p>
    </div>
  );
}

// ── MCI Contribution bars ─────────────────────────────────────────────────────
function ContributionBars({ contributions, mci }: { contributions: ContribItem[]; mci: number }) {
  const maxAbs = Math.max(...contributions.map(c => Math.abs(c.contribution)));
  const sorted = [...contributions].sort((a, b) => b.contribution - a.contribution);
  return (
    <div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
        Mine Composite Index (MCI) Point Breakdown
      </div>
      <div className="space-y-2">
        {sorted.map(c => {
          const pct = maxAbs > 0 ? (Math.abs(c.contribution) / maxAbs) * 100 : 0;
          return (
            <div key={c.key} className="flex items-center gap-2">
              <div className="w-[86px] text-[10px] font-semibold text-right flex-shrink-0" style={{ color: c.color }}>
                {c.label}
              </div>
              <div className="flex-1 h-5 bg-slate-50 rounded overflow-hidden relative border border-slate-100">
                <div className="absolute left-0 top-0 h-full rounded transition-all duration-500"
                  style={{ width: `${pct}%`, background: c.color, opacity: 0.82 }} />
                <span className="absolute left-2 top-0 h-full flex items-center text-[9px] font-bold text-white z-10">
                  {c.score.toFixed(0)}/100
                </span>
              </div>
              <div className="w-[54px] text-[10px] font-black tabular-nums text-right flex-shrink-0"
                style={{ color: c.color }}>
                {c.contribution >= 0 ? '+' : ''}{c.contribution.toFixed(1)} pt
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-2 border-t-2 border-slate-200 pt-2 mt-1">
          <div className="w-[86px] text-[10px] font-black text-right text-slate-700 flex-shrink-0">Net MCI</div>
          <div className="flex-1 text-[10px] text-slate-400 italic">= sum of all weighted contributions</div>
          <div className="w-[54px] text-[10px] font-black tabular-nums text-right text-[#1F3864] flex-shrink-0">
            = {mci} pts
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Radar ─────────────────────────────────────────────────────────────────────
function DimRadar({ scores }: { scores: Record<string,number> }) {
  const data = Object.entries(scores).map(([k, v]) => ({
    dim: DIM_META[k]?.label ?? k,
    value: v, fullMark: 100,
  }));
  return (
    <ResponsiveContainer width="100%" height={230}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar dataKey="value" stroke="#2E75B6" fill="#2E75B6" fillOpacity={0.15} strokeWidth={2} />
        <Tooltip formatter={(v: number, _: string, entry: any) =>
          [v, entry.payload?.dim]} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Valuation card ────────────────────────────────────────────────────────────
function ValuationCard({ vm }: { vm: { method: string; reason: string; counter: string } }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs">
      <div className="font-bold text-blue-800 mb-0.5">Recommended Valuation: {vm.method}</div>
      <div className="text-blue-700 mb-1.5">{vm.reason}</div>
      <div className="bg-amber-50 border border-amber-200 rounded p-1.5 text-amber-800 text-[10px]">
        Counter-condition: {vm.counter}
      </div>
    </div>
  );
}

// ── Subtopic → MCI Impact Table ──────────────────────────────────────────────
const SUBTOPIC_META_DEF: Record<string, { label: string; icon: string; color: string; effWt: number; dims: string }> = {
  mine_life:       { label: 'Mine Life',                                   icon: '⏱', color: '#185FA5', effWt: 2.3,  dims: 'Technical (12.7%)' },
  hemm_cost:       { label: 'Heavy Earth-Moving Machinery (HEMM) & Cost',  icon: '🚛', color: '#185FA5', effWt: 3.3,  dims: 'Technical (12.7%) + Economic (17.0%)' },
  stripping_ratio: { label: 'Stripping Ratio (SR)',                         icon: '📐', color: '#185FA5', effWt: 2.2,  dims: 'Technical (12.7%)' },
  coal_quality:    { label: 'Coal Quality',                                 icon: '🔬', color: '#534AB7', effWt: 5.8,  dims: 'Technical + Environmental + Risk (Safety)' },
  bench_blast:     { label: 'Bench & Blast Design',                         icon: '💥', color: '#185FA5', effWt: 2.0,  dims: 'Technical (12.7%) + Risk/Safety (26.7%)' },
  dewatering:      { label: 'Dewatering System',                            icon: '💧', color: '#3B6D11', effWt: 2.1,  dims: 'Environmental (10.1%) + Risk/Safety (26.7%)' },
  infrastructure:  { label: 'Infrastructure & Logistics',                   icon: '🏗',  color: '#534AB7', effWt: 8.6,  dims: 'Geographical (13.0%) — 86% of dimension' },
};

function SubtopicImpactTable({ subtopicScores }: { subtopicScores: Record<string, number> }) {
  const CF = 0.87;
  const rows = Object.entries(SUBTOPIC_META_DEF)
    .map(([k, meta]) => {
      const score = subtopicScores[k] ?? 0;
      const headroom = Math.max(0, 80 - score);
      const deltaMCI = +(meta.effWt * (headroom / 100) * CF).toFixed(2);
      return { k, meta, score, headroom, deltaMCI };
    })
    .sort((a, b) => b.deltaMCI - a.deltaMCI);

  const maxDelta = rows[0]?.deltaMCI ?? 1;

  return (
    <div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
        Subtopic → Mine Composite Index (MCI) Impact Pathway
      </div>
      <div className="text-[9px] text-slate-400 mb-3">
        Shows how each engineering subtopic score flows into the Mine Composite Index (MCI) through its parent dimension(s).
        Effective weight = subtopic's share of dimension × dimension ensemble weight.
        Δ MCI potential = effective weight × headroom to score 80 × calibration factor (0.87).
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border border-slate-100 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-[#1F3864] text-white">
              <th className="px-3 py-2 text-left text-[10px] font-semibold">Subtopic</th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold">Feeding Dimensions</th>
              <th className="px-3 py-2 text-center text-[10px] font-semibold">Eff. Wt</th>
              <th className="px-3 py-2 text-center text-[10px] font-semibold">Current Score</th>
              <th className="px-3 py-2 text-center text-[10px] font-semibold">Δ MCI Potential</th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold w-32">Impact Bar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ k, meta, score, deltaMCI }, i) => {
              const st = status(score);
              const barW = maxDelta > 0 ? (deltaMCI / maxDelta) * 100 : 0;
              return (
                <tr key={k} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{meta.icon}</span>
                      <span className="text-[10px] font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-[9px] text-slate-500 max-w-[160px]">{meta.dims}</td>
                  <td className="px-3 py-2 text-center">
                    <span className="text-[10px] font-black tabular-nums" style={{ color: meta.color }}>{meta.effWt}%</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="text-[10px] font-black tabular-nums mr-1" style={{ color: st.dot }}>{score.toFixed(0)}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded font-semibold" style={{ background: st.bg, color: st.tc }}>{st.label}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {deltaMCI > 0 ? (
                      <span className="text-[10px] font-black text-green-700">▲ +{deltaMCI} pts</span>
                    ) : (
                      <span className="text-[9px] text-slate-400">— at target</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="h-3 bg-slate-100 rounded overflow-hidden">
                      <div className="h-full rounded transition-all duration-500"
                        style={{ width: `${barW}%`, background: meta.color + 'bb' }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 border-t-2 border-slate-200">
              <td colSpan={4} className="px-3 py-2 text-[10px] font-bold text-slate-600">
                Total recoverable Mine Composite Index (MCI) gain (if all subtopics reach score 80)
              </td>
              <td className="px-3 py-2 text-center">
                <span className="text-[11px] font-black text-green-700">
                  ▲ +{rows.reduce((s, r) => s + r.deltaMCI, 0).toFixed(1)} pts
                </span>
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-[9px] text-slate-400 mt-1.5 italic">
        * Δ MCI potential = effective weight × max(0, 80 − score) / 100 × 0.87. Target score 80 (Grade A threshold).
        Actual gain depends on site-specific constraints. Subtopics already ≥ 80 show no recoverable gain.
      </p>
    </div>
  );
}

// ── Comparison card ───────────────────────────────────────────────────────────
// SUBTOPIC_META is defined above as SUBTOPIC_META_DEF (shared with SubtopicImpactTable)
const SUBTOPIC_META = SUBTOPIC_META_DEF;

// ±1 MAE confidence band (model MAE ≈ 2.53 pts)
const CI_HALF = 2.53;

function ComparisonCard({ results, comparison }: { results: any; comparison: any }) {
  const absErr = Math.abs(results.mci - comparison.actual_mci);
  const predicted = results.mci;
  const actual    = comparison.actual_mci;
  const ciLo = +(predicted - CI_HALF).toFixed(1);
  const ciHi = +(predicted + CI_HALF).toFixed(1);
  const inBand = actual >= ciLo && actual <= ciHi;

  const dimErrors = Object.entries(comparison.errors as Record<string, any>).filter(([k]) => k !== 'mci');
  const predSub: Record<string, number> | null = comparison.predicted_subtopic_scores ?? null;

  return (
    <div className="card overflow-hidden">
      <div className="bg-[#1F3864] px-4 py-2.5 text-white text-sm font-semibold flex items-center justify-between">
        <span>Model Validation — Actual vs Predicted</span>
        <span className="text-[10px] text-blue-300">{comparison.actual_source}</span>
      </div>
      <div className="p-4 space-y-5">

        {/* ── §1 MCI summary cards ── */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { l: 'Predicted MCI', v: predicted.toFixed(1), bg: '#E6F1FB', tc: '#0C447C' },
            { l: 'Actual (Expert)', v: actual.toFixed(1),  bg: '#E1F5EE', tc: '#085041' },
            { l: 'Abs. Error',
              v: `${absErr.toFixed(2)} pts`,
              bg: absErr < 5 ? '#E1F5EE' : absErr < 10 ? '#FAEEDA' : '#FCEBEB',
              tc: absErr < 5 ? '#085041' : absErr < 10 ? '#633806' : '#501313' },
            { l: '% Error', v: `${comparison.errors?.mci?.pct ?? '—'}%`,
              bg: comparison.errors?.mci?.pct < 8 ? '#E1F5EE' : comparison.errors?.mci?.pct < 15 ? '#FAEEDA' : '#FCEBEB',
              tc: comparison.errors?.mci?.pct < 8 ? '#085041' : comparison.errors?.mci?.pct < 15 ? '#633806' : '#501313' },
          ].map(c => (
            <div key={c.l} className="rounded-lg p-2.5 text-center" style={{ background: c.bg }}>
              <div className="text-[10px] font-medium mb-0.5" style={{ color: c.tc }}>{c.l}</div>
              <div className="font-black text-base" style={{ color: c.tc }}>{c.v}</div>
            </div>
          ))}
        </div>

        {/* ── §2 Confidence interval band ── */}
        <div className={`rounded-lg px-3 py-2 flex items-center gap-3 border ${inBand ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <span className="text-lg">{inBand ? '✅' : '⚠️'}</span>
          <div className="flex-1">
            <div className={`text-xs font-bold ${inBand ? 'text-emerald-800' : 'text-amber-800'}`}>
              {inBand ? 'Actual score falls within model confidence band' : 'Actual score outside ±1 MAE confidence band'}
            </div>
            <div className={`text-[10px] mt-0.5 ${inBand ? 'text-emerald-600' : 'text-amber-700'}`}>
              Predicted {predicted.toFixed(1)} ± {CI_HALF} pts → CI [{ciLo}, {ciHi}] · Actual = {actual.toFixed(1)}
              {' '}· Model MAE = {CI_HALF} pts (target ≤ 5.0)
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`text-[10px] font-semibold ${inBand ? 'text-emerald-700' : 'text-amber-700'}`}>
              Grade: {comparison.actual_grade ?? '—'}
            </div>
          </div>
        </div>

        {/* ── §3 Visual bar comparison (predicted vs actual) ── */}
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Predicted vs Actual — MCI Bar</div>
          <div className="space-y-1.5">
            {[
              { label: 'Predicted', val: predicted, color: '#185FA5' },
              { label: 'Actual',    val: actual,    color: '#1D9E75' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-2">
                <span className="text-[10px] font-semibold w-16 text-right" style={{ color: row.color }}>{row.label}</span>
                <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden relative">
                  <div className="h-full rounded transition-all" style={{ width: `${row.val}%`, background: row.color + 'cc' }} />
                  <span className="absolute right-1.5 top-0 h-full flex items-center text-[10px] font-bold" style={{ color: row.color }}>
                    {row.val.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
            {/* diff line */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold w-16 text-right text-slate-400">Δ Error</span>
              <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden relative">
                <div className="h-full rounded" style={{
                  marginLeft: `${Math.min(predicted, actual)}%`,
                  width: `${absErr}%`,
                  background: absErr < 5 ? '#1D9E75aa' : absErr < 10 ? '#BA7517aa' : '#A32D2Daa',
                }} />
                <span className="absolute right-1.5 top-0 h-full flex items-center text-[10px] font-bold text-slate-500">
                  {predicted > actual ? '+' : '-'}{absErr.toFixed(2)} pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── §4 Per-dimension error table ── */}
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Per-Dimension Error Breakdown</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50">
                {['Dimension', 'Predicted', 'Actual', 'Δ Pts', '% Err', 'Bar'].map(h =>
                  <th key={h} className="px-2 py-1.5 text-left text-[10px] text-slate-500 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {dimErrors.map(([k, v]: any) => {
                const col = DIM_META[k]?.color ?? '#888';
                const pctErr = v.pct ?? (v.actual ? +((Math.abs(v.diff) / v.actual) * 100).toFixed(1) : null);
                const barW = Math.min(100, Math.abs(v.diff) * 2);
                return (
                  <tr key={k} className="border-t border-slate-100">
                    <td className="px-2 py-1.5 font-medium text-[10px]" style={{ color: col }}>{DIM_META[k]?.label ?? k}</td>
                    <td className="px-2 py-1.5 font-semibold tabular-nums text-[10px]" style={{ color: col }}>{v.predicted ?? '—'}</td>
                    <td className="px-2 py-1.5 text-slate-500 tabular-nums text-[10px]">{v.actual ?? '—'}</td>
                    <td className="px-2 py-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${errColor(Math.abs(v.diff) / Math.max(v.actual ?? 1, 1) * 100)}`}>
                        {v.diff != null ? (v.diff > 0 ? '+' : '') + v.diff : '—'}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 tabular-nums text-[10px] text-slate-500">
                      {pctErr != null ? `${pctErr}%` : '—'}
                    </td>
                    <td className="px-2 py-1.5 w-24">
                      <div className="h-2 bg-slate-100 rounded overflow-hidden">
                        <div className="h-full rounded" style={{
                          width: `${barW}%`,
                          background: Math.abs(v.diff) < 5 ? '#1D9E75' : Math.abs(v.diff) < 10 ? '#BA7517' : '#A32D2D',
                        }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-[9px] text-slate-400 mt-1">|Δ| &lt;5 pts = excellent · 5–12 = acceptable · &gt;12 = model calibration review</p>
        </div>

        {/* ── §5 Subtopic score profile (predicted only — actual subtopics not stored) ── */}
        {predSub && Object.keys(predSub).length > 0 && (
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Engineering Sub-topic Score Profile (Predicted)</div>
            <div className="grid grid-cols-1 gap-1.5">
              {Object.entries(predSub).map(([k, val]) => {
                const meta = SUBTOPIC_META[k];
                if (!meta) return null;
                const score = val as number;
                const status = score >= 75 ? 'Strong' : score >= 55 ? 'Moderate' : 'Weak';
                const statusCls = score >= 75 ? 'bg-emerald-100 text-emerald-700' : score >= 55 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
                return (
                  <div key={k} className="flex items-center gap-2">
                    <span className="text-xs w-5 text-center">{meta.icon}</span>
                    <span className="text-[10px] font-semibold w-28 truncate" style={{ color: meta.color }}>{meta.label}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded overflow-hidden">
                      <div className="h-full rounded" style={{ width: `${score}%`, background: meta.color + 'bb' }} />
                    </div>
                    <span className="text-[10px] font-bold tabular-nums w-8 text-right" style={{ color: meta.color }}>{score.toFixed(0)}</span>
                    <span className={`text-[9px] font-semibold px-1 py-0.5 rounded ${statusCls}`}>{status}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-slate-400 mt-1.5">Sub-topic actual scores are not collected — only predicted values shown above.</p>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export function ResultPanel({
  results, comparison, inputs = {},
}: {
  results: any; comparison: any; inputs?: Record<string, unknown>;
}) {
  const gs = gradeStyle(results.grade);
  const contributions = computeContributions(results.dimension_scores ?? {}, results.weights ?? {});
  const breakdowns = results.breakdowns ?? {};
  const beta = results.reliability_index_beta;
  const srViab = results.sr_viability_pct;

  const gradeDesc: Record<string, string> = {
    A: 'Investment Grade — proceed with full capital commitment',
    B: 'Viable — address weakest dimension before commitment',
    C: 'Marginal — staged investment; sensitivity analysis required',
    D: 'Non-investment Grade — remediation plan required before funding',
  };

  return (
    <div className="space-y-4">

      {/* ── 1. HERO: MCI Score + Grade + Key Derived Metrics ── */}
      <div className="card p-5">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center mb-2">
          Mine Composite Index (MCI)
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Gauge */}
          <div className="flex-shrink-0 w-48">
            <MCIGauge mci={results.mci} grade={results.grade} />
            <div className="text-center -mt-1">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-sm"
                style={{ background: gs.bg, color: gs.tc, border: `2px solid ${gs.bc}` }}>
                Grade {results.grade}
              </span>
            </div>
          </div>

          {/* Right: description + key derived indicators */}
          <div className="flex-1">
            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-3">
              {gradeDesc[results.grade] ?? results.recommendation}
            </p>

            {/* Key derived metric chips */}
            <div className="grid grid-cols-2 gap-2">
              {beta !== undefined && (
                <div className="rounded-xl border p-2.5 bg-blue-50 border-blue-100">
                  <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wide">β (Beta) Reliability Index</div>
                  <div className="text-xl font-black text-blue-700 font-mono">{beta.toFixed(2)}</div>
                  <div className="text-[9px] text-blue-500">
                    {beta >= 3.0 ? '✓ Very safe (β ≥ 3.0)' : beta >= 2.0 ? '⚠ Acceptable (β ≥ 2.0)' : beta >= 1.5 ? '⚠ Marginal (β < 2.0)' : '✗ Critical (β < 1.5)'}
                  </div>
                  <div className="text-[8px] text-blue-300 mt-0.5">Hasofer-Lind: β = (FoS−1)/σ</div>
                </div>
              )}
              {srViab !== undefined && (
                <div className={`rounded-xl border p-2.5 ${srViab > 20 ? 'bg-emerald-50 border-emerald-100' : srViab > 0 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                  <div className={`text-[9px] font-bold uppercase tracking-wide ${srViab > 20 ? 'text-emerald-400' : srViab > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                    Stripping Ratio (SR) Viability Margin
                  </div>
                  <div className={`text-xl font-black font-mono ${srViab > 20 ? 'text-emerald-700' : srViab > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    {srViab.toFixed(1)}%
                  </div>
                  <div className={`text-[9px] ${srViab > 20 ? 'text-emerald-500' : srViab > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                    {srViab > 20 ? '✓ Comfortable margin above BESR' : srViab > 0 ? '⚠ Thin margin above BESR' : '✗ OSR exceeds break-even SR'}
                  </div>
                  <div className="text-[8px] text-slate-400 mt-0.5">max(0,(BESR−OSR)/BESR×100)</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. MCI POINT BREAKDOWN ── */}
      <div className="card p-4">
        <ContributionBars contributions={contributions} mci={results.mci} />
      </div>

      {/* ── 2b. DIMENSION SCORES BAR CHART ── */}
      <div className="card p-4">
        <DimBarChart scores={results.dimension_scores ?? {}} />
      </div>

      {/* ── 3. DIMENSION DEEP-DIVE (7 cards) ── */}
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          7-Dimension Deep-Dive — key sub-metrics with benchmarks
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {Object.entries(results.dimension_scores ?? {}).map(([k, v]) => (
            <DimCard
              key={k}
              dimKey={k}
              score={v as number}
              contribution={contributions.find(c => c.key === k)?.contribution ?? 0}
              inputs={inputs}
              breakdowns={breakdowns}
            />
          ))}
        </div>
      </div>

      {/* ── 4. SUBTOPIC ANALYSIS ── */}
      <div className="card p-4">
        <SubtopicPanel breakdowns={breakdowns} inputs={inputs} />
      </div>

      {/* ── 4b. SUBTOPIC → MCI IMPACT TABLE ── */}
      {results.subtopic_scores && Object.keys(results.subtopic_scores).length > 0 && (
        <div className="card p-4">
          <SubtopicImpactTable subtopicScores={results.subtopic_scores} />
        </div>
      )}

      {/* ── 5. IMPROVEMENT ROADMAP ── */}
      <div className="card p-4">
        <ImprovementRoadmap contributions={contributions} />
      </div>

      {/* ── 6. RADAR CHART ── */}
      <div className="card p-4">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
          Dimension Profile — Spider Chart
        </div>
        <div className="text-[9px] text-slate-400 mb-1">Risk (Safety) = safety management quality — outer ring = safer/better managed</div>
        <DimRadar scores={results.dimension_scores} />
      </div>

      {/* ── 6b. INPUT PARAMETERS SUMMARY ── */}
      <InputSummary inputs={inputs} />

      {/* ── 7. VALUATION METHOD ── */}
      {results.valuation_method && <ValuationCard vm={results.valuation_method} />}

      {/* ── 8. VALIDATION (if validate mine) ── */}
      {comparison?.has_actual && (
        <ComparisonCard results={results} comparison={comparison} />
      )}

      {/* ── 9. DECISION SUMMARY ── */}
      <DecisionSummary
        mci={results.mci}
        grade={results.grade}
        scores={results.dimension_scores ?? {}}
      />
    </div>
  );
}

export default ResultPanel;
