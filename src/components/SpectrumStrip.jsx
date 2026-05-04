import { useEffect, useRef } from 'react'
import { getAnalyser } from '../audio/audioEngine'

export default function SpectrumStrip({ active }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!active) return undefined
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const readAccent = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#9ff'

    const draw = () => {
      const analyser = getAnalyser()
      if (!analyser) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }
      const values = analyser.getValue()
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      const accent = readAccent()
      const bars = values.length
      const gap = 2 * dpr
      const barW = Math.max(1, (w - gap * (bars - 1)) / bars)
      for (let i = 0; i < bars; i += 1) {
        const v = values[i]
        // FFT returns dB values roughly in [-100, 0]; normalize.
        const norm = Math.max(0, Math.min(1, (v + 100) / 70))
        const barH = norm * h
        ctx.fillStyle = accent
        ctx.globalAlpha = 0.25 + norm * 0.7
        ctx.fillRect(i * (barW + gap), h - barH, barW, barH)
      }
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        display: 'block',
        width: '100%',
        height: '28px',
        marginBottom: '10px',
        opacity: active ? 0.85 : 0.25,
        transition: 'opacity 200ms ease',
      }}
    />
  )
}
