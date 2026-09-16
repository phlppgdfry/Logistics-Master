import clsx from 'clsx'
import { Zone, ZoneType } from '../../types/warehouse'

interface Props {
  zones: Zone[]
  onZoneClick?: (zone: Zone) => void
  selectedZoneId?: string
}

const CELL = 80
const PAD = 16

const typeColors: Record<ZoneType, { fill: string; border: string; text: string }> = {
  receiving: { fill: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
  staging:   { fill: '#1e3a5f', border: '#60a5fa', text: '#bfdbfe' },
  storage:   { fill: '#1a2e1a', border: '#22c55e', text: '#86efac' },
  picking:   { fill: '#3b1f0a', border: '#f97316', text: '#fdba74' },
  packing:   { fill: '#2d1a47', border: '#a855f7', text: '#d8b4fe' },
  shipping:  { fill: '#0f2233', border: '#06b6d4', text: '#67e8f9' },
  returns:   { fill: '#2a1a0f', border: '#f59e0b', text: '#fcd34d' },
}

function utilColor(u: number): string {
  if (u >= 0.92) return '#ef4444'
  if (u >= 0.80) return '#f59e0b'
  return '#22c55e'
}

export function WarehouseMap({ zones, onZoneClick, selectedZoneId }: Props) {
  const maxX = Math.max(...zones.map(z => z.position.x + z.position.w))
  const maxY = Math.max(...zones.map(z => z.position.y + z.position.h))
  const W = maxX * CELL + PAD * 2
  const H = maxY * CELL + PAD * 2

  return (
    <div className="overflow-auto rounded-2xl bg-gray-900 border border-gray-800 p-4">
      <svg width={W} height={H} className="block mx-auto">
        {/* Grid lines */}
        {Array.from({ length: maxX + 1 }).map((_, i) => (
          <line key={`vg-${i}`} x1={PAD + i * CELL} y1={PAD} x2={PAD + i * CELL} y2={H - PAD}
            stroke="#1f2937" strokeWidth="1" />
        ))}
        {Array.from({ length: maxY + 1 }).map((_, i) => (
          <line key={`hg-${i}`} x1={PAD} y1={PAD + i * CELL} x2={W - PAD} y2={PAD + i * CELL}
            stroke="#1f2937" strokeWidth="1" />
        ))}

        {zones.map(zone => {
          const { x, y, w, h } = zone.position
          const px = PAD + x * CELL + 3
          const py = PAD + y * CELL + 3
          const pw = w * CELL - 6
          const ph = h * CELL - 6
          const colors = typeColors[zone.type]
          const isSelected = zone.id === selectedZoneId
          const util = zone.currentUtilization

          return (
            <g key={zone.id} onClick={() => onZoneClick?.(zone)}
              role={onZoneClick ? 'button' : undefined}
              tabIndex={onZoneClick ? 0 : undefined}
              aria-label={onZoneClick ? zone.name : undefined}
              aria-pressed={onZoneClick ? isSelected : undefined}
              onKeyDown={event => {
                if (onZoneClick && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault()
                  onZoneClick(zone)
                }
              }}
              className={onZoneClick ? 'cursor-pointer focus:outline focus:outline-2 focus:outline-white' : ''}>
              {/* Zone fill */}
              <rect x={px} y={py} width={pw} height={ph} rx="8"
                fill={colors.fill}
                stroke={isSelected ? '#fff' : colors.border}
                strokeWidth={isSelected ? 2.5 : 1.5}
                opacity="0.95"
              />

              {/* Utilisation bar at bottom */}
              <rect x={px + 6} y={py + ph - 10} width={pw - 12} height={4} rx="2" fill="#111827" />
              <rect x={px + 6} y={py + ph - 10} width={(pw - 12) * util} height={4} rx="2" fill={utilColor(util)} />

              {/* Zone name */}
              <text x={px + pw / 2} y={py + ph / 2 - 8}
                textAnchor="middle" dominantBaseline="middle"
                fill={colors.text} fontSize={w * CELL < 120 ? 9 : 11} fontWeight="600"
                fontFamily="Inter, sans-serif">
                {zone.name.length > 16 ? zone.name.slice(0, 14) + '…' : zone.name}
              </text>

              {/* Utilisation % */}
              <text x={px + pw / 2} y={py + ph / 2 + 8}
                textAnchor="middle" dominantBaseline="middle"
                fill={utilColor(util)} fontSize={10} fontWeight="700"
                fontFamily="JetBrains Mono, monospace">
                {Math.round(util * 100)}%
              </text>
            </g>
          )
        })}

        {/* Legend */}
        <g transform={`translate(${PAD}, ${H - PAD + 8})`}>
          {[
            { color: '#22c55e', label: '< 80% OK' },
            { color: '#f59e0b', label: '80–92% Warning' },
            { color: '#ef4444', label: '≥ 92% Critical' },
          ].map(({ color, label }, i) => (
            <g key={i} transform={`translate(${i * 130}, 0)`}>
              <rect width="10" height="10" rx="2" fill={color} y="-5" />
              <text x="14" fill="#6b7280" fontSize="10" fontFamily="Inter, sans-serif">{label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
