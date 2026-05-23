<template>
  <view v-if="visible" class="combo-overlay">
    <view :class="['combo-box', comboLevel]">
      <text class="combo-text">{{ comboLabel }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  combo: { type: Number, default: 0 },
})

const comboLevel = computed(() => {
  if (props.combo >= 8) return 'level-gold'
  if (props.combo >= 5) return 'level-fire'
  return 'level-normal'
})

const comboLabel = computed(() => {
  if (props.combo >= 8) return `${props.combo} 连击!!`
  if (props.combo >= 5) return `${props.combo} 连击!`
  return `x${props.combo} 连击`
})
</script>

<style scoped>
.combo-overlay {
  position: fixed; top: 30%; left: 0; right: 0;
  display: flex; justify-content: center; z-index: 998; pointer-events: none;
  animation: comboSlideIn 1.2s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
}
.combo-box {
  padding: 24rpx 64rpx; border-radius: 60rpx;
  display: flex; align-items: center;
}
.combo-text { font-size: 48rpx; font-weight: 900; color: #fff; }
.level-normal {
  background: linear-gradient(to right, #66BB6A, #A5D6A7);
  box-shadow: 0 12rpx 40rpx rgba(102, 187, 106, 0.5);
}
.level-fire {
  background: linear-gradient(to right, #FFD54F, #FF8A65);
  box-shadow: 0 12rpx 40rpx rgba(255, 138, 101, 0.5);
}
.level-gold {
  background: linear-gradient(to right, #FFD54F, #EF5350);
  box-shadow: 0 16rpx 60rpx rgba(255, 213, 79, 0.6);
  animation: comboSlideIn 1.2s cubic-bezier(0.2, 0.8, 0.3, 1) forwards, glowPulse 0.4s ease-in-out infinite alternate;
}
@keyframes comboSlideIn {
  0%   { transform: translateX(-200rpx) scale(0.5); opacity: 0; }
  15%  { transform: translateX(0) scale(1.3); opacity: 1; }
  30%  { transform: scale(1); opacity: 1; }
  75%  { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.8) translateY(-60rpx); opacity: 0; }
}
@keyframes glowPulse {
  from { box-shadow: 0 16rpx 60rpx rgba(255, 213, 79, 0.4); }
  to   { box-shadow: 0 16rpx 80rpx rgba(255, 213, 79, 0.8); }
}
</style>
