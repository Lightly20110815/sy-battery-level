function BatteryBar({ value, color, height = 8 }) {
  return (
    <div className="bar-track" style={{ height }}>
      <div
        className="bar-fill"
        style={{
          width: `${value}%`,
          backgroundColor: color,
          height: '100%',
          boxShadow: `0 0 8px ${color}66`,
        }}
      />
    </div>
  )
}

export default BatteryBar
