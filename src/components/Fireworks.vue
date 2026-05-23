<template>
  <canvas
    v-if="active"
    canvas-id="fireworksCanvas"
    id="fireworksCanvas"
    type="2d"
    class="fireworks-canvas"
  ></canvas>
</template>

<script setup>
import { watch, nextTick } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: false }
})

watch(() => props.active, async (val) => {
  if (val) {
    await nextTick()
    startFireworks()
  }
})

function startFireworks() {
  const sysInfo = uni.getSystemInfoSync()
  const w = sysInfo.windowWidth
  const h = sysInfo.windowHeight

  const query = uni.createSelectorQuery()
  query.select('#fireworksCanvas')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res || !res[0]) return
      const canvas = res[0].node
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const dpr = sysInfo.pixelRatio
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)

      const particles = []
      const colors = ['#FF6B6B', '#FDCB6E', '#6C5CE7', '#00B894', '#74B9FF', '#E17055', '#A29BFE', '#55EFC4']

      function burst(x, y) {
        const count = 40 + Math.floor(Math.random() * 20)
        const color = colors[Math.floor(Math.random() * colors.length)]
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3
          const speed = 2 + Math.random() * 3
          particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, decay: 0.01 + Math.random() * 0.015, size: 2 + Math.random() * 2, color })
        }
      }

      let frameCount = 0
      function animate() {
        if (frameCount > 200) { ctx.clearRect(0, 0, w, h); return }
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = 'rgba(0,0,0,0.15)'
        ctx.fillRect(0, 0, w, h)
        ctx.globalCompositeOperation = 'lighter'

        if (frameCount < 150 && frameCount % 25 === 0) {
          burst(60 + Math.random() * (w - 120), 80 + Math.random() * h * 0.4)
        }

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.vx *= 0.99; p.life -= p.decay
          if (p.life <= 0) { particles.splice(i, 1); continue }
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.life
          ctx.fill()
        }
        ctx.globalAlpha = 1
        frameCount++
        canvas.requestAnimationFrame(animate)
      }

      burst(w * 0.3, h * 0.25)
      burst(w * 0.7, h * 0.2)
      animate()
    })
}
</script>

<style scoped>
.fireworks-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 750rpx;
  height: 100vh;
  pointer-events: none;
  z-index: 100;
}
</style>
