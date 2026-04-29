'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { endpoints } from '@/lib/api';

const GRADE_SCALE = [
  { r:'80–100', g:'Grade A', l:'Excellent',  sub:'Investment grade — proceed', bg:'bg-green-50', tc:'text-green-800', bc:'border-green-300' },
  { r:'65–79',  g:'Grade B', l:'Good',        sub:'Viable — address weak dims', bg:'bg-blue-50',  tc:'text-blue-800',  bc:'border-blue-300'  },
  { r:'50–64',  g:'Grade C', l:'Marginal',    sub:'High-risk — staged invest.', bg:'bg-amber-50', tc:'text-amber-800', bc:'border-amber-300' },
  { r:'< 50',   g:'Grade D', l:'High Risk',   sub:'Non-investment grade',       bg:'bg-red-50',   tc:'text-red-800',   bc:'border-red-300'   },
];

const FEATURES = [
  { href:'/predict',     icon:'⛏',  label:'Predict',         desc:'8-section form: Economic, Technical, Geological, Environmental, Social, Geographical, Risk + Governance. SVG gauge, radar chart, dimension breakdowns.' },
  { href:'/compare',     icon:'📊', label:'Compare',         desc:'Scatter plot + residual table: Formula Mine competive index (MCI) predicted vs actual expert scores for 4 validate mines. Mean Absolute Error (MAE) & R² shown.' },
  { href:'/sensitivity', icon:'🌪️', label:'Sensitivity',     desc:'Tornado chart: perturb each parameter ±10/20/30% to find which inputs drive Mine competive index (MCI) most. Dimension-level sensitivity aggregation. One-At-a-Time (OAT) method.' },
  { href:'/history',     icon:'📋', label:'History',         desc:'Every prediction saved. Edit parameters (Save), then Re-Evaluate separately to recompute scores. Export PDF report for any record.' },
  { href:'/parameters',  icon:'📖', label:'Parameters',      desc:'All 150+ parameters documented: definition, relevance to Mine Competitive Index Framework
 (CMEM), formula, and source reference mine.' },
  { href:'/workflow',    icon:'🔄', label:'Workflow',        desc:'Step-by-step explanation: how 150+ inputs flow through 7 dimension scoring functions → ensemble weights → Mine competive index (MCI) → Grade.' },
  { href:'/data',        icon:'🗄', label:'Mine Data',       desc:'12 real Indian Opencast (OC) coal mines (8 train, 4 validate incl. 2 Australian). Click any mine to test-predict; validate mines show actual vs predicted error.' },
];

const DIMS = [
  { label:'Economic',       weight:'17.0%', color:'text-emerald-700', desc:'Net Present Value (NPV), Internal Rate of Return (IRR), Operating Expenditure (OPEX), Debt-to-Equity (D/E) ratio, price volatility' },
  { label:'Technical',      weight:'12.7%', color:'text-blue-700',    desc:'Heavy Earth-Moving Machinery (HEMM), stripping ratio, recovery, fuel efficiency' },
  { label:'Social',         weight:'13.9%', color:'text-amber-700',   desc:'Lost Time Injury Frequency Rate (LTIFR), Fatal Accident Rate (FAR), local employment, women workforce' },
  { label:'Geographical',   weight:'13.0%', color:'text-violet-700',  desc:'Rail distance, logistics cost, power availability' },
  { label:'Governance',     weight:'6.6%',  color:'text-purple-700',  desc:'ISO certifications, Directorate General of Mines Safety (DGMS) compliance, Environmental, Social, and Governance (ESG) score — NEW' },
  { label:'Environmental',  weight:'10.1%', color:'text-green-700',   desc:'Environmental Clearance (EC) / Forest Clearance (FC) status, Greenhouse Gas (GHG) intensity, Particulate Matter 10 micrometers (PM10), land reclamation' },
  { label:'Risk (Safety)',  weight:'+26.7%', color:'text-red-700',     desc:'Safety quality score: slope Factor of Safety (FoS), near-miss incidents, Directorate General of Mines Safety (DGMS) compliance (positive contribution)' },
];

export default function Home() {
  const [health, setHealth] = useState<{db:string; model_type?:string} | null>(null);
  const [stats,  setStats]  = useState<{total_predictions:number; viable_count:number; avg_mci:number|null; reference_mine_count:number} | null>(null);

  useEffect(() => {
    endpoints.health().then(setHealth).catch(() => setHealth({ db:'offline' }));
    endpoints.stats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-[#1F3864] rounded-2xl p-8 md:p-10 text-white">
        <div className="text-blue-300 text-xs font-semibold tracking-widest uppercase mb-3">
          M.Tech Thesis · IIT Kharagpur · Mining Engineering · 2026
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Mine Competitive Index Framework</h1>
        <p className="text-blue-100 text-base leading-relaxed max-w-3xl mb-2">
          A data-driven system that evaluates Open-Cast (OC) coal mines across <strong>7 dimensions</strong> using over <strong>150 parameters</strong>.
          The application uses a machine-learning ensemble to predict a Mine competive index(MCI), providing objective, reproducible scores validated on real-world mines with an average error of about 2.5 points.
        </p>
        <p className="text-blue-300 text-sm mb-6">
          <strong>v3.0</strong> introduces <span className="text-white font-semibold">Governance</span> as the 7th dimension, covering ISO 14001 (Environmental Management) / ISO 45001 (Occupational Health & Safety) status, Directorate General of Mines Safety (DGMS) compliance, Environmental, Social, and Governance (ESG) disclosure indicators, and regulatory-violation tracking.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/predict"   className="bg-white text-[#1F3864] font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition text-sm">Predict a Mine →</Link>
          <Link href="/data"      className="border border-blue-300 text-white px-5 py-2.5 rounded-xl hover:bg-white/10 transition text-sm">View Mine Data</Link>
          <Link href="/workflow"  className="border border-blue-300 text-white px-5 py-2.5 rounded-xl hover:bg-white/10 transition text-sm">How it works</Link>
        </div>
      </div>

      {/* API Health + Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className={`rounded-xl border p-3 flex items-center gap-2 ${health?.db === 'connected' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`w-2 h-2 rounded-full ${health?.db === 'connected' ? 'bg-green-500' : 'bg-red-400'}`} />
          <div>
            <div className="text-[10px] text-slate-500">API Status</div>
            <div className={`text-xs font-bold ${health?.db === 'connected' ? 'text-green-700' : 'text-red-600'}`}>{health?.db ?? 'Checking…'}</div>
          </div>
        </div>
        {[
          { label:'Total Predictions', val: stats?.total_predictions ?? '—' },
          { label:'Viable (A+B)',       val: stats?.viable_count ?? '—' },
          { label:'Avg MCI',            val: stats?.avg_mci != null ? `${stats.avg_mci}` : '—' },
          { label:'Reference Mines',    val: stats?.reference_mine_count ?? '—' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-3">
            <div className="text-[10px] text-slate-400">{s.label}</div>
            <div className="text-xl font-black text-[#1F3864]">{s.val}</div>
          </div>
        ))}
      </div>

      {/* 7 Dimensions strip */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">7 Evaluation Dimensions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {DIMS.map(d => (
            <div key={d.label} className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-sm transition">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${d.color}`}>{d.label}</span>
                <span className={`text-[10px] font-bold tabular-nums ${d.color}`}>{d.weight}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(c => (
          <Link key={c.href} href={c.href} className="card p-5 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="font-bold text-[#1F3864] mb-1 group-hover:text-[#2E75B6]">{c.label} →</div>
            <div className="text-xs text-slate-500 leading-relaxed">{c.desc}</div>
          </Link>
        ))}
      </div>

      {/* Grade scale */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">MCI Grade Scale</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {GRADE_SCALE.map(g => (
            <div key={g.g} className={`rounded-xl border-2 p-3 ${g.bg} ${g.bc}`}>
              <div className={`font-bold text-xs mb-0.5 ${g.tc}`}>{g.g}</div>
              <div className={`text-xl font-black mb-0.5 ${g.tc}`}>{g.r}</div>
              <div className={`text-xs font-semibold ${g.tc}`}>{g.l}</div>
              <div className={`text-[9px] mt-0.5 opacity-70 ${g.tc}`}>{g.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
