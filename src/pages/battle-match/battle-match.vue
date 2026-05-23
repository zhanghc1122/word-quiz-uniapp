<template>
  <view class="page">
    <view class="header">
      <view class="btn-back" @tap="goBack"><text class="back-arrow">‹</text></view>
      <text class="header-title">PK对战</text>
      <view class="spacer"></view>
    </view>

    <view class="section">
      <text class="section-label">选择难度</text>
      <view class="diff-row">
        <view
          v-for="(diff, key) in difficulties" :key="key"
          :class="['diff-card', selectedDiff === key ? 'diff-selected' : '']"
          :style="{ borderLeftColor: diff.color }"
          @tap="selectDifficulty(key)"
        >
          <text class="diff-label" :style="{ color: diff.color }">{{ diff.label }}</text>
          <text class="diff-acc">准确率 {{ Math.round(diff.accuracy * 100) }}%</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-label">选择对手</text>
      <scroll-view scroll-x class="opp-scroll">
        <view class="opp-row">
          <OpponentCard
            v-for="opp in availableOpponents" :key="opp.id"
            :opponent="opp"
            :selected="selectedOppId === opp.id"
            :winRate="getWinRate(opp.id)"
            :compact="true"
            @select="selectOpponent(opp)"
          />
        </view>
      </scroll-view>
    </view>

    <view v-if="selectedOpp" class="selected-detail">
      <view class="detail-avatar"><text>{{ selectedOpp.avatar }}</text></view>
      <text class="detail-name">{{ selectedOpp.name }}</text>
      <text class="detail-strategy">{{ strategyInfo.emoji }} {{ strategyInfo.label }} · {{ strategyInfo.desc }}</text>
      <view class="detail-stats">
        <view class="detail-stat">
          <text class="stat-val">{{ diffLabel }}</text>
          <text class="stat-lbl">难度</text>
        </view>
        <view class="detail-stat">
          <text class="stat-val">{{ getWinRate(selectedOpp.id) }}</text>
          <text class="stat-lbl">历史胜率</text>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <button class="btn-start" @tap="startMatch">开始对战</button>
    </view>

    <view v-if="matching" class="match-overlay">
      <view class="match-content">
        <view class="radar-ring"></view>
        <text class="match-text">匹配对手中...</text>
        <text class="match-sub">{{ selectedOpp.name }} · {{ diffLabel }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { AI_OPPONENTS, AI_DIFFICULTY, AI_STRATEGY } from '@/utils/helpers'
import { loadBattleStats } from '@/utils/storage'
import OpponentCard from '@/components/OpponentCard.vue'

const difficulties = AI_DIFFICULTY
const selectedDiff = ref('medium')
const selectedOppId = ref(AI_OPPONENTS[0].id)
const matching = ref(false)

const selectedOpp = computed(() => AI_OPPONENTS.find(o => o.id === selectedOppId.value))
const strategyInfo = computed(() => AI_STRATEGY[selectedOpp.value.personality] || AI_STRATEGY.steady)
const diffLabel = computed(() => AI_DIFFICULTY[selectedDiff.value].label)

const availableOpponents = computed(() => {
  return AI_OPPONENTS.filter(o => o.difficultyLevels.includes(selectedDiff.value))
})

const battleStats = loadBattleStats()

function getWinRate(oppId) {
  const record = battleStats.byOpponent[oppId]
  if (!record) return '暂无'
  const total = record.wins + record.losses
  if (total === 0) return '暂无'
  return Math.round((record.wins / total) * 100) + '%'
}

function selectDifficulty(key) {
  selectedDiff.value = key
  if (!selectedOpp.value.difficultyLevels.includes(key)) {
    selectedOppId.value = availableOpponents.value[0]?.id || AI_OPPONENTS[0].id
  }
}

function selectOpponent(opp) {
  selectedOppId.value = opp.id
}

function startMatch() {
  matching.value = true
  setTimeout(() => {
    uni.redirectTo({
      url: `/pages/battle/battle?opponentId=${selectedOppId.value}&difficulty=${selectedDiff.value}`
    })
  }, 2500)
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}
</script>

<style scoped>
.page { min-height: 100vh; background: #FFF8E1; padding-bottom: 160rpx; }
.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 32rpx 40rpx;
}
.btn-back {
  width: 80rpx; height: 80rpx; background: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(255,138,101,0.12);
}
.back-arrow { font-size: 48rpx; font-weight: bold; color: #37474F; }
.header-title { font-size: 40rpx; font-weight: 700; color: #37474F; }
.spacer { width: 80rpx; }
.section { padding: 24rpx 40rpx 0; }
.section-label { font-size: 28rpx; color: #78909C; font-weight: 600; margin-bottom: 16rpx; display: block; }
.diff-row { display: flex; gap: 20rpx; }
.diff-card {
  flex: 1; padding: 24rpx 20rpx; background: #fff; border-radius: 24rpx;
  border-left: 6rpx solid #ccc;
  box-shadow: 0 4rpx 16rpx rgba(255,138,101,0.08);
  display: flex; flex-direction: column; align-items: center; gap: 8rpx;
  transition: all 0.3s;
}
.diff-card.diff-selected {
  box-shadow: 0 8rpx 32rpx rgba(255,112,67,0.15);
  background: linear-gradient(135deg, rgba(255,138,101,0.03), rgba(255,183,77,0.06));
}
.diff-label { font-size: 30rpx; font-weight: 700; }
.diff-acc { font-size: 26rpx; color: #78909C; }
.opp-scroll { white-space: nowrap; }
.opp-row { display: inline-flex; gap: 20rpx; padding: 8rpx 0; }
.selected-detail {
  margin: 32rpx 40rpx; padding: 40rpx; background: #fff; border-radius: 48rpx;
  box-shadow: 0 8rpx 40rpx rgba(255,138,101,0.1);
  display: flex; flex-direction: column; align-items: center; gap: 12rpx;
}
.detail-avatar {
  width: 140rpx; height: 140rpx; border-radius: 50%; background: #FFF8E1;
  display: flex; align-items: center; justify-content: center; font-size: 72rpx;
}
.detail-name { font-size: 36rpx; font-weight: 800; color: #37474F; }
.detail-strategy { font-size: 26rpx; color: #78909C; }
.detail-stats { display: flex; gap: 64rpx; margin-top: 16rpx; }
.detail-stat { display: flex; flex-direction: column; align-items: center; gap: 4rpx; }
.stat-val { font-size: 32rpx; font-weight: 700; color: #FF7043; }
.stat-lbl { font-size: 26rpx; color: #78909C; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 24rpx 40rpx; background: #fff; box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.04); }
.btn-start {
  background: linear-gradient(to right, #FF7043, #FF8A65); color: #fff; border: none;
  padding: 32rpx; border-radius: 100rpx; font-size: 38rpx; font-weight: 700;
  box-shadow: 0 12rpx 40rpx rgba(255,112,67,0.35);
}
.match-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(55, 71, 79, 0.9); display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.match-content { display: flex; flex-direction: column; align-items: center; gap: 24rpx; }
.radar-ring {
  width: 200rpx; height: 200rpx; border-radius: 50%;
  border: 6rpx solid rgba(255,138,101,0.4);
  animation: radarPulse 1.5s ease-out infinite;
}
.match-text { color: #fff; font-size: 36rpx; font-weight: 700; }
.match-sub { color: rgba(255,255,255,0.6); font-size: 28rpx; }
@keyframes radarPulse {
  0%   { transform: scale(0.6); opacity: 1; border-color: rgba(255,138,101,0.8); }
  100% { transform: scale(1.8); opacity: 0; border-color: rgba(255,138,101,0); }
}
</style>
