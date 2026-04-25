'use client';
import { useState, useEffect } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  BarChart, Bar, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { api, DIM_META, gradeClass } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ValidateMine {
  mine_id: string;
  mine_name: string;
  subsidiary: string;
  formula_mci: number;
  actual_mci: number;
  formula_grade: string;
  actual_grade: string;
  diff: number;
  abs_diff: number;
  pct_error: number;
  dimension_scores: Record<string, number>;
  subtopic_scores: Record<string, number>;
  actual_scores: Record<string, number | string>;
  source: string;
}

interface PredRow {
  _id: string;
  mine_name: string;
  mine_ref: string;
  session_label: string;
  formula_mci: number;
  grade: string;
  has_actual: boolean;
  actual_mci?: number;
  abs_diff?: number;
  status: string;
  createdAt: string;
}

interface Metrics {
  mae: number;
  r2: number | null;
  n_validate: number;
  n_predictions: number;
  mae_target: number;
  r2_target: number;
}

interface CompareData {
  validate_comparisons: ValidateMine[];
  predictions: PredRow[];
  metrics: Metrics;
}

// ── Residual colour coding ────────────────────────────────────────────────────
function residualColor(abs: number) {
  if (abs <= 3) return { bg: 'bg-green-100', text: 'text-green-800', label: 'Excellent' };
  if (abs <= 7) return { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Acceptable' };
  return { bg: 'bg-red-100', text: 'text-red-800', label: 'High' };
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    predicted:   'bg-blue-100 text-blue-700',
    edited:      'bg-amber-100 text-amber-700',
    reevaluated: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

// ── Custom scatter dot ────────────────────────────────────────────────────────
function CustomDot(props: Record<string, unknown>) {
  const { cx, cy, payload } = props as { cx: number; cy: number; payload: { abs_diff: number; mine_name: string } };
  const c = residualColor(payload.abs_diff);
  const fill = c.label === 'Excellent' ? '#16a34a' : c.label === 'Acceptable' ? '#d97706' : '#dc2626';
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={fill} fillOpacity={0.85} stroke="#fff" strokeWidth={1.5} />
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize={9} fill="#334155">{payload.mine_name.split(' ')[0]}</text>
    </g>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ComparePage() {
  const [data,    setData]    = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [tab,     setTab]     = useState<'validate' | 'history'>('validate');

  useEffect(() => {
    api.get('/api/compare')
      .then((d: CompareData) => { setData(d); setLoading(false); })
      .catch(() => { setError('Cannot connect to API'); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading comparison data…</div>;
  if (error)   return <div className="p-6 text-red-600 font-medium">{error}</div>;
  if (!data)   return null;

  const { validate_comparisons: vc, predictions, metrics } = data;

  // Scatter plot: formula_mci on X (y_pred), actual_mci on Y (y_true)
  const scatterPoints = vc.map(v => ({ x: v.formula_mci, y: v.actual_mci, mine_name: v.mine_name, abs_diff: v.abs_diff }));

  // Side-by-side bar data
  const barData = vc.map(v => ({
    name: v.mine_name.split(' ')[0],
    'Formula MCI (y_pred)': v.formula_mci,
    'Actual Score (y_true)': v.actual_mci,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F3864]">Formula vs Actual Comparison</h1>
        <p className="text-sm text-slate-500 mt-1">
          <span className="font-semibold text-[#185FA5]">Formula MCI</span> (y_pred) — analytical score computed from 150+ parameters using CMEM formulas.{' '}
          <span className="font-semibold text-[#A32D2D]">Actual Score</span> (y_true) — independent expert assessment from mine annual reports / DGMS inspections.
          Small residuals on <em>held-out validate mines</em> demonstrate that the formula generalises to unseen data.
        </p>
      </div>

      {/* Metrics strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Validate Mines', val: metrics.n_validate, sub: 'held out — never in training', color: 'text-[#185FA5]' },
          { label: 'MAE', val: metrics.mae != null ? `${metrics.mae} pts` : '—', sub: `target < ${metrics.mae_target} pts`, color: metrics.mae != null && metrics.mae <= metrics.mae_target ? 'text-green-700' : 'text-amber-700' },
          { label: 'R²', val: metrics.r2 != null ? metrics.r2.toFixed(3) : '—', sub: `target > ${metrics.r2_target}`, color: metrics.r2 != null && metrics.r2 >= metrics.r2_target ? 'text-green-700' : 'text-amber-700' },
          { label: 'History Predictions', val: metrics.n_predictions, sub: 'total saved evaluations', color: 'text-slate-700' },
        ].map(m => (
          <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">{m.label}</div>
            <div className={`text-2xl font-black ${m.color}`}>{m.val}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {(['validate', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition
              ${tab === t ? 'bg-white border border-b-white border-slate-200 text-[#1F3864] -mb-px' : 'text-slate-500 hover:text-slate-700'}`}>
            {t === 'validate' ? `Validate Mines (${vc.length})` : `Prediction History (${predictions.length})`}
          </button>
        ))}
      </div>

      {tab === 'validate' && (
        <div className="space-y-6">
          {/* Scatter plot */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-bold text-slate-700 mb-1">Scatter Plot — Formula MCI vs Actual Expert Score</h2>
            <p className="text-[11px] text-slate-400 mb-4">
              x-axis = Formula MCI (y_pred) · y-axis = Actual Expert Score (y_true) · Diagonal = perfect agreement (y_pred = y_true)
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="x" domain={[40, 80]} label={{ value: 'Formula MCI — y_pred', position: 'insideBottom', offset: -15, fontSize: 11 }} tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="y" domain={[40, 80]} label={{ value: 'Actual Score — y_true', angle: -90, position: 'insideLeft', fontSize: 11 }} tick={{ fontSize: 10 }} />
                <ReferenceLine segment={[{ x: 40, y: 40 }, { x: 80, y: 80 }]} stroke="#94a3b8" strokeDasharray="6 3" label={{ value: 'Perfect (y=x)', fill: '#94a3b8', fontSize: 9 }} />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload as { x: number; y: number; mine_name: string; abs_diff: number };
                    return (
                      <div className="bg-white border border-slate-200 rounded-lg p-2 text-xs shadow">
                        <div className="font-semibold text-slate-700">{d.mine_name}</div>
                        <div>Formula MCI: <span className="font-bold text-[#185FA5]">{d.x}</span></div>
                        <div>Actual: <span className="font-bold text-[#A32D2D]">{d.y}</span></div>
                        <div>|Δ|: <span className="font-bold">{d.abs_diff} pts</span></div>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterPoints} shape={<CustomDot />} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Side-by-side bar chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-bold text-slate-700 mb-4">Side-by-Side: Formula MCI vs Actual Expert Score</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => v.toFixed(1)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Formula MCI (y_pred)" fill="#185FA5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual Score (y_true)" fill="#A32D2D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Residual table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-700">Residual Table — Validate Mines</h2>
              <p className="text-[10px] text-slate-400">Colour: green |Δ| ≤ 3 pts · amber |Δ| ≤ 7 pts · red |Δ| &gt; 7 pts</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    {['Mine', 'Formula MCI (y_pred)', 'Actual (y_true)', '|Δ| pts', '% Error', 'Formula Grade', 'Actual Grade', 'Residual'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vc.map(v => {
                    const rc = residualColor(v.abs_diff);
                    return (
                      <tr key={v.mine_id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium">{v.mine_name}</td>
                        <td className="px-3 py-2 font-bold text-[#185FA5]">{v.formula_mci}</td>
                        <td className="px-3 py-2 font-bold text-[#A32D2D]">{v.actual_mci}</td>
                        <td className={`px-3 py-2 font-bold ${rc.text}`}>{v.abs_diff}</td>
                        <td className="px-3 py-2">{v.pct_error}%</td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded font-bold text-[10px] ${gradeClass(v.formula_grade)}`}>{v.formula_grade}</span></td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded font-bold text-[10px] ${gradeClass(v.actual_grade)}`}>{v.actual_grade}</span></td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${rc.bg} ${rc.text}`}>{rc.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {vc.length === 0 && <div className="p-8 text-center text-slate-400 text-sm">No validate mines with actual scores found.</div>}
          </div>

          {/* Subtopic breakdown across validate mines */}
          {vc.some(v => v.subtopic_scores) && (() => {
            const SUBTOPIC_KEYS: { key: string; label: string; icon: string; color: string }[] = [
              { key: 'mine_life',       label: 'Mine Life',       icon: '⏱', color: '#185FA5' },
              { key: 'hemm_cost',       label: 'HEMM & Cost',     icon: '🚛', color: '#185FA5' },
              { key: 'stripping_ratio', label: 'Stripping Ratio', icon: '📐', color: '#185FA5' },
              { key: 'coal_quality',    label: 'Coal Quality',    icon: '🔬', color: '#534AB7' },
              { key: 'bench_blast',     label: 'Bench & Blast',   icon: '💥', color: '#185FA5' },
              { key: 'dewatering',      label: 'Dewatering',      icon: '💧', color: '#3B6D11' },
              { key: 'infrastructure',  label: 'Infrastructure',  icon: '🏗', color: '#534AB7' },
            ];
            return (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-700">Subtopic Score Profile — Validate Mines</h2>
                  <p className="text-[10px] text-slate-400">7 engineering section scores for each validate mine (computed analytically — no direct actual comparison)</p>
                </div>
                <div className="overflow-x-auto p-4">
                  <div className="grid gap-3">
                    {SUBTOPIC_KEYS.map(({ key, label, icon, color }) => {
                      const scores = vc.map(v => ({ name: v.mine_name.split(' ')[0], score: v.subtopic_scores?.[key] ?? 0 }));
                      const avg = scores.reduce((s, x) => s + x.score, 0) / Math.max(scores.length, 1);
                      return (
                        <div key={key}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{icon}</span>
                            <span className="text-xs font-bold" style={{ color }}>{label}</span>
                            <span className="text-[10px] text-slate-400 ml-auto">avg {avg.toFixed(1)}/100</span>
                          </div>
                          <div className="flex gap-2">
                            {scores.map(({ name, score }) => {
                              const fill = score >= 70 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
                              return (
                                <div key={name} className="flex-1">
                                  <div className="h-5 bg-slate-100 rounded overflow-hidden relative">
                                    <div className="h-full rounded transition-all" style={{ width: `${score}%`, background: fill, opacity: 0.75 }} />
                                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">{score}</span>
                                  </div>
                                  <div className="text-[9px] text-slate-400 text-center mt-0.5">{name}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
            <p className="font-semibold mb-1">Validation Methodology</p>
            <p>
              No external MPI index exists for Indian OC coal mines. The CMEM formula score is computed analytically from domain
              formulas and verified against independent expert assessments published in mine annual reports and DGMS inspection reports.
              Validate mines were <strong>never used</strong> to derive the ensemble weights — they serve as a held-out test set.
              A MAE &lt; 5 pts and residuals falling within ±1 grade boundary confirm the formula captures genuine mining economics.
            </p>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {predictions.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
              No predictions saved yet. <a href="/predict" className="text-[#185FA5] underline">Run a prediction →</a>
            </div>
          )}
          {predictions.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-700">All Prediction History</h2>
                <p className="text-[10px] text-slate-400">Predictions from the History page — formula MCI scores for each saved evaluation</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      {['Mine Name', 'Session', 'Formula MCI', 'Grade', 'Has Actual', 'Actual MCI', '|Δ| pts', 'Status', 'Date'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map(p => (
                      <tr key={p._id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium">{p.mine_name}</td>
                        <td className="px-3 py-2 text-slate-400">{p.session_label || '—'}</td>
                        <td className="px-3 py-2 font-bold text-[#185FA5]">{p.formula_mci ?? '—'}</td>
                        <td className="px-3 py-2">
                          {p.grade && <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${gradeClass(p.grade)}`}>{p.grade}</span>}
                        </td>
                        <td className="px-3 py-2">{p.has_actual ? <span className="text-green-700 font-semibold">Yes</span> : <span className="text-slate-400">No</span>}</td>
                        <td className="px-3 py-2">{p.actual_mci ?? '—'}</td>
                        <td className="px-3 py-2">
                          {p.abs_diff != null ? (
                            <span className={`font-bold ${residualColor(p.abs_diff).text}`}>{p.abs_diff}</span>
                          ) : '—'}
                        </td>
                        <td className="px-3 py-2"><StatusBadge status={p.status || 'predicted'} /></td>
                        <td className="px-3 py-2 text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
