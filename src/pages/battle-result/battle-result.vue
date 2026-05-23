<template>
  <view class="page">
    <view class="result-content">
      <view class="rank-badge" :style="{ background: rank.color }">
        <text class="rank-icon">{{ rank.icon }}</text>
        <text class="rank-name">{{ rank.name }}</text>
      </view>
      <view v-if="rankUp" class="rank-up-banner">
        <text class="rank-up-text">段位提升！</text>
      </view>
      <view v-if="xpLevelUp" class="levelup-banner">
        <text class="levelup-text"><LIcon :name="xpLevelUp.current.icon" :size="32" /> 等级提升！{{ xpLevelUp.prev.name }} → {{ xpLevelUp.current.name }}</text>
      </view>

      <view :class="['result-circle', data.won ? 'circle-win' : data.myScore === data.oppScore ? 'circle-draw' : 'circle-lose']">
        <LIcon v-if="data.won" name="check" :size="72" color="#FFFFFF" /><LIcon v-else-if="data.myScore === data.oppScore" name="minus" :size="72" color="#FFFFFF" /><LIcon v-else name="x" :size="72" color="#FFFFFF" />
      </view>
      <text class="result-title">{{ title }}</text>

      <view class="score-compare">
        <view class="score-player">
          <text class="score-name">我</text>
          <text class="score-num">{{ data.myScore }}</text>
        </view>
        <text class="score-vs">:</text>
        <view class="score-player">
          <text class="score-name">{{ data.oppName }}</text>
          <text class="score-num opp-color">{{ data.oppScore }}</text>
        </view>
      </view>

      <text class="result-message">{{ msg }}</text>

      <view v-if="data.combo && data.combo >= 2" class="combo-badge">
        <text class="combo-badge-text">最高连击 x{{ data.combo }}</text>
      </view>

      <view class="result-details">
        <view class="detail-row">
          <text class="detail-label">你的正确率</text>
          <text class="detail-value">{{ myAcc }}%</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">对手正确率</text>
          <text class="detail-value">{{ oppAcc }}%</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">获得经验</text>
          <text class="detail-value">+{{ exp }} EXP</text>
        </view>
      </view>

      <view v-if="data.questions && data.questions.length > 0" class="replay-box">
        <text class="replay-title">对局回放</text>
        <view v-for="(q, i) in data.questions" :key="i" class="replay-item">
          <text class="replay-num">{{ i + 1 }}</text>
          <text class="replay-word">{{ q.word }}</text>
          <view class="replay-scores">
            <text :class="['replay-result', q.myCorrect ? 'replay-correct' : 'replay-wrong']">
              <LIcon :name="q.myCorrect ? 'check' : 'x'" :size="24" :color="q.myCorrect ? '#2B9E8F' : '#D94848'" /> {{ (q.myTime / 1000).toFixed(1) }}s
            </text>
            <text :class="['replay-result', q.oppCorrect ? 'replay-correct' : 'replay-wrong']">
              <LIcon :name="q.oppCorrect ? 'check' : 'x'" :size="24" :color="q.oppCorrect ? '#2B9E8F' : '#D94848'" /> {{ (q.oppTime / 1000).toFixed(1) }}s
            </text>
          </view>
        </view>
        <view class="replay-legend">
          <text class="legend-text">左边 = 你 | 右边 = {{ data.oppName }}</text>
        </view>
      </view>

      <view class="result-actions">
        <button class="btn-secondary" @tap="goHome">返回首页</button>
        <button class="btn-primary" @tap="goBattle">再来一局</button>
      </view>
    </view>
    <Fireworks :active="data.won" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getRankFromWins, getLevelFromXP } from '@/utils/helpers'
import { getPlayerRank, loadBattleStats, getTotalXP } from '@/utils/storage'
import { playBattleWin, playBattleLose, speakBattleWin } from '@/utils/sound'
import Fireworks from '@/components/Fireworks.vue'
import LIcon from '@/components/LIcon.vue'

const data = ref({ myScore: 0, oppScore: 0, oppName: '', won: false, questions: [], combo: 0 })
const rank = ref(getPlayerRank())
const prevRank = ref(null)
const xpLevelUp = ref(null)

onLoad((query) => {
  if (query.data) {
    data.value = JSON.parse(decodeURIComponent(query.data))
  }
  if (data.value.won) {
    playBattleWin()
    speakBattleWin()
  } else if (data.value.myScore !== data.value.oppScore) {
    playBattleLose()
  }
  const current = getPlayerRank()
  const bs = loadBattleStats()
  if (data.value.won && bs.totalWins > 0) {
    const oldRank = getRankFromWins(bs.totalWins - 1)
    if (oldRank.id !== current.id) {
      prevRank.value = oldRank
      rank.value = current
    }
  }
  const battleXP = data.value.won ? 30 : (data.value.myScore === data.value.oppScore ? 15 : 10)
  const totalXP = getTotalXP()
  const nowLevel = getLevelFromXP(totalXP)
  const beforeLevel = getLevelFromXP(totalXP - battleXP)
  if (nowLevel.level > beforeLevel.level) {
    xpLevelUp.value = { prev: beforeLevel, current: nowLevel }
  }
})

const rankUp = computed(() => prevRank.value && prevRank.value.id !== rank.value.id)
const title = computed(() => data.value.won ? '胜利！' : data.value.myScore === data.value.oppScore ? '平局！' : '惜败！')
const msg = computed(() => data.value.won ? '你击败了对手，太厉害了！' : data.value.myScore === data.value.oppScore ? '势均力敌，再比一次！' : '别灰心，下次一定能赢！')
const myAcc = computed(() => Math.round(data.value.myScore / 10 * 100))
const oppAcc = computed(() => Math.round(data.value.oppScore / 10 * 100))
const exp = computed(() => data.value.won ? 30 : data.value.myScore === data.value.oppScore ? 15 : 10)

function goHome() { uni.redirectTo({ url: '/pages/home/home' }) }
function goBattle() { uni.redirectTo({ url: '/pages/battle-match/battle-match' }) }
</script>

<style scoped>
.page { min-height: 100vh; background: #F7F5F0; position: relative; }
.result-content {
  display: flex; flex-direction: column; align-items: center;
  padding: 60rpx 48rpx 120rpx; gap: 20rpx;
}
.rank-badge {
  display: flex; align-items: center; gap: 8rpx;
  padding: 8rpx 32rpx; border-radius: 999rpx;
}
.rank-icon { font-size: 32rpx; }
.rank-name { font-size: 28rpx; font-weight: 700; color: #FFFFFF; }
.rank-up-banner {
  background: #F5A623;
  padding: 8rpx 40rpx; border-radius: 999rpx;
}
.rank-up-text { font-size: 28rpx; font-weight: 800; color: #FFFFFF; }
.levelup-banner {
  background: linear-gradient(135deg, #F5A623, #FFB300);
  padding: 16rpx 40rpx; border-radius: 999rpx;
  animation: levelPulse 0.8s ease-in-out 2;
}
.levelup-text { font-size: 30rpx; font-weight: 800; color: #FFFFFF; }

.result-circle {
  width: 128rpx; height: 128rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  animation: float 2s ease-in-out infinite;
}
.circle-win { background: #2B9E8F; }
.circle-draw { background: #F5A623; }
.circle-lose { background: #D94848; }
.result-symbol { font-size: 72rpx; font-weight: 900; color: #FFFFFF; display: flex; align-items: center; justify-content: center; }

.result-title { font-size: 52rpx; font-weight: 800; color: #1A1A2E; }
.score-compare { display: flex; align-items: center; gap: 32rpx; margin: 16rpx 0; }
.score-player { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.score-name { font-size: 28rpx; color: #6B7280; }
.score-num { font-size: 96rpx; font-weight: 900; color: #E8573A; }
.opp-color { color: #D94848; }
.score-vs { font-size: 56rpx; color: #9CA3AF; font-weight: 300; }
.result-message { font-size: 32rpx; color: #6B7280; text-align: center; }
.combo-badge {
  background: rgba(245,166,35,0.08);
  padding: 8rpx 32rpx; border-radius: 999rpx;
}
.combo-badge-text { font-size: 26rpx; font-weight: 700; color: #F5A623; }
.result-details {
  width: 100%; max-width: 600rpx; background: #FFFFFF; border-radius: 28rpx;
  padding: 32rpx; box-shadow: 0 8rpx 32rpx rgba(26,26,46,0.08); margin: 8rpx 0;
}
.detail-row {
  display: flex; justify-content: space-between; padding: 16rpx 0;
  font-size: 30rpx; border-bottom: 2rpx solid #F0EDE8;
}
.detail-row:last-child { border-bottom: none; }
.detail-label { color: #6B7280; }
.detail-value { font-weight: 700; color: #1A1A2E; }

.replay-box {
  width: 100%; max-width: 600rpx; background: #FFFFFF; border-radius: 28rpx;
  padding: 32rpx; box-shadow: 0 8rpx 32rpx rgba(26,26,46,0.08);
}
.replay-title { font-size: 30rpx; font-weight: 700; color: #1A1A2E; margin-bottom: 20rpx; display: block; }
.replay-item {
  display: flex; align-items: center; gap: 16rpx;
  padding: 14rpx 0; border-bottom: 2rpx solid #F0EDE8;
}
.replay-item:last-child { border-bottom: none; }
.replay-num { font-size: 26rpx; color: #6B7280; font-weight: 600; min-width: 40rpx; }
.replay-word { font-size: 30rpx; font-weight: 600; color: #1A1A2E; flex: 1; }
.replay-scores { display: flex; gap: 16rpx; }
.replay-result { font-size: 26rpx; font-weight: 600; min-width: 100rpx; }
.replay-correct { color: #2B9E8F; }
.replay-wrong { color: #D94848; }
.replay-legend { margin-top: 16rpx; text-align: center; }
.legend-text { font-size: 26rpx; color: #9CA3AF; }

.result-actions { display: flex; gap: 24rpx; margin-top: 24rpx; width: 100%; max-width: 600rpx; }
.btn-secondary:active { background: rgba(232,87,58,0.04); transform: scale(0.98); }
.btn-secondary {
  flex: 1; background: #FFFFFF; color: #E8573A; border: 3rpx solid #EAEAEA;
  padding: 32rpx; border-radius: 999rpx; font-size: 34rpx; font-weight: 600;
}
.btn-primary:active {
  background: #C04020; transform: scale(0.98); box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.08);
}
.btn-primary {
  flex: 1; background: #E8573A; color: #FFFFFF;
  border: none; padding: 32rpx; border-radius: 999rpx; font-size: 34rpx; font-weight: 700;
  box-shadow: 0 8rpx 32rpx rgba(26,26,46,0.08);
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}
@keyframes levelPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>
