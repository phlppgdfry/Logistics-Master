import { Fragment, useState } from 'react';
import { Info, ChevronRight } from 'lucide-react';
import { shipments } from '../data/shipments';
import {
  getRiskBadge, getRiskColor, formatDelay,
  getCategoryIcon, getCategoryColor, getScoreBarColor
} from '../utils/predictor';

const FILTERS = ['alle', 'critical', 'high', 'medium', 'low'];
const FILTER_LABELS: Record<string, string> = {
  alle: 'Alle', critical: 'Kritiek', high: 'Hoog', medium: 'Gemiddeld', low: 'Laag',
};

export function ShipmentTable() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter]     = useState('alle');

  const filtered = filter === 'alle' ? shipments : shipments.filter(s => s.riskLevel === filter);
  const sorted   = [...filtered].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-white/5 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Live Shipment Risico Monitor</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-risicoscore per actieve zending · klik op het zendingnummer voor de volledige vertraging-analyse
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
                ${filter === f
                  ? 'text-white border'
                  : 'text-slate-400 border border-white/6 hover:border-white/12 hover:text-slate-300'}`}
              style={filter === f ? {
                background: 'rgba(141,29,69,0.18)',
                borderColor: 'rgba(141,29,69,0.45)',
                color: '#F8CE3E',
              } : {}}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="border-b border-white/5">
              {['Zending ID', 'Route', 'Klant', 'Status', 'Risicoscore', 'Kans vertr.', 'Verwachte vertr.', 'ETA', 'Niveau'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(s => (
              <Fragment key={s.id}>
                {/* ── Main row ── */}
                <tr
                  key={s.id}
                  className="border-b border-white/[0.03] hover:bg-white/[0.025] transition-colors group"
                >
                  <td className="px-5 py-3">
                    <button type="button" className="flex items-center gap-2 text-left"
                      aria-expanded={expanded === s.id}
                      aria-label={`Details ${s.id}`}
                      onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                      <ChevronRight
                        size={13}
                        className={`text-slate-600 transition-transform ${expanded === s.id ? 'rotate-90' : ''}`}
                      />
                      <span>
                        <span className="font-mono text-xs text-[#F8CE3E]">{s.id}</span>
                        <span className="block text-[11px] text-slate-500">{s.containerType}</span>
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-300 whitespace-nowrap">{s.route}</td>
                  <td className="px-5 py-3 text-xs text-slate-300 whitespace-nowrap">{s.client}</td>
                  <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap max-w-[180px] truncate">{s.currentStatus}</td>

                  {/* Risk score with bar */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${s.riskScore}%`, background: getScoreBarColor(s.riskScore) }}
                        />
                      </div>
                      <span className={`text-sm font-bold tabular-nums ${getRiskColor(s.riskLevel)}`}>
                        {s.riskScore}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3">
                    <span className={`text-sm font-semibold tabular-nums ${getRiskColor(s.riskLevel)}`}>
                      {s.delayProbability}%
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold ${s.predictedDelay > 0 ? getRiskColor(s.riskLevel) : 'text-green-400'}`}>
                      {formatDelay(s.predictedDelay)}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-400">
                    {s.eta.split(' ')[1]}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getRiskBadge(s.riskLevel)}`}>
                      {s.riskLevel}
                    </span>
                  </td>
                </tr>

                {/* ── Expanded detail ── */}
                {expanded === s.id && (
                  <tr key={`${s.id}-exp`}>
                    <td colSpan={9} className="bg-white/[0.018] border-b border-white/5">
                      <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-5">

                        {/* DNA Breakdown */}
                        <div>
                          <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
                            <Info size={12} className="text-[#F8CE3E]" />
                            Vertraging DNA — oorzaak analyse
                          </p>
                          <div className="space-y-2.5">
                            {s.delayFactors.map((f, i) => (
                              <div key={i}>
                                <div className="flex justify-between text-xs mb-0.5">
                                  <span className={`flex items-center gap-1 ${getCategoryColor(f.category)}`}>
                                    <span>{getCategoryIcon(f.category)}</span> {f.name}
                                  </span>
                                  <span className="text-slate-400 font-medium">{f.impact}%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${f.impact}%`, background: getScoreBarColor(f.impact * 1.4) }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Details */}
                        <div>
                          <p className="text-xs font-semibold text-slate-400 mb-3">Zendingsdetails</p>
                          <dl className="space-y-2">
                            {[
                              ['Vervoerder',   s.carrier],
                              ['Container',    s.containerType],
                              ['Gewicht',      `${s.weight.toLocaleString('nl-BE')} kg`],
                              ['Douane',       s.customsRequired ? '⚠️ Vereist' : '✅ Niet vereist'],
                              ['Ferryslot',    s.ferrySlot],
                              ['Herkomst',     s.origin],
                              ['Bestemming',   s.destination],
                            ].map(([k, v]) => (
                              <div key={k as string} className="flex justify-between text-xs">
                                <dt className="text-slate-500">{k}</dt>
                                <dd className="text-slate-300">{v}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>

                        {/* AI Recommendation */}
                        <div>
                          <p className="text-xs font-semibold text-slate-400 mb-3">AI Aanbeveling</p>
                          <div className={`p-3.5 rounded-xl text-xs leading-relaxed
                            ${s.riskLevel === 'critical'
                              ? 'bg-[#8D1D45]/10 border border-[#8D1D45]/30 text-red-300'
                              : s.riskLevel === 'high'
                              ? 'bg-orange-500/8 border border-orange-500/25 text-orange-300'
                              : 'bg-[#F8CE3E]/8 border border-[#F8CE3E]/25 text-yellow-200'}`}>
                            {s.riskLevel === 'critical' &&
                              '⚡ Directe actie: neem contact op met vervoerder en informeer de klant. Overweeg omleiding via alternatief ferryslot. Controleer douanedossier onmiddellijk.'}
                            {s.riskLevel === 'high' &&
                              '⚠️ Proactief handelen: klant informeren over mogelijke vertraging. Verifieer douanedocumenten nu om bottleneck te voorkomen.'}
                            {s.riskLevel === 'medium' &&
                              '📋 Opvolgen: plan check-in met vervoerder. Bereid contingency voor als weersomstandigheden verslechteren.'}
                            {s.riskLevel === 'low' &&
                              '✅ Op schema: geen actie vereist. Standaardmonitoring van toepassing.'}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
