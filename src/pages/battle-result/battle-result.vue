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

      <text class="result-icon">{{ icon }}</text>
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
              {{ q.myCorrect ? '✓' : '✗' }} {{ (q.myTime / 1000).toFixed(1) }}s
            </text>
            <text :class="['replay-result', q.oppCorrect ? 'replay-correct' : 'replay-wrong']">
              {{ q.oppCorrect ? '✓' : '✗' }} {{ (q.oppTime / 1000).toFixed(1) }}s
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
import { getRankFromWins } from '@/utils/helpers'
import { getPlayerRank, loadBattleStats } from '@/utils/storage'
import Fireworks from '@/components/Fireworks.vue'

const data = ref({ myScore: 0, oppScore: 0, oppName: '', won: false, questions: [], combo: 0 })
const rank = ref(getPlayerRank())
const prevRank = ref(null)

onLoad((query) => {
  if (query.data) {
    data.value = JSON.parse(decodeURIComponent(query.data))
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
})

const rankUp = computed(() => prevRank.value && prevRank.value.id !== rank.value.id)
const icon = computed(() => data.value.won ? '🏆' : data.value.myScore === data.value.oppScore ? '🤝' : '😢')
const title = computed(() => data.value.won ? '胜利！' : data.value.myScore === data.value.oppScore ? '平局！' : '惜败！')
const msg = computed(() => data.value.won ? '你击败了对手，太厉害了！' : data.value.myScore === data.value.oppScore ? '势均力敌，再比一次！' : '别灰心，下次一定能赢！')
const myAcc = computed(() => Math.round(data.value.myScore / 10 * 100))
const oppAcc = computed(() => Math.round(data.value.oppScore / 10 * 100))
const exp = computed(() => data.value.won ? 30 : data.value.myScore === data.value.oppScore ? 15 : 10)

function goHome() { uni.redirectTo({ url: '/pages/home/home' }) }
function goBattle() { uni.redirectTo({ url: '/pages/battle-match/battle-match' }) }
</script>

<style scoped>
.page { min-height: 100vh; background: #FFF8E1; position: relative; }
.result-content {
  display: flex; flex-direction: column; align-items: center;
  padding: 60rpx 48rpx 120rpx; gap: 20rpx;
}
.rank-badge {
  display: flex; align-items: center; gap: 8rpx;
  padding: 8rpx 32rpx; border-radius: 40rpx;
}
.rank-icon { font-size: 32rpx; }
.rank-name { font-size: 28rpx; font-weight: 700; color: #fff; }
.rank-up-banner {
  background: linear-gradient(to right, #FFD54F, #FF8A65);
  padding: 8rpx 40rpx; border-radius: 40rpx;
  animation: rankUpGlow 1s ease-in-out infinite alternate;
}
.rank-up-text { font-size: 28rpx; font-weight: 800; color: #fff; }
.result-icon { font-size: 128rpx; animation: float 2s ease-in-out infinite; }
.result-title { font-size: 52rpx; font-weight: 800; color: #37474F; }
.score-compare { display: flex; align-items: center; gap: 32rpx; margin: 16rpx 0; }
.score-player { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.score-name { font-size: 28rpx; color: #78909C; }
.score-num { font-size: 96rpx; font-weight: 900; color: #FF7043; }
.opp-color { color: #EF5350; }
.score-vs { font-size: 56rpx; color: #78909C; font-weight: 300; }
.result-message { font-size: 32rpx; color: #78909C; text-align: center; }
.combo-badge {
  background: linear-gradient(135deg, rgba(255,213,79,0.15), rgba(255,138,101,0.1));
  padding: 8rpx 32rpx; border-radius: 40rpx;
}
.combo-badge-text { font-size: 26rpx; font-weight: 700; color: #FF8A65; }
.result-details {
  width: 100%; max-width: 600rpx; background: #fff; border-radius: 40rpx;
  padding: 32rpx; box-shadow: 0 8rpx 40rpx rgba(255,138,101,0.1); margin: 8rpx 0;
}
.detail-row {
  display: flex; justify-content: space-between; padding: 16rpx 0;
  font-size: 30rpx; border-bottom: 2rpx solid #FFF8E1;
}
.detail-row:last-child { border-bottom: none; }
.detail-label { color: #78909C; }
.detail-value { font-weight: 700; color: #37474F; }

.replay-box {
  width: 100%; max-width: 600rpx; background: #fff; border-radius: 40rpx;
  padding: 32rpx; box-shadow: 0 8rpx 40rpx rgba(255,138,101,0.1);
}
.replay-title { font-size: 30rpx; font-weight: 700; color: #37474F; margin-bottom: 20rpx; display: block; }
.replay-item {
  display: flex; align-items: center; gap: 16rpx;
  padding: 14rpx 0; border-bottom: 2rpx solid #FFF8E1;
}
.replay-item:last-child { border-bottom: none; }
.replay-num { font-size: 26rpx; color: #78909C; font-weight: 600; min-width: 40rpx; }
.replay-word { font-size: 30rpx; font-weight: 600; color: #37474F; flex: 1; }
.replay-scores { display: flex; gap: 16rpx; }
.replay-result { font-size: 26rpx; font-weight: 600; min-width: 100rpx; }
.replay-correct { color: #66BB6A; }
.replay-wrong { color: #EF5350; }
.replay-legend { margin-top: 16rpx; text-align: center; }
.legend-text { font-size: 26rpx; color: #78909C; }

.result-actions { display: flex; gap: 24rpx; margin-top: 24rpx; width: 100%; max-width: 600rpx; }
.btn-secondary {
  flex: 1; background: #fff; color: #FF7043; border: 4rpx solid #FFB74D;
  padding: 32rpx; border-radius: 100rpx; font-size: 34rpx; font-weight: 600;
}
.btn-primary {
  flex: 1; background: linear-gradient(to right, #FF7043, #FF8A65); color: #fff;
  border: none; padding: 32rpx; border-radius: 100rpx; font-size: 34rpx; font-weight: 700;
  box-shadow: 0 8rpx 30rpx rgba(255,112,67,0.35);
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}
@keyframes rankUpGlow {
  from { box-shadow: 0 8rpx 24rpx rgba(255,213,79,0.4); }
  to   { box-shadow: 0 12rpx 48rpx rgba(255,213,79,0.7); }
}
</style>
