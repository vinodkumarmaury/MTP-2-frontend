'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const DIM_COLOR: Record<string, string> = {
  technical:     '#185FA5',
  economic:      '#1D9E75',
  environmental: '#3B6D11',
  social:        '#BA7517',
  geographical:  '#534AB7',
  governance:    '#6B48C4',
  risk:          '#A32D2D',
};
const DIM_WEIGHT: Record<string, string> = {
  technical: '12.7%', economic: '17.0%', environmental: '10.1%',
  social: '13.9%', geographical: '13.0%', governance: '6.6%', risk: '+26.7%'
};

const SUBTOPICS = [
  { key: 'mine_life',       label: 'Mine Life',       icon: '⏱', color: '#185FA5', dims: 'Technical' },
  { key: 'hemm_cost',       label: 'Heavy Earth-Moving Machinery (HEMM) & Cost',     icon: '🚛', color: '#185FA5', dims: 'Technical + Economic' },
  { key: 'stripping_ratio', label: 'Stripping Ratio', icon: '📐', color: '#185FA5', dims: 'Technical' },
  { key: 'coal_quality',    label: 'Coal Quality',    icon: '🔬', color: '#534AB7', dims: 'Technical + Env + Risk' },
  { key: 'bench_blast',     label: 'Bench & Blast',   icon: '💥', color: '#185FA5', dims: 'Technical + Risk' },
  { key: 'dewatering',      label: 'Dewatering',      icon: '💧', color: '#3B6D11', dims: 'Environmental + Risk' },
  { key: 'infrastructure',  label: 'Infrastructure',  icon: '🏗', color: '#534AB7', dims: 'Geographical' },
];

function GradeBox({ grade, mci }: { grade: string; mci: number }) {
  const map: Record<string, { bg: string; tc: string; label: string; desc: string }> = {
    A: { bg: '#E1F5EE', tc: '#085041', label: 'Excellent', desc: 'Investment Grade — Proceed' },
    B: { bg: '#E6F1FB', tc: '#0C447C', label: 'Good',      desc: 'Viable — Address Weak Dims' },
    C: { bg: '#FAEEDA', tc: '#633806', label: 'Marginal',  desc: 'High-risk — Staged Investment' },
    D: { bg: '#FCEBEB', tc: '#501313', label: 'High Risk', desc: 'Non-investment Grade' },
  };
  const s = map[grade] ?? map.D;
  return (
    <div style={{ background: s.bg, border: `2px solid ${s.tc}`, borderRadius: 12, padding: '16px 24px', display: 'inline-block', textAlign: 'center', minWidth: 180 }}>
      <div style={{ color: s.tc, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Grade {grade}</div>
      <div style={{ color: s.tc, fontSize: 48, fontWeight: 900, lineHeight: 1, margin: '4px 0' }}>{mci.toFixed(1)}</div>
      <div style={{ color: s.tc, fontSize: 14, fontWeight: 700 }}>{s.label}</div>
      <div style={{ color: s.tc, fontSize: 10, marginTop: 2, opacity: 0.8 }}>{s.desc}</div>
    </div>
  );
}

function ScoreBar({ dim, score, weight }: { dim: string; score: number; weight: string }) {
  const color = DIM_COLOR[dim] ?? '#888';
  const isRisk = dim === 'risk';
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'capitalize' }}>
          {dim} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({weight})</span>
        </span>
        <span style={{ fontSize: 12, fontWeight: 900, color: isRisk ? '#A32D2D' : color, fontFamily: 'monospace' }}>
          {score.toFixed(1)}
        </span>
      </div>
      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${score}%`, borderRadius: 4,
          background: isRisk
            ? `linear-gradient(90deg, ${color}66, ${color})`
            : `linear-gradient(90deg, ${color}99, ${color})`,
        }} />
      </div>
    </div>
  );
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const [rec, setRec]         = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');

  useEffect(() => {
    api.get(`/api/history/${params.id}`)
      .then(d => { setRec(d); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  }, [params.id]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading report…</div>;
  if (err || !rec) return <div className="p-8 text-center text-red-600">Error: {err || 'Record not found'}</div>;

  const r = rec.results;
  const dims = r?.dimension_scores ?? {};
  const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <>
      {/* Print button — hidden in print */}
      <div className="print:hidden mb-4 flex gap-3 items-center">
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-primary px-6 py-2 text-sm"
        >
          🖨️ Print / Save as PDF
        </button>
        <span className="text-xs text-slate-400">
          In the print dialog, select &ldquo;Save as PDF&rdquo; and choose A4 paper for best results.
        </span>
      </div>

      {/* ── REPORT CONTENT ── */}
      <div id="report" style={{ fontFamily: 'Georgia, serif', color: '#1e293b', maxWidth: 780, margin: '0 auto', padding: '0 20px' }}>

        {/* Cover header */}
        <div style={{ background: '#1F3864', color: 'white', borderRadius: 12, padding: '28px 32px', marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#93C5FD', marginBottom: 6 }}>
            M.Tech Thesis · IIT Kharagpur · Mining Engineering · 2026
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
            Composite Mine Evaluation Report
          </div>
          <div style={{ fontSize: 17, color: '#BFDBFE', marginBottom: 8 }}>
            {rec.mine_name}
          </div>
          <div style={{ fontSize: 10, color: '#93C5FD', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <span>Model: CMEM v3.0</span>
            <span>7 Dimensions · 150+ Parameters</span>
            <span>Weights: Analytic Hierarchy Process (AHP) + Entropy Weight Method (EWM) + CRITIC Ensemble</span>
            <span>Generated: {now}</span>
          </div>
        </div>

        {/* Result + grade */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap' }}>
          <GradeBox grade={r.grade} mci={r.mci} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              Recommendation
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: '#1e293b' }}>
              {r.recommendation}
            </div>
            {r.valuation_method && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, borderLeft: '3px solid #1F3864', fontSize: 11 }}>
                <strong>Valuation Method:</strong> {r.valuation_method.method}<br />
                <span style={{ color: '#64748b' }}>{r.valuation_method.reason}</span>
              </div>
            )}
          </div>
        </div>

        {/* Special metrics */}
        {(r.reliability_index_beta !== undefined || r.sr_viability_pct !== undefined) && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            {r.reliability_index_beta !== undefined && (
              <div style={{ flex: 1, minWidth: 150, border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', background: '#fff' }}>
                <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>β Reliability Index</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#185FA5', fontFamily: 'monospace' }}>
                  {r.reliability_index_beta.toFixed(2)}
                </div>
                <div style={{ fontSize: 9, color: '#64748b' }}>Hasofer-Lind β = (Factor of Safety (FoS)−1)/σ · Safe ≥ 2.0</div>
              </div>
            )}
            {r.sr_viability_pct !== undefined && (
              <div style={{ flex: 1, minWidth: 150, border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', background: '#fff' }}>
                <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>SR Viability</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#1D9E75', fontFamily: 'monospace' }}>
                  {r.sr_viability_pct.toFixed(1)}%
                </div>
                <div style={{ fontSize: 9, color: '#64748b' }}>max(0, (Break-Even Stripping Ratio (BESR)−Overall Stripping Ratio (OSR))/BESR×100) · Higher = more margin</div>
              </div>
            )}
          </div>
        )}

        {/* Section divider */}
        <div style={{ borderBottom: '2px solid #1F3864', marginBottom: 16, paddingBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#1F3864', textTransform: 'uppercase', letterSpacing: 1 }}>
            7-Dimension Score Profile
          </span>
        </div>

        {/* Dimension scores */}
        <div style={{ marginBottom: 28 }}>
          {Object.entries(dims).map(([dim, score]) => (
            <ScoreBar key={dim} dim={dim} score={score as number} weight={DIM_WEIGHT[dim] ?? ''} />
          ))}
        </div>

        {/* Subtopic Profile */}
        {r?.subtopic_scores && Object.keys(r.subtopic_scores).length > 0 && (
          <>
            <div style={{ borderBottom: '2px solid #1F3864', marginBottom: 16, paddingBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#1F3864', textTransform: 'uppercase', letterSpacing: 1 }}>
                Engineering Section Score Profile
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px 20px', marginBottom: 28 }}>
              {SUBTOPICS.map(st => {
                const score = (r.subtopic_scores as Record<string, number>)[st.key];
                if (score === undefined) return null;
                const pct = Math.min(100, Math.max(0, score));
                const status = pct >= 75 ? 'Strong' : pct >= 55 ? 'Moderate' : 'Weak';
                const statusCol = pct >= 75 ? '#1D9E75' : pct >= 55 ? '#BA7517' : '#A32D2D';
                return (
                  <div key={st.key} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: st.color }}>
                        {st.icon} {st.label}
                      </span>
                      <span style={{ fontSize: 10, color: statusCol, fontWeight: 700 }}>
                        {score.toFixed(1)} · {status}
                      </span>
                    </div>
                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginBottom: 3 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${st.color}88, ${st.color})`, borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>Dims: {st.dims}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Comparison section (if validate mine) */}
        {rec.comparison?.has_actual && (
          <>
            <div style={{ borderBottom: '2px solid #1F3864', marginBottom: 16, paddingBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#1F3864', textTransform: 'uppercase', letterSpacing: 1 }}>
                Validation Comparison
              </span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
              {[
                { label: 'Formula MCI (CMEM)',     val: rec.comparison.formula_mci?.toFixed(1),  color: '#185FA5' },
                { label: 'Expert Score (Actual)',  val: rec.comparison.actual_mci?.toFixed(1),   color: '#1D9E75' },
                { label: 'Absolute Error',         val: `${Math.abs(rec.comparison.errors?.mci?.diff ?? 0).toFixed(2)} pts`, color: '#BA7517' },
                { label: '% Error',                val: `${rec.comparison.errors?.mci?.pct?.toFixed(1) ?? '—'}%`, color: '#A32D2D' },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, minWidth: 130, border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: 'monospace' }}>{s.val}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Key input summary */}
        <div style={{ borderBottom: '2px solid #1F3864', marginBottom: 16, paddingBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#1F3864', textTransform: 'uppercase', letterSpacing: 1 }}>
            Key Input Parameters
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px 20px', marginBottom: 28 }}>
          {[
            ['Gross Calorific Value (GCV) (Coal Quality)',    rec.inputs?.gcv_blended,          'kcal/kg'],
            ['Operating Stripping Ratio (SR)',         rec.inputs?.stripping_ratio_overall, 'BCM:t'],
            ['Break-Even Stripping Ratio (BESR)',        rec.inputs?.besr,                  'BCM:t'],
            ['Annual Production',    rec.inputs?.annual_prod_mty,       'MTPA'],
            ['Mine Life',            rec.inputs?.mine_life_yr,          'yr'],
            ['Net Present Value (NPV)',                  rec.inputs?.npv_cr ? `₹${rec.inputs.npv_cr}` : '—', 'Cr'],
            ['Internal Rate of Return (IRR)',                  rec.inputs?.irr_pct,               '%'],
            ['Lost Time Injury Frequency Rate (LTIFR)',                rec.inputs?.ltifr,                 ''],
            ['Slope Factor of Safety (FoS)',            rec.inputs?.slope_fos_mean,        ''],
            ['Hasofer-Lind Reliability Index (β)',  r.reliability_index_beta?.toFixed(2), ''],
            ['Heavy Earth-Moving Machinery (HEMM) Availability',    rec.inputs?.hemm_availability,     '%'],
            ['Rail Distance',        rec.inputs?.rail_dist_km,          'km'],
          ].map(([label, val, unit]) => (
            <div key={label as string} style={{ borderBottom: '1px solid #f1f5f9', padding: '4px 0' }}>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>{label}: </span>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>
                {val ?? '—'}{unit ? ` ${unit}` : ''}
              </span>
            </div>
          ))}
        </div>

        {/* Model overview */}
        <div style={{ borderBottom: '2px solid #1F3864', marginBottom: 14, paddingBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#1F3864', textTransform: 'uppercase', letterSpacing: 1 }}>
            CMEM Model Overview
          </span>
        </div>
        <div style={{ fontSize: 10, lineHeight: 1.7, color: '#475569', marginBottom: 20 }}>
          <p style={{ marginBottom: 8 }}>
            The <strong>Composite Mine Evaluation Model (CMEM v3.0)</strong> is a multi-criteria decision analysis framework
            developed for evaluating Open-Cast coal mine viability. It aggregates 150+ operational parameters across
            seven dimensions using an ensemble weighting scheme derived from three independent methods:
            <strong> Analytic Hierarchy Process (AHP)</strong> (50% weight),
            <strong> Entropy Weight Method (EWM)</strong> (30% weight), and
            <strong> CRITIC method</strong> (20% weight).
          </p>
          <p style={{ marginBottom: 8 }}>
            The Mine Composite Index (MCI) formula: MCI = 0.170·Economic + 0.127·Technical + 0.139·Social + 0.130·Geographical + 0.101·Environmental + 0.066·Governance − 0.267·Risk
          </p>
          <p>
            Validated against {'{4}'} reference mines with known expert scores. Target: MAE &lt; 5 pts, R² &gt; 0.90.
            Reference mines include 2 Australian OC mines (Curragh, Meandu) for international benchmarking.
          </p>
        </div>

        {/* Notes */}
        {rec.notes && (
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px', marginBottom: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Evaluator Notes
            </div>
            <div style={{ fontSize: 11, color: '#1e293b', lineHeight: 1.6 }}>{rec.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8' }}>
          <span>CMEM v3.0 · Composite Mine Evaluation Model · IIT Kharagpur Mining Engineering · 2026</span>
          <span>Generated: {now} · Record ID: {params.id}</span>
        </div>
      </div>

      {/* Print stylesheet */}
      <style>{`
        @media print {
          body { background: white !important; }
          nav, footer, .print\\:hidden { display: none !important; }
          main { padding: 0 !important; max-width: none !important; }
          #report { max-width: none !important; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>
    </>
  );
}
