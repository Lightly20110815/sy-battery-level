import { useState, useEffect } from 'react'
import config from './config.json'

const meta = {
  Energy: { icon: '⚡', grad: ['#f59e0b', '#ef4444'], ring: '#f59e0b' },
  Social: { icon: '💬', grad: ['#ec4899', '#8b5cf6'], ring: '#ec4899' },
  Research: { icon: '🔬', grad: ['#06b6d4', '#3b82f6'], ring: '#06b6d4' },
  Reasoning: { icon: '🧠', grad: ['#8b5cf6', '#6366f1'], ring: '#8b5cf6' },
  Suicidal: { icon: '🔪', grad: ['#dc2626', '#991b1b'], ring: '#dc2626' },
  SelfAware: { icon: '🪞', grad: ['#14b8a6', '#0d9488'], ring: '#14b8a6' },
}

function CircleGauge({ value, color, size = 140 }) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const [offset, setOffset] = useState(circ)
  useEffect(() => {
    setTimeout(() => setOffset(circ - (circ * value) / 100), 100)
  }, [value, circ])

  return (
    <svg width={size} height={size} className="circle-gauge">
      <defs>
        <linearGradient id={`cg-${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeOpacity="0.06" strokeWidth="8" />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={`url(#cg-${color.replace('#','')})`}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)', filter: `drop-shadow(0 0 8px ${color}44)` }}
      />
    </svg>
  )
}

function Bar({ value, grad, delay = 0, instant = false }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    if (instant) { setW(value); return }
    setTimeout(() => setW(value), 80 + delay)
  }, [value, delay, instant])

  return (
    <div className="prog-track">
      <div className="prog-fill" style={{
        width: `${w}%`,
        background: `linear-gradient(90deg, ${grad[0]}, ${grad[1]})`,
        boxShadow: `0 0 20px ${grad[0]}33`,
        transition: instant ? 'width 0.15s linear' : undefined,
      }} />
      <div className="prog-ticks">
        {[25,50,75].map(t => <div key={t} className="prog-tick" style={{ left: `${t}%` }} />)}
      </div>
    </div>
  )
}

function BattSvg({ value, grad }) {
  const fw = Math.max(0, (value / 100) * 18)
  return (
    <svg width={36} height={20} viewBox="0 0 30 16" fill="none" className="batt-svg">
      <rect x="1" y="1" width="24" height="14" rx="4" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1.5" />
      <rect x="25.5" y="4" width="3" height="8" rx="1.5" fill="currentColor" fillOpacity="0.1" />
      <defs>
        <linearGradient id={`bf-${grad[0].slice(1)}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={grad[0]} />
          <stop offset="100%" stopColor={grad[1]} />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width={fw} height="10" rx="2" fill={`url(#bf-${grad[0].slice(1)})`} opacity="0.85" />
    </svg>
  )
}

export default function App() {
  const { total, modules } = config
  const [time, setTime] = useState('')
  const [reveal, setReveal] = useState(false)
  const [hov, setHov] = useState(null)
  const [count, setCount] = useState(0)
  const [dark, setDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [bgLoaded, setBgLoaded] = useState(false)
  const [randVals, setRandVals] = useState({})

  // Random flicker for "?" modules
  useEffect(() => {
    const qKeys = modules.filter(m => m.value === '?').map(m => m.key)
    if (qKeys.length === 0) return
    const id = setInterval(() => {
      const next = {}
      qKeys.forEach(k => { next[k] = Math.floor(Math.random() * 101) })
      setRandVals(next)
    }, 200)
    return () => clearInterval(id)
  }, [modules])
  const bgUrl = 'https://api.bimg.cc/random?w=1920&h=1080&mkt=zh-CN'

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const img = new Image()
    img.onload = () => setBgLoaded(true)
    img.src = bgUrl
  }, [])

  useEffect(() => {
    setTimeout(() => setReveal(true), 50)
    const tick = () => setTime(new Date().toLocaleTimeString('zh-CN', { hour12: false }))
    tick(); const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!reveal) return
    let c = 0
    const step = () => {
      c += 2
      setCount(Math.min(c, total.value))
      if (c < total.value) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [reveal, total.value])

  const totalGrad = total.value >= 60 ? ['#4facfe', '#8b5cf6'] : total.value >= 35 ? ['#f59e0b', '#ef4444'] : ['#ef4444', '#dc2626']
  const warnings = modules.filter(m => m.value !== '?' && m.value < 40)

  // Helper: get display value for a module
  const getVal = (m) => m.value === '?' ? (randVals[m.key] ?? 50) : m.value
  const isRandom = (m) => m.value === '?'

  return (
    <div className={`app ${reveal ? 'ready' : ''}`}>
      {/* 随机必应壁纸背景 */}
      <div className={`bg-img ${bgLoaded ? 'bg-loaded' : ''}`} style={{ backgroundImage: `url(${bgUrl})` }} />
      <div className="bg-overlay" />

      <div className="container">
        {/* 顶栏 */}
        <div className="topbar">
          <div className="topbar-l">
            <div className="pulse-ring"><div className="pulse-core" /></div>
            <span className="brand">Sy 的电量面板</span>
          </div>
          <div className="topbar-r mono">{time}</div>
        </div>

        {/* 总电量 */}
        <div className="hero-card">
          <div className="hero-left">
            <div className="hero-gauge">
              <CircleGauge value={total.value} color={totalGrad[0]} size={140} />
              <div className="hero-gauge-inner">
                <span className="hero-big mono">{count}%</span>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-title">总电量</div>
            <Bar value={total.value} grad={totalGrad} />
            <div className="hero-sub mono">{total.status}</div>
            <div className="hero-chips">
              {modules.map(m => {
                const mt = meta[m.key]
                const v = getVal(m)
                return (
                  <span key={m.key} className="chip" style={{ borderColor: mt.ring + '33', color: mt.ring }}>
                    {mt.icon} {isRandom(m) ? '??' : v}%
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {/* 警告 */}
        {warnings.length > 0 && (
          <div className="warn-strip">
            {warnings.map(w => (
              <span key={w.key} className="warn-tag mono">
                <span className="warn-blink" /> {w.name}状态不稳定
              </span>
            ))}
          </div>
        )}

        {/* 模块卡片 */}
        <div className="grid">
          {modules.map((m, i) => {
            const mt = meta[m.key]
            const v = getVal(m)
            const rand = isRandom(m)
            const low = !rand && v < 20
            return (
              <div
                className="card"
                key={m.key}
                style={{ '--accent': mt.ring, '--delay': `${i * 0.08}s` }}
                onMouseEnter={() => setHov(m.key)}
                onMouseLeave={() => setHov(null)}
              >
                <div className="card-glow" style={{ background: mt.ring }} />

                <div className="card-head">
                  <div className="card-icon" style={{ background: `linear-gradient(135deg, ${mt.grad[0]}20, ${mt.grad[1]}20)` }}>
                    <span>{mt.icon}</span>
                  </div>
                  <div className="card-info">
                    <div className="card-name">{m.name}{rand ? ' ⚠' : ''}</div>
                    <div className="card-val mono" style={{ color: low ? '#ef4444' : mt.ring }}>{v}%</div>
                  </div>
                  <BattSvg value={v} grad={low ? ['#ef4444','#dc2626'] : mt.grad} />
                </div>

                <Bar value={v} grad={low ? ['#ef4444','#dc2626'] : mt.grad} delay={rand ? 0 : i * 100} instant={rand} />

                <div className={`card-note mono ${hov === m.key ? 'vis' : ''}`}>→ {m.note}</div>
              </div>
            )
          })}
        </div>

        <footer className="foot mono">由 Vite + React 驱动</footer>
      </div>
    </div>
  )
}
