import React, { useState } from 'react';

/**
 * PieChart — Pure SVG pie chart, no external library needed.
 * Props:
 *   data: [{ label, value, color }]
 *   size: number (default 200)
 */
export default function PieChart({ data = [], size = 200 }) {
  const [hovered, setHovered] = useState(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (!total || data.length === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 10;
  const innerRadius = radius * 0.55; // donut hole

  // Build slices
  let cumAngle = -Math.PI / 2; // start from top
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI;
    // SVG A command fails if start and end points are identical (100% circle)
    // Reduce slightly to ensure it renders a full circle.
    const safeAngle = angle >= 2 * Math.PI ? 1.9999 * Math.PI : angle;
    const startAngle = cumAngle;
    const endAngle = cumAngle + safeAngle;
    cumAngle = cumAngle + angle; // next slice starts exactly where it should

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const ix1 = cx + innerRadius * Math.cos(startAngle);
    const iy1 = cy + innerRadius * Math.sin(startAngle);
    const ix2 = cx + innerRadius * Math.cos(endAngle);
    const iy2 = cy + innerRadius * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;
    const pct = ((d.value / total) * 100).toFixed(1);

    // Mid angle for label positioning
    const midAngle = startAngle + angle / 2;
    const labelR = (radius + innerRadius) / 2;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');

    return { ...d, path, pct, lx, ly, angle, i };
  });

  const fmt = (v) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
      >
        {slices.map((s) => {
          const isHovered = hovered === s.i;
          const scale = isHovered ? 1.05 : 1;
          return (
            <g
              key={s.i}
              style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
              transform={`translate(${cx},${cy}) scale(${scale}) translate(${-cx},${-cy})`}
              onMouseEnter={() => setHovered(s.i)}
              onMouseLeave={() => setHovered(null)}
            >
              <path
                d={s.path}
                fill={s.color}
                stroke="var(--c-bg)"
                strokeWidth={2}
                opacity={hovered !== null && !isHovered ? 0.65 : 1}
              />
              {/* Show % label only if slice is big enough */}
              {s.angle > 0.3 && (
                <text
                  x={s.lx}
                  y={s.ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize={size < 180 ? 9 : 11}
                  fontWeight={700}
                >
                  {s.pct}%
                </text>
              )}
            </g>
          );
        })}
        {/* Center text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--c-text)" fontSize={11} fontWeight={600}>
          {hovered !== null ? slices[hovered]?.label : 'Tổng chi'}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--c-accent)" fontSize={10} fontWeight={700}>
          {hovered !== null
            ? `${slices[hovered]?.pct}%`
            : fmt(total)}
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%' }}>
        {slices.map((s) => (
          <div
            key={s.i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 8px',
              borderRadius: 8,
              background: hovered === s.i ? 'var(--c-surface2)' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={() => setHovered(s.i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--c-text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.label}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--c-text-2)', fontWeight: 600, flexShrink: 0 }}>
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
