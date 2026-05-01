'use client';
import { useState, useEffect } from 'react';
import { api, DIM_META } from '@/lib/api';

// ── Grade → static Tailwind classes (gradeStyle replaced by lookup) ───────────
const GRADE_CLASSES: Record<string, { num: string; badge: string }> = {
  A: { num: 'text-[#085041]', badge: 'bg-[#E1F5EE] text-[#085041]' },
  B: { num: 'text-[#0C447C]', badge: 'bg-[#E6F1FB] text-[#0C447C]' },
  C: { num: 'text-[#633806]', badge: 'bg-[#FAEEDA] text-[#633806]' },
  D: { num: 'text-[#501313]', badge: 'bg-[#FCEBEB] text-[#501313]' },
};
function gradeClasses(g: string) {
  return GRADE_CLASSES[g] ?? GRADE_CLASSES['D'];
}

// Diff color: positive = blue, negative = red, zero = grey — static classes
function diffClass(diff: number) {
  if (diff > 0)  return 'text-[#185FA5]';
  if (diff < 0)  return 'text-[#A32D2D]';
  return 'text-slate-400';
}

// ── Static Tailwind color classes for each DIM_META key ──────────────────────
// Defined here so Tailwind includes them in the build (no dynamic string building).
const DIM_TEXT: Record<string, string> = {
  technical:     'text-[#185FA5]',
  economic:      'text-[#1D9E75]',
  environmental: 'text-[#3B6D11]',
  social:        'text-[#BA7517]',
  geographical:  'text-[#534AB7]',
  governance:    'text-[#6B48C4]',
  risk:          'text-[#A32D2D]',
};
const DIM_BG: Record<string, string> = {
  technical:     'bg-[#E6F1FB]',
  economic:      'bg-[#E1F5EE]',
  environmental: 'bg-[#EAF3DE]',
  social:        'bg-[#FAEEDA]',
  geographical:  'bg-[#EEEDFE]',
  governance:    'bg-[#F3EFFE]',
  risk:          'bg-[#FCEBEB]',
};
const DIM_BORDER: Record<string, string> = {
  technical:     'border-[#185FA5]/25',
  economic:      'border-[#1D9E75]/25',
  environmental: 'border-[#3B6D11]/25',
  social:        'border-[#BA7517]/25',
  geographical:  'border-[#534AB7]/25',
  governance:    'border-[#6B48C4]/25',
  risk:          'border-[#A32D2D]/25',
};
const DIM_BAR: Record<string, string> = {
  technical:     'bg-[#185FA5]',
  economic:      'bg-[#1D9E75]',
  environmental: 'bg-[#3B6D11]',
  social:        'bg-[#BA7517]',
  geographical:  'bg-[#534AB7]',
  governance:    'bg-[#6B48C4]',
  risk:          'bg-[#A32D2D]',
};

// ── helpers ───────────────────────────────────────────────────────────────────
function mineTypeBadge(prodMty: number | undefined) {
  if (prodMty == null) return null;
  if (prodMty > 10) return { label: 'Large',  cls: 'bg-indigo-100 text-indigo-700' };
  if (prodMty >= 2) return { label: 'Medium', cls: 'bg-cyan-100 text-cyan-700' };
  return               { label: 'Small',  cls: 'bg-slate-100 text-slate-600' };
}

function modelAccuracyLabel(errPts: number) {
  if (errPts < 5)  return { text: 'Excellent fit (<5 pts)',  cls: 'bg-green-50 text-green-700 border-green-200' };
  if (errPts < 12) return { text: 'Good fit (5–12 pts)',     cls: 'bg-amber-50 text-amber-700 border-amber-200' };
  return             { text: 'Needs review (>12 pts)',       cls: 'bg-red-50 text-red-700 border-red-200' };
}

const STAT_COLORS = ['text-[#1F3864]', 'text-[#185FA5]', 'text-[#1D9E75]', 'text-[#BA7517]'];

// ── KeyStatStrip ──────────────────────────────────────────────────────────────
function KeyStatStrip({ mine }: { mine: any }) {
  const p     = mine.parameters ?? {};
  const prod  = p.annual_prod_mty         != null ? `${p.annual_prod_mty} MTY`           : '—';
  const res   = p.reserve_mt              != null ? `${p.reserve_mt} Mt`                 : '—';
  const sr    = p.stripping_ratio_overall != null ? `${p.stripping_ratio_overall}:1 SR`  : '—';
  const gcv   = p.gcv_blended             != null ? `${p.gcv_blended} kcal/kg`           : '—';
  const badge = mineTypeBadge(p.annual_prod_mty);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
      {badge && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badge.cls}`}>
          {badge.label}
        </span>
      )}
      <span className="text-xs text-slate-500">
        <span className="font-medium text-slate-700">{prod}</span> production
      </span>
      <span className="text-xs text-slate-500">
        <span className="font-medium text-slate-700">{res}</span> reserve
      </span>
      <span className="text-xs text-slate-500">
        <span className="font-medium text-slate-700">{sr}</span>
      </span>
      <span className="text-xs text-slate-500">
        <span className="font-medium text-slate-700">{gcv}</span> Gross Calorific Value (GCV)
      </span>
      <span className="text-xs text-slate-400">{mine.location_state ?? '—'}</span>
    </div>
  );
}

// ── DimScoreGrid — zero inline styles, all static Tailwind class lookups ──────
function DimScoreGrid({ scores }: { scores: Record<string, number> }) {
  const entries = Object.entries(scores);
  const best    = entries.reduce((a, b) => (b[1] > a[1] ? b : a), entries[0]);
  const nonRisk = entries.filter(([k]) => k !== 'risk');
  const worst   = nonRisk.length
    ? nonRisk.reduce((a, b) => (b[1] < a[1] ? b : a), nonRisk[0])
    : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {entries.map(([k, v]) => {
          const meta = DIM_META[k];
          if (!meta) return null;
          return (
            <div key={k} className={`rounded-xl p-3 text-center ${DIM_BG[k] ?? 'bg-slate-50'}`}>
              <div className={`text-lg font-black ${DIM_TEXT[k] ?? 'text-slate-700'}`}>{v}</div>
              <div className={`text-[10px] font-semibold mt-0.5 leading-tight ${DIM_TEXT[k] ?? 'text-slate-700'}`}>
                {meta.label}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">{meta.weight}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {best && DIM_META[best[0]] && (
          <div className={`rounded-lg p-2.5 border ${DIM_BG[best[0]] ?? 'bg-slate-50'} ${DIM_BORDER[best[0]] ?? 'border-slate-200'}`}>
            <div className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Top Strength</div>
            <div className={`text-xs font-bold ${DIM_TEXT[best[0]] ?? 'text-slate-700'}`}>
              {DIM_META[best[0]].label} — {best[1]}
            </div>
          </div>
        )}
        {worst && DIM_META[worst[0]] && (
          <div className={`rounded-lg p-2.5 border ${DIM_BG[worst[0]] ?? 'bg-slate-50'} ${DIM_BORDER[worst[0]] ?? 'border-slate-200'}`}>
            <div className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Main Risk Area</div>
            <div className={`text-xs font-bold ${DIM_TEXT[worst[0]] ?? 'text-slate-700'}`}>
              {DIM_META[worst[0]].label} — {worst[1]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ScoreBar — native <meter> for fill width; zero style props ───────────────
function ScoreBar({ dimKey, value }: { dimKey: string; value: number }) {
  const meta = DIM_META[dimKey];
  if (!meta) return null;
  return (
    <div className="flex items-center gap-2">
      <div className={`w-20 text-xs truncate font-medium ${DIM_TEXT[dimKey] ?? 'text-slate-700'}`}>
        {meta.label}
      </div>
      {/* <meter> renders a native progress bar — no style prop needed for width */}
      <meter
        className="flex-1 h-1.5 [&::-webkit-meter-bar]:rounded-full [&::-webkit-meter-bar]:bg-slate-100 [&::-webkit-meter-optimum-value]:rounded-full [&::-webkit-meter-optimum-value]:transition-all"
        min={0}
        max={100}
        low={40}
        high={70}
        optimum={85}
        value={Math.min(100, Math.max(0, value))}
      />
      <div className={`text-xs font-bold w-6 text-right ${DIM_TEXT[dimKey] ?? 'text-slate-700'}`}>{value}</div>
    </div>
  );
}

// ── GradeDisplay — uses static Tailwind classes derived from grade letter ─────
function GradeDisplay({ mci, grade }: { mci: number; grade: string }) {
  const gc = gradeClasses(grade);
  return (
    <div className="text-center">
      <div className={`text-xl font-black ${gc.num}`}>{mci}</div>
      <div className={`text-xs px-2 py-0.5 rounded-full font-semibold ${gc.badge}`}>
        Grade {grade}
      </div>
    </div>
  );
}

// ── ComparisonRow — one style prop on wrapper, children use [color:var(--c)] ──
function ComparisonRow({ dimKey, predicted, actual, diff }: {
  dimKey: string; predicted: number; actual: number; diff: number;
}) {
  const meta = DIM_META[dimKey];
  return (
    <div
      className="flex items-center gap-2 text-xs"
      style={{ '--dim-color': meta?.color ?? '#888' } as React.CSSProperties}
    >
      <span className="w-24 capitalize [color:var(--dim-color)]">
        {meta?.label ?? dimKey}
      </span>
      <span className={`font-semibold [color:var(--dim-color)]`}>{predicted}</span>
      <span className="text-slate-400">vs {actual}</span>
      <span className={`font-semibold ml-auto ${diffClass(diff)}`}>
        {diff > 0 ? '+' : ''}{diff}
      </span>
    </div>
  );
}

// ── MineCard ──────────────────────────────────────────────────────────────────
function MineCard({ mine, result, predicting, onPredict, expanded, onToggle }: {
  mine: any;
  result: any;
  predicting: boolean;
  onPredict: () => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const res       = result;
  const dimScores: Record<string, number> = res?.results?.dimension_scores ?? {};

  return (
    <div className="card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-0.5">
              <span className="font-bold text-sm text-[#1F3864]">{mine.mine_name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                mine.split === 'Train' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {mine.split}
              </span>
              {mine.split === 'Validate' && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                  actual scores known
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">{mine.subsidiary}</div>
            <div className="text-xs text-slate-400">{mine.data_year}</div>
            <KeyStatStrip mine={mine} />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {res && <GradeDisplay mci={res.results.mci} grade={res.results.grade} />}
            <button
              type="button"
              onClick={onPredict}
              disabled={predicting}
              className="btn-primary text-xs px-3 py-1.5"
            >
              {predicting ? 'Running…' : 'Predict'}
            </button>
            {res && (
              <button type="button" onClick={onToggle} className="btn-ghost text-xs px-2 py-1.5">
                {expanded ? '▲' : '▼'}
              </button>
            )}
          </div>
        </div>
      </div>

      {expanded && res && (
        <div className="border-t border-slate-100 p-4 space-y-4">
          {/* Subtopic scores row */}
          {res.results?.subtopic_scores && (() => {
            const SUBTOPICS = [
              { key: 'mine_life',       icon: '⏱', label: 'Mine Life',       color: '#185FA5' },
              { key: 'hemm_cost',       icon: '🚛', label: 'Heavy Earth-Moving Machinery (HEMM) & Cost',     color: '#185FA5' },
              { key: 'stripping_ratio', icon: '📐', label: 'Stripping Ratio', color: '#185FA5' },
              { key: 'coal_quality',    icon: '🔬', label: 'Coal Quality',    color: '#534AB7' },
              { key: 'bench_blast',     icon: '💥', label: 'Bench & Blast',   color: '#185FA5' },
              { key: 'dewatering',      icon: '💧', label: 'Dewatering',      color: '#3B6D11' },
              { key: 'infrastructure',  icon: '🏗', label: 'Infrastructure',  color: '#534AB7' },
            ];
            const ss = res.results.subtopic_scores;
            const best = SUBTOPICS.reduce((a, b) => (ss[b.key] ?? 0) > (ss[a.key] ?? 0) ? b : a);
            const worst = SUBTOPICS.reduce((a, b) => (ss[b.key] ?? 100) < (ss[a.key] ?? 100) ? b : a);
            return (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Subtopic Section Scores</div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-2">
                  {SUBTOPICS.map(({ key, icon, label, color }) => {
                    const val = ss[key] ?? 0;
                    const fill = val >= 70 ? '#16a34a' : val >= 50 ? '#d97706' : '#dc2626';
                    return (
                      <div key={key} className="rounded-lg p-2 text-center border border-slate-100 bg-slate-50">
                        <div className="text-base">{icon}</div>
                        <div className="text-sm font-black" style={{ color: fill }}>{val}</div>
                        <div className="text-[9px] text-slate-500 leading-tight">{label}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-lg bg-green-50 border border-green-100 px-2 py-1.5">
                    <div className="text-[9px] text-green-600 font-bold uppercase">Strongest Section</div>
                    <div className="text-xs font-bold text-green-700">{best.icon} {best.label} — {ss[best.key]}</div>
                  </div>
                  <div className="flex-1 rounded-lg bg-red-50 border border-red-100 px-2 py-1.5">
                    <div className="text-[9px] text-red-600 font-bold uppercase">Weakest Section</div>
                    <div className="text-xs font-bold text-red-700">{worst.icon} {worst.label} — {ss[worst.key]}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Dimension Scores</div>
              <DimScoreGrid scores={dimScores} />
              <div className="mt-3 space-y-1">
                {Object.entries(dimScores).map(([k, v]) => (
                  <ScoreBar key={k} dimKey={k} value={v} />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-blue-50 rounded-xl p-3 text-xs">
                <div className="font-bold text-blue-700 mb-1">
                  Valuation: {res.results.valuation_method?.method}
                </div>
                <div className="text-blue-800 leading-relaxed">
                  {res.results.valuation_method?.reason}
                </div>
              </div>

              {res.comparison?.has_actual && (() => {
                const errPts = Math.abs(res.results.mci - res.comparison.actual_mci);
                const acc    = modelAccuracyLabel(errPts);
                return (
                  <div className="bg-green-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold text-green-700">Actual vs Predicted</div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${acc.cls}`}>
                        {acc.text}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="text-center">
                        <div className="text-xs text-slate-500">Predicted</div>
                        <div className="font-bold text-blue-700">{res.results.mci}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500">Actual</div>
                        <div className="font-bold text-green-700">{res.comparison.actual_mci}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500">Error</div>
                        <div className={`font-bold text-xs ${
                          errPts < 5 ? 'text-green-700' : errPts < 12 ? 'text-amber-700' : 'text-red-700'
                        }`}>
                          {errPts.toFixed(1)} pts
                        </div>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      {Object.entries(res.comparison.errors as Record<string, any>)
                        .filter(([k]) => k !== 'mci')
                        .map(([k, v]: any) => (
                          <ComparisonRow
                            key={k}
                            dimKey={k}
                            predicted={v.predicted}
                            actual={v.actual}
                            diff={v.diff}
                          />
                        ))}
                    </div>
                    <div className="text-xs text-slate-400 mt-2 italic">
                      {res.comparison.actual_source}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DataPage() {
  const [mines,      setMines]      = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [predicting, setPredicting] = useState<string | null>(null);
  const [results,    setResults]    = useState<Record<string, any>>({});
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [err,        setErr]        = useState('');

  useEffect(() => {
    api.get('/api/mines')
      .then((d: any) => setMines(Array.isArray(d) ? d : (Array.isArray(d?.mines) ? d.mines : [])))
      .catch((e: any) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function predict(mine_id: string) {
    setPredicting(mine_id);
    try {
      const data = await api.get(`/api/predict/from-db/${mine_id}`);
      setResults(r => ({ ...r, [mine_id]: data }));
      setExpanded(mine_id);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setPredicting(null);
    }
  }

  function toggleExpanded(mine_id: string) {
    setExpanded(v => (v === mine_id ? null : mine_id));
  }

  const trainMines    = mines.filter(m => m.split === 'Train');
  const validateMines = mines.filter(m => m.split === 'Validate');

  const predictedMcis = Object.values(results)
    .map((r: any) => r?.results?.mci)
    .filter((v): v is number => typeof v === 'number');
  const avgMci = predictedMcis.length
    ? (predictedMcis.reduce((a, b) => a + b, 0) / predictedMcis.length).toFixed(1)
    : null;

  const summaryStats = [
    { label: 'Total Mines',          value: mines.length || 12 },
    { label: 'Training Mines',       value: trainMines.length || 9 },
    { label: 'Validation Mines',     value: validateMines.length || 3 },
    { label: 'Average Mine Competitive Index (MCI) (predicted)',  value: avgMci ?? '—' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F3864] mb-1">Mine Dataset</h1>
        <p className="text-slate-500 text-sm">
          12 real Indian OC coal mines. Click Predict on any mine to run MCIF evaluation.
          Validate mines show actual vs predicted comparison.
        </p>
      </div>

      {/* Summary stats banner — all static Tailwind classes, zero inline styles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryStats.map((c, i) => (
          <div key={c.label} className="card p-4 text-center">
            <div className={`text-2xl font-black ${STAT_COLORS[i]}`}>{c.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{err}</div>
      )}
      {loading && (
        <div className="card p-8 text-center text-slate-400">Loading mine data from backend…</div>
      )}

      {!loading && (
        <>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <h2 className="text-base font-bold text-[#1F3864]">
                Training Mines ({trainMines.length})
              </h2>
              <span className="text-xs text-slate-400">
                Used for weight derivation — no actual scores stored
              </span>
            </div>
            <div className="space-y-2">
              {trainMines.map(m => (
                <MineCard
                  key={m._id}
                  mine={m}
                  result={results[m.mine_id]}
                  predicting={predicting === m.mine_id}
                  onPredict={() => predict(m.mine_id)}
                  expanded={expanded === m.mine_id}
                  onToggle={() => toggleExpanded(m.mine_id)}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <h2 className="text-base font-bold text-[#1F3864]">
                Validation Mines ({validateMines.length})
              </h2>
              <span className="text-xs text-slate-400">
                Not used for training — actual scores available for comparison
              </span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-xs text-amber-800">
              These mines were held out from weight derivation. Predicting on them and comparing with
              actual scores tests whether MCIF generalises beyond its training data.
            </div>
            <div className="space-y-2">
              {validateMines.map(m => (
                <MineCard
                  key={m._id}
                  mine={m}
                  result={results[m.mine_id]}
                  predicting={predicting === m.mine_id}
                  onPredict={() => predict(m.mine_id)}
                  expanded={expanded === m.mine_id}
                  onToggle={() => toggleExpanded(m.mine_id)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
