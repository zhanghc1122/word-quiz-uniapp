<template>
  <view v-if="visible" class="ai-thinking">
    <view class="ai-avatar-circle" :style="{ background: opponentAvatar.color }">
      <text class="ai-avatar-initial">{{ opponentAvatar.initial }}</text>
    </view>
    <view v-if="!resolved" class="dots">
      <view class="dot d1"></view>
      <view class="dot d2"></view>
      <view class="dot d3"></view>
    </view>
    <text v-else :class="['resolved-icon', correct ? 'icon-correct' : 'icon-wrong']"><LIcon v-if="!correct" name="octagon-x" :size="32" color="#D94848" />
    <LIcon v-else name="circle-check-big" :size="32" color="#2B9E8F" /></text>
  </view>
</template>

<script setup>
const props = defineProps({
  visible: Boolean,
  opponentAvatar: { type: Object, default: () => ({ initial: 'A', color: '#A855C7' }) },
  resolved: { type: Boolean, default: false },
  correct: { type: Boolean, default: true },
})
</script>

<style scoped>
.ai-thinking {
  display: flex; align-items: center; gap: 12rpx;
  padding: 12rpx 24rpx; background: #FFFFFF;
  border-radius: 999rpx; box-shadow: 0 2rpx 8rpx rgba(26,26,46,0.04);
}
.ai-avatar-circle {
  width: 48rpx; height: 48rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.ai-avatar-initial { color: #FFFFFF; font-size: 24rpx; font-weight: 700; }
.dots { display: flex; gap: 8rpx; }
.dot {
  width: 12rpx; height: 12rpx; border-radius: 50%; background: #9CA3AF;
  animation: dotPulse 1s ease-in-out infinite;
}
.d2 { animation-delay: 0.2s; }
.d3 { animation-delay: 0.4s; }
.resolved-icon { font-size: 32rpx; font-weight: 900; }
.icon-correct { color: #2B9E8F; }
.icon-wrong { color: #D94848; }
@keyframes dotPulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
</style>
