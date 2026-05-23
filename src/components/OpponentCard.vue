<template>
  <view :class="['opp-card', selected ? 'selected' : '', compact ? 'compact' : 'detail']" @tap="$emit('select')">
    <view class="opp-avatar" :style="{ background: opponent.avatar.color }">
      <text class="opp-avatar-text">{{ opponent.avatar.initial }}</text>
    </view>
    <view class="opp-info">
      <text class="opp-name">{{ opponent.name }}</text>
      <view class="opp-badges">
        <text class="badge-personality" :style="{ background: personalityColor }">{{ strategy.emoji }} {{ strategy.label }}</text>
      </view>
      <text v-if="winRateText" class="opp-winrate">胜率 {{ winRateText }}</text>
    </view>
    <view v-if="!compact" class="opp-desc">
      <text class="opp-desc-text">{{ strategy.desc }}</text>
      <view class="opp-difficulty-dots">
        <text v-for="d in opponent.difficultyLevels" :key="d" class="diff-dot" :style="{ color: difficultyColors[d] }">●</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { AI_STRATEGY, AI_DIFFICULTY } from '@/utils/helpers'

const props = defineProps({
  opponent: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  winRate: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})

defineEmits(['select'])

const strategy = computed(() => AI_STRATEGY[props.opponent.personality] || AI_STRATEGY.steady)
const personalityColor = computed(() => {
  const colors = { aggressive: 'rgba(217,72,72,0.08)', steady: 'rgba(43,158,143,0.08)', tricky: 'rgba(245,166,35,0.08)' }
  return colors[props.opponent.personality] || 'rgba(107,114,128,0.08)'
})
const difficultyColors = computed(() => {
  const map = {}
  for (const key of Object.keys(AI_DIFFICULTY)) map[key] = AI_DIFFICULTY[key].color
  return map
})
const winRateText = computed(() => props.winRate || '暂无记录')
</script>

<style scoped>
.opp-card {
  background: #FFFFFF; border-radius: 28rpx; padding: 28rpx;
  box-shadow: 0 2rpx 8rpx rgba(26,26,46,0.04);
  border: 3rpx solid transparent; transition: all 0.3s;
  display: flex; flex-direction: column; align-items: center; gap: 16rpx;
}
.opp-card.selected {
  border: 3rpx solid #E8573A;
  background: #FFFFFF;
}
.opp-card.compact { min-width: 240rpx; padding: 24rpx 20rpx; }
.opp-avatar {
  width: 80rpx; height: 80rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.opp-avatar-text { font-size: 32rpx; font-weight: 700; color: #FFFFFF; }
.opp-info { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.opp-name { font-size: 30rpx; font-weight: 700; color: #1A1A2E; }
.opp-badges { display: flex; gap: 8rpx; }
.badge-personality {
  font-size: 22rpx; padding: 4rpx 16rpx; border-radius: 999rpx; font-weight: 600; color: #1A1A2E;
}
.opp-winrate { font-size: 26rpx; color: #6B7280; }
.opp-desc { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.opp-desc-text { font-size: 26rpx; color: #6B7280; }
.opp-difficulty-dots { display: flex; gap: 12rpx; font-size: 26rpx; }
</style>
