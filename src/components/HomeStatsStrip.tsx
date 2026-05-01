'use client';
import { useEffect, useState } from 'react';
import { endpoints } from '@/lib/api';

export default function HomeStatsStrip() {
  const [health, setHealth] = useState<{ db: string; model_type?: string } | null>(null);
  const [stats, setStats] = useState<{
    total_predictions: number;
    viable_count: number;
    avg_mci: number | null;
    reference_mine_count: number;
  } | null>(null);

  useEffect(() => {
    endpoints.health().then(setHealth).catch(() => setHealth({ db: 'offline' }));
    endpoints.stats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div className={`rounded-xl border p-3 flex items-center gap-2 ${health?.db === 'connected' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className={`w-2 h-2 rounded-full ${health?.db === 'connected' ? 'bg-green-500' : 'bg-red-400'}`} />
        <div>
          <div className="text-[10px] text-slate-500">API Status</div>
          <div className={`text-xs font-bold ${health?.db === 'connected' ? 'text-green-700' : 'text-red-600'}`}>
            {health?.db ?? 'Checking…'}
          </div>
        </div>
      </div>
      {[
        { label: 'Total Predictions', val: stats?.total_predictions ?? '—' },
        { label: 'Viable (A+B)',      val: stats?.viable_count ?? '—' },
        { label: 'Avg MCI',           val: stats?.avg_mci != null ? `${stats.avg_mci}` : '—' },
        { label: 'Reference Mines',   val: stats?.reference_mine_count ?? '—' },
      ].map(s => (
        <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="text-[10px] text-slate-400">{s.label}</div>
          <div className="text-xl font-black text-[#1F3864]">{s.val}</div>
        </div>
      ))}
    </div>
  );
}
