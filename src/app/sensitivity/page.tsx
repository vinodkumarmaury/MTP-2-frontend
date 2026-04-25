'use client';
import { useState, useEffect } from 'react';
import { endpoints } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Legend
} from 'recharts';

const DIM_COLORS: Record<string, string> = {
  Economic:     '#1D9E75',
  Technical:    '#185FA5',
  Environmental:'#3B6D11',
  Social:       '#BA7517',
  Geographical: '#534AB7',
  Governance:   '#6B48C4',
  Risk:         '#A32D2D',
};

type SensParam = {
  key: string; label: string; dim: string; unit: string;
  base_val: number; mci_low: number; mci_high: number; swing: number;
  delta_minus20: number; delta_plus20: number;
  curve: { pct_change: number; value: number; mci: number }[];
};

type SensResult = {
  base_mci: number; base_grade: string; n_params: number;
  mine_name: string;
  top_params: SensParam[];
  all_params: SensParam[];
  dim_sensitivity: Record<string, number>;
  subtopic_sensitivity: Record<string, number>;
  base_subtopic_scores: Record<string, number>;
};

type Mine = { mine_id: string; mine_name: string; subsidiary: string; split: string; location_state: string };

export default function SensitivityPage() {
  const [mines, setMines]       = useState<Mine[]>([]);
  const [selMine, setSelMine]   = useState('');
  const [result, setResult]     = useState<SensResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState('');
  const [selected, setSelected] = useState<SensParam | null>(null);
  const [filterDim, setFilterDim] = useState<string>('All');
  const [filterMode, setFilterMode] = useState<'dim' | 'subtopic'>('dim');

  useEffect(() => {
    endpoints.sensitivityMines().then((d: Mine[]) => {
      setMines(d);
      if (d.length) setSelMine(d[0].mine_id);
    }).catch(() => {});
  }, []);

  async function runSensitivity() {
    if (!selMine) return;
    setLoading(true); setErr(''); setResult(null); setSelected(null);
    try {
      const data = await endpoints.sensitivity({ mine_id: selMine });
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  const dims = result ? ['All', ...Object.keys(result.dim_sensitivity)] : ['All'];
  const subtopics = result ? ['All', ...Object.keys(result.subtopic_sensitivity ?? {}).sort()] : ['All'];
  const displayParams = result
    ? filterMode === 'dim'
      ? (filterDim === 'All' ? result.top_params : result.all_params.filter(p => p.dim === filterDim).slice(0, 15))
      : (filterDim === 'All' ? result.top_params : result.all_params.filter((p: any) => p.subtopic === filterDim).slice(0, 15))
    : [];

  // Tornado chart data
  const tornadoData = displayParams.map(p => ({
    name: p.label,
    dim: p.dim,
    '-20%': +p.delta_minus20.toFixed(2),
    '+20%': +p.delta_plus20.toFixed(2),
    swing: p.swing,
  }));

  const SUBTOPIC_META: Record<string, { icon: string; color: string }> = {
    'Mine Life':       { icon: '⏱', color: '#185FA5' },
    'HEMM & Cost':     { icon: '🚛', color: '#185FA5' },
    'Stripping Ratio': { icon: '📐', color: '#185FA5' },
    'Coal Quality':    { icon: '🔬', color: '#534AB7' },
    'Bench & Blast':   { icon: '💥', color: '#185FA5' },
    'Dewatering':      { icon: '💧', color: '#3B6D11' },
    'Infrastructure':  { icon: '🏗', color: '#534AB7' },
    'Economic':        { icon: '₹',  color: '#1D9E75' },
    'Social':          { icon: '👷', color: '#BA7517' },
    'Governance':      { icon: '📋', color: '#6B48C4' },
    'Risk':            { icon: '⚠',  color: '#A32D2D' },
    'Environmental':   { icon: '🌿', color: '#3B6D11' },
  };

  // Dim sensitivity bar chart
  const dimData = result
    ? Object.entries(result.dim_sensitivity)
        .sort((a, b) => b[1] - a[1])
        .map(([dim, val]) => ({ dim, sensitivity: +val.toFixed(2) }))
    : [];

  // Subtopic sensitivity data
  const subtopicData = result
    ? Object.entries(result.subtopic_sensitivity ?? {})
        .sort((a, b) => b[1] - a[1])
        .map(([st, val]) => ({ st, icon: SUBTOPIC_META[st]?.icon ?? '', sensitivity: +val.toFixed(2), color: SUBTOPIC_META[st]?.color ?? '#888' }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1F3864] rounded-2xl p-7 text-white">
        <div className="text-blue-300 text-xs font-semibold tracking-widest uppercase mb-2">
          Analytical Tool · CMEM v3.0
        </div>
        <h1 className="text-3xl font-bold mb-2">Sensitivity Analysis</h1>
        <p className="text-blue-100 text-sm leading-relaxed max-w-3xl">
          Perturb each parameter by ±10%, ±20%, ±30% and observe the change in MCI score.
          The <strong>Tornado Chart</strong> shows which parameters drive the model — largest swings at the top.
          Derived using the <em>one-at-a-time (OAT)</em> method; all other parameters held at base value.
        </p>
      </div>

      {/* Controls */}
      <div className="card p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Reference Mine</label>
          <select
            className="select-f"
            value={selMine}
            onChange={e => setSelMine(e.target.value)}
            title="Select mine"
          >
            {mines.map(m => (
              <option key={m.mine_id} value={m.mine_id}>
                {m.mine_name} ({m.split}) · {m.location_state.split(',').pop()?.trim()}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={runSensitivity}
          disabled={loading || !selMine}
          className="btn-primary px-6 py-2 disabled:opacity-60"
        >
          {loading ? 'Computing…' : 'Run Sensitivity Analysis'}
        </button>
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{err}</div>
      )}

      {result && (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Mine', val: result.mine_name },
              { label: 'Base MCI', val: result.base_mci.toFixed(1) },
              { label: 'Grade', val: `Grade ${result.base_grade}` },
              { label: 'Parameters Tested', val: result.n_params },
            ].map(s => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 mb-0.5">{s.label}</div>
                <div className="text-xl font-black text-[#1F3864]">{s.val}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* ── Tornado Chart ── */}
            <div className="lg:col-span-2 card p-5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h2 className="font-bold text-[#1F3864] text-base">Tornado Chart — Parameter Sensitivity</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Each bar shows ΔMCI when parameter is changed ±20%. Sorted by swing (absolute impact).
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-semibold w-16">By Dim:</span>
                    <div className="flex flex-wrap gap-1">
                      {dims.map(d => (
                        <button key={d} type="button"
                          onClick={() => { setFilterDim(d); setFilterMode('dim'); }}
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg transition-all ${
                            filterMode === 'dim' && filterDim === d ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          style={filterMode === 'dim' && filterDim === d ? { background: d !== 'All' ? (DIM_COLORS[d] ?? '#1F3864') : '#1F3864' } : {}}
                        >{d}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-semibold w-16">By Section:</span>
                    <div className="flex flex-wrap gap-1">
                      {subtopics.map(st => {
                        const meta = SUBTOPIC_META[st];
                        return (
                          <button key={st} type="button"
                            onClick={() => { setFilterDim(st); setFilterMode('subtopic'); }}
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg transition-all ${
                              filterMode === 'subtopic' && filterDim === st ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                            style={filterMode === 'subtopic' && filterDim === st ? { background: meta?.color ?? '#1F3864' } : {}}
                          >{meta ? `${meta.icon} ${st}` : st}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={Math.max(300, displayParams.length * 28)}>
                <BarChart
                  data={tornadoData}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 140, bottom: 0 }}
                  onClick={({ activePayload }) => {
                    if (activePayload?.[0]) {
                      const name = activePayload[0].payload.name;
                      const p = result.all_params.find(x => x.label === name);
                      if (p) setSelected(p);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} label={{ value: 'ΔMCI (pts)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis
                    type="category" dataKey="name"
                    width={140}
                    tick={({ x, y, payload }: any) => {
                      const p = result.all_params.find(a => a.label === payload.value);
                      const col = p ? DIM_COLORS[p.dim] : '#475569';
                      return (
                        <text x={x} y={y} dy={4} textAnchor="end" fill={col} fontSize={10} fontWeight={600}>
                          {payload.value}
                        </text>
                      );
                    }}
                  />
                  <Tooltip
                    formatter={(val: number, name: string) => [`${val > 0 ? '+' : ''}${val.toFixed(2)} pts`, name]}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                  <ReferenceLine x={0} stroke="#1F3864" strokeWidth={1.5} />
                  <Bar dataKey="-20%" fill="#EF4444" radius={[2, 0, 0, 2]} barSize={10} />
                  <Bar dataKey="+20%" fill="#22C55E" radius={[0, 2, 2, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-2 flex gap-4 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-3 h-2 bg-red-400 rounded inline-block" /> −20% change</span>
                <span className="flex items-center gap-1"><span className="w-3 h-2 bg-green-500 rounded inline-block" /> +20% change</span>
                <span>Click any bar to see response curve →</span>
              </div>
            </div>

            {/* ── Right panel ── */}
            <div className="space-y-4">
              {/* Subtopic sensitivity (top card) */}
              <div className="card p-4">
                <h3 className="font-bold text-[#1F3864] text-sm mb-1">⚙ Subtopic-level Sensitivity</h3>
                <p className="text-[10px] text-slate-400 mb-3">
                  Total parameter swing grouped by engineering section — which subtopic drives MCI the most?
                </p>
                <div className="space-y-1.5">
                  {subtopicData.map(({ st, icon, sensitivity, color }) => {
                    const maxSens = subtopicData[0]?.sensitivity ?? 1;
                    const barW = (sensitivity / maxSens) * 100;
                    const baseScore = result?.base_subtopic_scores?.[
                      st === 'Mine Life' ? 'mine_life' : st === 'HEMM & Cost' ? 'hemm_cost' :
                      st === 'Stripping Ratio' ? 'stripping_ratio' : st === 'Coal Quality' ? 'coal_quality' :
                      st === 'Bench & Blast' ? 'bench_blast' : st === 'Dewatering' ? 'dewatering' :
                      st === 'Infrastructure' ? 'infrastructure' : ''
                    ];
                    return (
                      <div key={st}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-semibold text-slate-600">{icon} {st}</span>
                          <div className="flex items-center gap-2">
                            {baseScore != null && <span className="text-[9px] text-slate-400">score {baseScore}</span>}
                            <span className="text-[10px] font-black tabular-nums" style={{ color }}>{sensitivity.toFixed(2)} pts</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${barW}%`, background: color, opacity: 0.8 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dimension sensitivity */}
              <div className="card p-4">
                <h3 className="font-bold text-[#1F3864] text-sm mb-3">Dimension-level Sensitivity</h3>
                <p className="text-[10px] text-slate-400 mb-3">
                  Sum of parameter swings within each dimension
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dimData} margin={{ top: 0, right: 8, left: 8, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="dim" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }}
                      formatter={(v: number) => [`${v.toFixed(2)} pts total swing`, 'Sensitivity']} />
                    <Bar dataKey="sensitivity" radius={[4, 4, 0, 0]} fill="#1F3864"
                      label={{ position: 'top', fontSize: 9, formatter: (v: number) => v.toFixed(1) }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Response curve for selected parameter */}
              {selected && (
                <div className="card p-4">
                  <h3 className="font-bold text-sm mb-0.5" style={{ color: DIM_COLORS[selected.dim] }}>
                    {selected.label}
                  </h3>
                  <p className="text-[10px] text-slate-400 mb-3">
                    MCI response as parameter changes ±30%. Swing = {selected.swing.toFixed(2)} pts.
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={selected.curve} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="pct_change" tick={{ fontSize: 9 }}
                        tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v}%`} />
                      <YAxis tick={{ fontSize: 9 }} domain={['auto', 'auto']} />
                      <Tooltip
                        formatter={(v: number) => [v.toFixed(2), 'MCI']}
                        labelFormatter={(l: number) => `${l > 0 ? '+' : ''}${l}% change`}
                        contentStyle={{ fontSize: 11, borderRadius: 8 }}
                      />
                      <ReferenceLine y={result.base_mci} stroke="#94a3b8" strokeDasharray="4 4"
                        label={{ value: `Base ${result.base_mci}`, fontSize: 9, position: 'insideTopLeft' }} />
                      <Line type="monotone" dataKey="mci" stroke={DIM_COLORS[selected.dim]}
                        strokeWidth={2} dot={{ r: 4, fill: DIM_COLORS[selected.dim] }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Base: {selected.base_val.toFixed(3)} {selected.unit} ·
                    −20%→ {selected.mci_low.toFixed(1)} · +20%→ {selected.mci_high.toFixed(1)}
                  </p>
                </div>
              )}

              {!selected && (
                <div className="card p-4 border-dashed text-center text-slate-400">
                  <div className="text-2xl mb-1">📈</div>
                  <p className="text-xs">Click any bar to see the full ±30% response curve for that parameter</p>
                </div>
              )}
            </div>
          </div>

          {/* Parameter table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[#1F3864]">Full Sensitivity Table</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">All {result.n_params} parameters, sorted by absolute swing (±20% perturbation)</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-2 text-[10px] text-slate-500 font-semibold">Rank</th>
                    <th className="text-left px-4 py-2 text-[10px] text-slate-500 font-semibold">Parameter</th>
                    <th className="text-left px-4 py-2 text-[10px] text-slate-500 font-semibold">Dimension</th>
                    <th className="text-left px-4 py-2 text-[10px] text-slate-500 font-semibold">Section</th>
                    <th className="text-right px-4 py-2 text-[10px] text-slate-500 font-semibold">Base Value</th>
                    <th className="text-right px-4 py-2 text-[10px] text-slate-500 font-semibold">MCI at −20%</th>
                    <th className="text-right px-4 py-2 text-[10px] text-slate-500 font-semibold">Base MCI</th>
                    <th className="text-right px-4 py-2 text-[10px] text-slate-500 font-semibold">MCI at +20%</th>
                    <th className="text-right px-4 py-2 text-[10px] text-slate-500 font-semibold">Swing (pts)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.all_params.map((p, i) => (
                    <tr
                      key={p.key}
                      className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                        selected?.key === p.key ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelected(p)}
                    >
                      <td className="px-4 py-2 text-slate-400 font-mono">{i + 1}</td>
                      <td className="px-4 py-2 font-semibold text-slate-700">{p.label}</td>
                      <td className="px-4 py-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                          style={{ background: DIM_COLORS[p.dim] }}>
                          {p.dim}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-[10px] text-slate-500">
                          {SUBTOPIC_META[(p as any).subtopic]?.icon} {(p as any).subtopic ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-slate-600">
                        {p.base_val.toFixed(2)}{p.unit ? ` ${p.unit}` : ''}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-red-600">{p.mci_low.toFixed(1)}</td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-[#1F3864]">{result.base_mci.toFixed(1)}</td>
                      <td className="px-4 py-2 text-right font-mono text-green-600">{p.mci_high.toFixed(1)}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`font-black tabular-nums ${
                          p.swing >= 3 ? 'text-red-700' : p.swing >= 1.5 ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {p.swing.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Methodology note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 leading-relaxed">
            <strong>Methodology (OAT Sensitivity Analysis):</strong> One-at-a-time perturbation method — each parameter
            is varied individually by ±10%, ±20%, ±30% while all others are held constant at base value.
            &ldquo;Swing&rdquo; = |MCI(+20%) − MCI(−20%)| in index points. Parameters with swing &gt; 3 pts are
            <span className="text-red-700 font-semibold"> high-sensitivity</span> and represent critical control
            variables for operational improvement. Reference: Saltelli et al. (2008), <em>Global Sensitivity Analysis</em>.
          </div>
        </>
      )}

      {!result && !loading && (
        <div className="card p-16 text-center text-slate-400 border-dashed">
          <div className="text-5xl mb-3">🌪️</div>
          <p className="text-sm font-semibold">Select a reference mine and click &ldquo;Run Sensitivity Analysis&rdquo;</p>
          <p className="text-xs mt-1 max-w-md mx-auto">
            The tornado chart will show which of the 150+ parameters has the greatest impact on the Composite Mine Index (MCI) score.
          </p>
        </div>
      )}
    </div>
  );
}
