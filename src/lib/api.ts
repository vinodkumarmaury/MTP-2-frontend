const API = process.env.NEXT_PUBLIC_API || 'http://localhost:8000';

export const api = {
  get:  (p: string) => fetch(`${API}${p}`).then(r => r.json()),
  post: (p: string, b: unknown) => fetch(`${API}${p}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(b) }).then(r => r.json()),
  put:  (p: string, b: unknown) => fetch(`${API}${p}`, { method:'PUT',  headers:{'Content-Type':'application/json'}, body:JSON.stringify(b) }).then(r => r.json()),
  del:  (p: string) => fetch(`${API}${p}`, { method:'DELETE' }).then(r => r.json()),
};

// ── Named API functions (all 10 endpoints) ─────────────────────────────────
export const endpoints = {
  health:              ()             => api.get('/api/health'),
  stats:               ()             => api.get('/api/stats'),
  predict:             (body: unknown) => api.post('/api/predict', body),
  predictFromDb:       (mine_id: string) => api.get(`/api/predict/from-db/${mine_id}`),
  mines:               ()             => api.get('/api/mines'),
  mine:                (id: string)   => api.get(`/api/mines/${id}`),
  compare:             ()             => api.get('/api/compare'),
  history:             (limit = 100)  => api.get(`/api/history?limit=${limit}`),
  historyRecord:       (id: string)   => api.get(`/api/history/${id}`),
  historySave:         (id: string, body: unknown) => api.put(`/api/history/${id}`, body),
  historyReevaluate:   (id: string)   => api.post(`/api/history/${id}/reevaluate`, {}),
  historyDelete:       (id: string)   => api.del(`/api/history/${id}`),
  sensitivityMines:    ()             => api.get('/api/sensitivity/mines'),
  sensitivity:         (body: unknown) => api.post('/api/sensitivity', body),
};

// ── Dimension metadata ─────────────────────────────────────────────────────
export const DIM_META: Record<string, { label: string; color: string; bg: string; weight: string }> = {
  technical:     { label:'Technical',        color:'#185FA5', bg:'#E6F1FB', weight:'12.7%' },
  economic:      { label:'Economic',         color:'#1D9E75', bg:'#E1F5EE', weight:'17.0%' },
  environmental: { label:'Environmental',    color:'#3B6D11', bg:'#EAF3DE', weight:'10.1%' },
  social:        { label:'Social',           color:'#BA7517', bg:'#FAEEDA', weight:'13.9%' },
  geographical:  { label:'Geographical',     color:'#534AB7', bg:'#EEEDFE', weight:'13.0%' },
  governance:    { label:'Governance',       color:'#6B48C4', bg:'#F3EFFE', weight:'6.6%'  },
  risk:          { label:'Risk (Safety)',     color:'#A32D2D', bg:'#FCEBEB', weight:'+26.7%' },
};

/** Returns {bg, tc, bc} colour tokens — used by ResultPanel SVG gauge */
export function gradeStyle(g: string) {
  if (g === 'A') return { bg:'#E1F5EE', tc:'#085041', bc:'#1D9E75' };
  if (g === 'B') return { bg:'#E6F1FB', tc:'#0C447C', bc:'#378ADD' };
  if (g === 'C') return { bg:'#FAEEDA', tc:'#633806', bc:'#EF9F27' };
  return { bg:'#FCEBEB', tc:'#501313', bc:'#E24B4A' };
}

/** Returns Tailwind class string — used in tables and badges */
export function gradeClass(grade: string): string {
  if (grade === 'A') return 'bg-green-100 text-green-800';
  if (grade === 'B') return 'bg-blue-100 text-blue-800';
  if (grade === 'C') return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

export function errColor(pct: number) {
  if (pct < 5)  return 'text-green-700 bg-green-50';
  if (pct < 12) return 'text-amber-700 bg-amber-50';
  return 'text-red-700 bg-red-50';
}
