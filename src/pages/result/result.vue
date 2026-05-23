<template>
  <view class="page">
    <view class="result-content">
      <view :class="['result-circle', data.correct >= 7 ? 'circle-success' : data.correct >= 5 ? 'circle-ok' : 'circle-fail']">
        <text class="result-symbol"><LIcon v-if="data.correct >= 7" name="circle-check-big" :size="72" color="#FFFFFF" />
        <LIcon v-else name="alert-circle" :size="72" color="#FFFFFF" /></text>
      </view>
      <text class="result-title">测验完成！</text>
      <view class="result-score">
        <text class="correct-num">{{ data.correct }}</text>
        <text class="total-num"> / 10</text>
      </view>
      <text class="result-message">{{ message }}</text>
      <view v-if="data.checkin && data.correct === 10" class="checkin-banner">
        <text class="checkin-banner-text">打卡成功！连续 {{ data.checkinStreak }} 天</text>
      </view>
      <view v-if="data.checkin && data.correct < 10" class="checkin-fail-banner">
        <text class="checkin-fail-text">差一点点！再试一次吧</text>
      </view>
      <view v-if="prevXPLevel" class="levelup-banner">
        <text class="levelup-text"><LIcon :name="currentXPLevel.icon" :size="32" /> 等级提升！{{ prevXPLevel.name }} → {{ currentXPLevel.name }}</text>
      </view>
      <view class="rating-dots">
        <view v-for="n in 5" :key="n" :class="['rating-dot', n <= starCount ? 'dot-filled' : 'dot-empty']"></view>
      </view>
      <view class="result-details">
        <view class="detail-row">
          <text class="detail-label">用时</text>
          <text class="detail-value">{{ data.time }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">正确率</text>
          <text class="detail-value">{{ accuracy }}%</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">经验值</text>
          <text class="detail-value">+{{ data.correct * 5 }} EXP</text>
        </view>
      </view>
      <view v-if="data.wrongList && data.wrongList.length > 0" class="wrong-box">
        <text class="wrong-title">错题回顾</text>
        <view v-for="(w, i) in data.wrongList" :key="i" class="wrong-item">
          <text class="wrong-word">{{ w.word }}</text>
          <text class="wrong-answer">你的答案：{{ w.yourAnswer }}</text>
          <text class="correct-answer">正确答案：{{ w.correctAnswer }}</text>
        </view>
      </view>
      <view class="result-actions">
        <template v-if="data.checkin && data.correct < 10">
          <button class="btn-primary" @tap="goRetryCheckin">再试一次</button>
          <button class="btn-third" @tap="goHome">返回首页</button>
        </template>
        <template v-else-if="data.checkin && data.correct === 10">
          <button class="btn-primary" @tap="goHome">返回首页</button>
        </template>
        <template v-else>
          <button class="btn-secondary" @tap="goLearn">再学一次</button>
          <button class="btn-third" @tap="goHome">返回首页</button>
          <button class="btn-primary" @tap="goBattle">再来一局</button>
        </template>
      </view>
    </view>
    <Fireworks :active="showFireworks" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getLevelFromXP } from '@/utils/helpers'
import { getTotalXP } from '@/utils/storage'
import Fireworks from '@/components/Fireworks.vue'
import LIcon from '@/components/LIcon.vue'
import { playWin, playLose } from '@/utils/sound'

const data = ref({ correct: 0, wrong: 0, time: '0:00', wrongList: [], checkin: 0, checkinStreak: 0 })
const prevXPLevel = ref(null)
const currentXPLevel = ref(null)

onLoad((query) => {
  if (query.data) {
    data.value = JSON.parse(decodeURIComponent(query.data))
  }
  const xpGained = data.value.correct * 5
  const totalXP = getTotalXP()
  currentXPLevel.value = getLevelFromXP(totalXP)
  const beforeLevel = getLevelFromXP(totalXP - xpGained)
  if (currentXPLevel.value.level > beforeLevel.level) {
    prevXPLevel.value = beforeLevel
  }
  if (data.value.correct >= 7) {
    playWin()
  } else {
    playLose()
  }
})

const accuracy = computed(() => Math.round((data.value.correct / 10) * 100))
const starCount = computed(() => {
  const c = data.value.correct
  if (c >= 9) return 5
  if (c >= 7) return 4
  if (c >= 5) return 3
  if (c >= 3) return 2
  return 1
})
const message = computed(() => {
  const c = data.value.correct
  if (c >= 9) return '完美！你是单词大王！'
  if (c >= 7) return '太厉害了！'
  if (c >= 5) return '很棒，保持下去！'
  if (c >= 3) return '不错哦，继续努力！'
  return '再接再厉，加油！'
})
const showFireworks = computed(() => data.value.correct >= 8 || !!prevXPLevel.value || (data.value.checkin && data.value.correct === 10))

function goHome() { uni.redirectTo({ url: '/pages/home/home' }) }
function goLearn() { uni.redirectTo({ url: '/pages/learn/learn' }) }
function goBattle() { uni.redirectTo({ url: '/pages/battle-match/battle-match' }) }
function goRetryCheckin() { uni.redirectTo({ url: '/pages/quiz/quiz?mode=checkin' }) }
</script>

<style scoped>
.page { min-height: 100vh; background: #F7F5F0; position: relative; }
.result-content {
  display: flex; flex-direction: column; align-items: center;
  padding: 80rpx 48rpx; gap: 24rpx;
}
.result-circle {
  width: 128rpx; height: 128rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  animation: float 2s ease-in-out infinite;
}
.circle-success { background: #2B9E8F; }
.circle-ok { background: #F5A623; }
.circle-fail { background: #D94848; }
.result-symbol { font-size: 72rpx; font-weight: 900; color: #FFFFFF; display: flex; align-items: center; justify-content: center; }
.result-title { font-size: 52rpx; font-weight: 800; color: #1A1A2E; }
.result-score { font-size: 96rpx; font-weight: 900; color: #A855C7; }
.total-num { font-size: 48rpx; color: #6B7280; font-weight: 400; }
.result-message { font-size: 32rpx; color: #6B7280; text-align: center; }
.levelup-banner {
  background: linear-gradient(135deg, #F5A623, #FFB300);
  padding: 16rpx 40rpx; border-radius: 999rpx;
  animation: levelPulse 0.8s ease-in-out 2;
}
.levelup-text { font-size: 30rpx; font-weight: 800; color: #FFFFFF; }
@keyframes levelPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.rating-dots { display: flex; gap: 16rpx; }
.rating-dot {
  width: 24rpx; height: 24rpx; border-radius: 50%;
  transition: all 0.3s;
}
.dot-filled { background: #F5A623; }
.dot-empty { background: #EAEAEA; }
.result-details {
  width: 100%; max-width: 600rpx; background: #FFFFFF; border-radius: 28rpx;
  padding: 32rpx; box-shadow: 0 8rpx 32rpx rgba(26,26,46,0.08); margin: 16rpx 0;
}
.detail-row {
  display: flex; justify-content: space-between; padding: 16rpx 0;
  font-size: 30rpx; border-bottom: 2rpx solid #F0EDE8;
}
.detail-row:last-child { border-bottom: none; }
.detail-label { color: #6B7280; }
.detail-value { font-weight: 700; color: #1A1A2E; }
.wrong-box {
  width: 100%; max-width: 600rpx; background: rgba(217,72,72,0.04);
  border-radius: 28rpx; padding: 32rpx; border: 2rpx solid rgba(217,72,72,0.12);
}
.wrong-title { font-size: 30rpx; color: #D94848; font-weight: 700; margin-bottom: 20rpx; }
.wrong-item { display: flex; flex-direction: column; gap: 4rpx; padding: 16rpx 0; border-bottom: 2rpx solid rgba(217,72,72,0.08); }
.wrong-item:last-child { border-bottom: none; }
.wrong-word { font-weight: 700; color: #1A1A2E; font-size: 32rpx; }
.wrong-answer { font-size: 26rpx; color: #D94848; }
.correct-answer { font-size: 26rpx; color: #2B9E8F; }
.checkin-banner {
  background: linear-gradient(135deg, #2B9E8F, #2B9E8F);
  padding: 20rpx 48rpx; border-radius: 999rpx;
  animation: pulseCheckin 0.8s ease-in-out 2;
}
.checkin-banner-text { font-size: 32rpx; font-weight: 800; color: #FFFFFF; }
.checkin-fail-banner {
  background: linear-gradient(135deg, #F5A623, #FFB300);
  padding: 20rpx 48rpx; border-radius: 999rpx;
}
.checkin-fail-text { font-size: 32rpx; font-weight: 800; color: #FFFFFF; }
.result-actions {
  display: flex; flex-wrap: wrap; gap: 16rpx; justify-content: center;
  margin-top: 24rpx; width: 100%; max-width: 600rpx;
}
.btn-secondary {
  flex: 1; min-width: 200rpx; background: #F3E8FF; color: #A855C7; border: none;
  padding: 32rpx; border-radius: 999rpx; font-size: 34rpx; font-weight: 600;
}
.btn-third {
  flex: 1; min-width: 200rpx; background: transparent; color: #9CA3AF; border: none;
  font-size: 28rpx; font-weight: 300; padding: 32rpx 24rpx;
}
.btn-primary {
  flex: 1; min-width: 200rpx; background: #A855C7; color: #FFFFFF;
  border: none; padding: 32rpx; border-radius: 999rpx; font-size: 34rpx; font-weight: 700;
  box-shadow: 0 8rpx 32rpx rgba(26,26,46,0.08);
}
@keyframes levelPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
@keyframes pulseCheckin {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}
</style>
