<template>
  <view :class="['opp-card', selected ? 'selected' : '', compact ? 'compact' : 'detail']" @tap="$emit('select')">
    <view class="opp-avatar-wrap">
      <text class="opp-avatar">{{ opponent.avatar }}</text>
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
  const colors = { aggressive: 'rgba(239,83,80,0.12)', steady: 'rgba(102,187,106,0.12)', tricky: 'rgba(255,213,79,0.15)' }
  return colors[props.opponent.personality] || 'rgba(255,138,101,0.1)'
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
  background: #fff; border-radius: 40rpx; padding: 28rpx;
  box-shadow: 0 8rpx 40rpx rgba(255,138,101,0.1);
  border: 4rpx solid transparent; transition: all 0.3s;
  display: flex; flex-direction: column; align-items: center; gap: 16rpx;
}
.opp-card.selected {
  border-color: #FF8A65;
  background: linear-gradient(135deg, rgba(255,138,101,0.04), rgba(255,183,77,0.08));
}
.opp-card.compact { min-width: 240rpx; padding: 24rpx 20rpx; }
.opp-avatar-wrap {
  width: 120rpx; height: 120rpx; background: #FFF8E1; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.opp-avatar { font-size: 64rpx; }
.opp-info { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.opp-name { font-size: 30rpx; font-weight: 700; color: #37474F; }
.opp-badges { display: flex; gap: 8rpx; }
.badge-personality {
  font-size: 22rpx; padding: 4rpx 16rpx; border-radius: 20rpx; font-weight: 600; color: #37474F;
}
.opp-winrate { font-size: 26rpx; color: #78909C; }
.opp-desc { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.opp-desc-text { font-size: 26rpx; color: #78909C; }
.opp-difficulty-dots { display: flex; gap: 12rpx; font-size: 26rpx; }
</style>
