<template>
  <view v-if="visible" class="ai-thinking">
    <text class="ai-avatar">{{ opponentAvatar }}</text>
    <view v-if="!resolved" class="dots">
      <view class="dot d1"></view>
      <view class="dot d2"></view>
      <view class="dot d3"></view>
    </view>
    <text v-else :class="['resolved-icon', correct ? 'icon-correct' : 'icon-wrong']">{{ correct ? '✓' : '✗' }}</text>
  </view>
</template>

<script setup>
const props = defineProps({
  visible: Boolean,
  opponentAvatar: { type: String, default: '🤖' },
  resolved: { type: Boolean, default: false },
  correct: { type: Boolean, default: true },
})
</script>

<style scoped>
.ai-thinking {
  display: flex; align-items: center; gap: 12rpx;
  padding: 12rpx 24rpx; background: rgba(255,255,255,0.9);
  border-radius: 40rpx; box-shadow: 0 4rpx 16rpx rgba(255,112,67,0.1);
}
.ai-avatar { font-size: 36rpx; }
.dots { display: flex; gap: 8rpx; }
.dot {
  width: 12rpx; height: 12rpx; border-radius: 50%; background: #FFB74D;
  animation: dotPulse 1s ease-in-out infinite;
}
.d2 { animation-delay: 0.2s; }
.d3 { animation-delay: 0.4s; }
.resolved-icon { font-size: 32rpx; font-weight: 900; }
.icon-correct { color: #66BB6A; }
.icon-wrong { color: #EF5350; }
@keyframes dotPulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
</style>
