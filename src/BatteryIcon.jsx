function BatteryIcon({ value, color, size = 40 }) {
  const w = size
  const h = size * 0.55
  const capW = size * 0.06
  const border = 2
  const fillW = ((w - border * 2 - 2) * value) / 100

  return (
    <svg width={w + capW} height={h} viewBox={`0 0 ${w + capW} ${h}`} style={{ flexShrink: 0 }}>
      <rect x={0} y={0} width={w} height={h} rx={4} ry={4} fill="none" stroke="#64748b" strokeWidth={border} />
      <rect x={w} y={h * 0.25} width={capW} height={h * 0.5} rx={1.5} fill="#64748b" />
      <rect x={border + 1} y={border + 1} width={fillW} height={h - border * 2 - 2} rx={2} fill={color} />
    </svg>
  )
}

export default BatteryIcon
