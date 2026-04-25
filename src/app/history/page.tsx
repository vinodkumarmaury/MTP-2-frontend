'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, gradeStyle } from '@/lib/api';
import { CORE_SECTIONS, SUBTOPIC_SECTIONS, type SectionDef } from '@/lib/fields';
import ResultPanel from '@/components/ResultPanel';

type Inp = Record<string, unknown>;

export default function HistoryPage() {
  const [history, setHistory]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<any>(null);
  const [editInputs, setEditInputs] = useState<Inp>({});
  const [saving, setSaving]         = useState(false);
  const [notes, setNotes]           = useState('');
  const [err, setErr]               = useState('');
  const [inputMode, setInputMode]   = useState<'core' | 'subtopic'>('core');
  const [activeSec, setActiveSec]   = useState(0);

  const sections: SectionDef[] = inputMode === 'core' ? CORE_SECTIONS : SUBTOPIC_SECTIONS;

  async function load() {
    setLoading(true);
    try { const d = await api.get('/api/history'); setHistory(d); }
    catch(e: any){ setErr(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function openRecord(id: string) {
    setErr('');
    try {
      const d = await api.get(`/api/history/${id}`);
      setSelected(d);
      setEditInputs({ ...d.inputs });
      setNotes(d.notes || '');
      setActiveSec(0);
    } catch(e: any){ setErr(e.message); }
  }

  async function saveOnly() {
    if (!selected) return;
    setSaving(true); setErr('');
    try {
      const data = await api.put(`/api/history/${selected._id}`, { inputs: editInputs, notes });
      if (data.error) throw new Error(data.error);
      // PUT returns a slim confirmation object; reload full record to show status
      await openRecord(selected._id);
      load();
    } catch(e: any){ setErr(e.message); }
    finally { setSaving(false); }
  }

  async function reEvaluate() {
    if (!selected) return;
    setSaving(true); setErr('');
    try {
      // Step 1: save current edits first
      await api.put(`/api/history/${selected._id}`, { inputs: editInputs, notes });
      // Step 2: re-run analytical formula on saved inputs
      const data = await api.post(`/api/history/${selected._id}/reevaluate`, {});
      if (data.error) throw new Error(data.error);
      // Reload full record to display updated scores and status='reevaluated'
      await openRecord(selected._id);
      load();
    } catch(e: any){ setErr(e.message); }
    finally { setSaving(false); }
  }

  async function deleteRecord(id: string) {
    if (!confirm('Delete this prediction record?')) return;
    try { await api.del(`/api/history/${id}`); setSelected(null); load(); }
    catch(e: any){ setErr(e.message); }
  }

  function upd(k: string, v: unknown) {
    setEditInputs(p => ({ ...p, [k]: v }));
  }

  const curSec = sections[activeSec] ?? sections[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]">Evaluation History</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            All saved predictions · Select a record to view full results and edit any parameter
          </p>
        </div>
        <button type="button" onClick={load} className="btn-ghost text-xs px-3 py-1.5">
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{err}</div>
      )}

      <div className="grid lg:grid-cols-5 gap-4 items-start">

        {/* ── Left: History list ── */}
        <div className="lg:col-span-2 space-y-1.5 lg:sticky lg:top-20 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
          {loading ? (
            <div className="card p-8 text-center text-slate-400 text-sm">Loading history…</div>
          ) : history.length === 0 ? (
            <div className="card p-10 text-center text-slate-400 border-dashed">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm font-medium">No predictions yet</p>
              <p className="text-xs mt-1">Go to Predict to create your first evaluation</p>
            </div>
          ) : (
            history.map(r => {
              const gs2 = gradeStyle(r?.results?.grade || 'D');
              const isSelected = selected?._id === r._id;
              return (
                <button type="button" key={r._id} onClick={() => openRecord(r._id)}
                  className={`w-full text-left card p-3 hover:border-blue-300 hover:shadow-sm transition-all ${
                    isSelected ? 'border-blue-400 bg-blue-50/50 shadow-sm' : ''
                  }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-800 truncate">{r.mine_name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {r.input_mode} · {new Date(r.createdAt).toLocaleString('en-IN', { dateStyle:'short', timeStyle:'short' })}
                      </div>
                      {r.session_label && (
                        <div className="text-[11px] text-slate-400 italic truncate">{r.session_label}</div>
                      )}
                      {r.comparison?.has_actual && (
                        <span className="inline-block mt-1 text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded font-medium">
                          ✓ Validation mine
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="font-black text-xl leading-none" style={{ color: gs2.tc }}>
                        {r.results?.mci?.toFixed(1) ?? '—'}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: gs2.bg, color: gs2.tc, border: `1.5px solid ${gs2.bc}` }}>
                        {r.results?.grade ? `Grade ${r.results.grade}` : '—'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* ── Right: Detail panel ── */}
        <div className="lg:col-span-3 space-y-4">
          {!selected ? (
            <div className="card p-16 text-center text-slate-400 border-dashed">
              <div className="text-4xl mb-3">⛏</div>
              <p className="text-sm font-medium">Select a prediction record</p>
              <p className="text-xs mt-1">Full results, charts, and parameter editor will appear here</p>
            </div>
          ) : (
            <>
              {/* Record header */}
              <div className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-[#1F3864] text-base truncate">{selected.mine_name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      {selected._id} · {new Date(selected.createdAt).toLocaleString()}
                    </div>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {selected.input_mode && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full capitalize">
                          {selected.input_mode} mode
                        </span>
                      )}
                      {selected.status && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                          selected.status === 'reevaluated' ? 'bg-purple-100 text-purple-700' :
                          selected.status === 'edited'      ? 'bg-amber-100 text-amber-700' :
                                                              'bg-blue-100 text-blue-700'
                        }`}>
                          {selected.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    <button type="button" onClick={saveOnly} disabled={saving}
                      className="text-xs px-4 py-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition disabled:opacity-60">
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" onClick={reEvaluate} disabled={saving}
                      className="btn-primary text-xs px-4 py-1.5 disabled:opacity-60">
                      {saving ? 'Running…' : 'Re-Evaluate'}
                    </button>
                    <Link href={`/report/${selected._id}`} target="_blank"
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                      PDF Report
                    </Link>
                    <button type="button" onClick={() => deleteRecord(selected._id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition">
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <label htmlFor="rec-notes" className="text-xs text-slate-500 block mb-1 font-medium">Notes</label>
                  <input id="rec-notes" className="input-f text-sm" placeholder="Add notes about this evaluation…"
                    value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
              </div>

              {/* Full ResultPanel */}
              {selected.results && (
                <ResultPanel results={selected.results} comparison={selected.comparison} inputs={selected.inputs ?? {}} />
              )}

              {/* ── Parameter Editor ── */}
              <div className="card overflow-hidden">
                {/* Mode switcher */}
                <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Edit Parameters &amp; Re-Evaluate
                  </div>
                  <div className="flex gap-2">
                    {(['core', 'subtopic'] as const).map(m => (
                      <button type="button" key={m} onClick={() => { setInputMode(m); setActiveSec(0); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          inputMode === m
                            ? 'bg-[#1F3864] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}>
                        {m === 'core' ? `Core (${CORE_SECTIONS.length} sections)` : `Sub-Topics (${SUBTOPIC_SECTIONS.length} sections)`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section tabs */}
                <div className="px-4 pt-3 pb-2 flex flex-wrap gap-1">
                  {sections.map((s, i) => (
                    <button type="button" key={s.id} onClick={() => setActiveSec(i)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={i === activeSec
                        ? { background: s.color, color: '#fff' }
                        : { background: '#f1f5f9', color: '#475569' }
                      }>
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>

                {/* Active section header */}
                <div className="px-4 py-2 flex items-center gap-2" style={{ background: curSec.color + '15', borderTop: `2px solid ${curSec.color}20` }}>
                  <span className="text-base">{curSec.icon}</span>
                  <span className="text-xs font-bold" style={{ color: curSec.color }}>{curSec.label}</span>
                  <span className="text-[10px] text-slate-400 ml-1">— {curSec.fields.length} parameters</span>
                </div>

                {/* Fields grid */}
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {curSec.fields.map(f => (
                    <div key={f.k}>
                      <label htmlFor={`hf-${f.k}`} className="block text-[11px] text-slate-500 mb-1 leading-tight">
                        {f.label}
                        {f.unit && <span className="text-slate-300 ml-1">({f.unit})</span>}
                      </label>
                      {f.type === 'select' ? (
                        <select id={`hf-${f.k}`} className="select-f text-sm"
                          title={f.label}
                          value={String(editInputs[f.k] ?? '')}
                          onChange={e => upd(f.k, e.target.value)}>
                          {(f.opts ?? []).map(o => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <input id={`hf-${f.k}`} type="number" className="input-f text-sm"
                          title={f.label}
                          placeholder={f.unit || f.label}
                          value={String(editInputs[f.k] ?? '')}
                          step="any"
                          onChange={e => upd(f.k, parseFloat(e.target.value) || 0)} />
                      )}
                      {f.help && (
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{f.help}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer action */}
                <div className="px-4 pb-4 flex items-center justify-between pt-2 border-t border-slate-100">
                  <p className="text-[11px] text-slate-400">
                    Section {activeSec + 1}/{sections.length} · {curSec.fields.length} fields shown
                  </p>
                  <button type="button" onClick={reEvaluate} disabled={saving}
                    className="btn-primary text-xs px-5 py-1.5 disabled:opacity-60">
                    {saving ? 'Running…' : 'Re-Evaluate Now'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
