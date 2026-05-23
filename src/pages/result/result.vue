<template>
  <view class="page">
    <view class="result-content">
      <view :class="['result-circle', data.correct >= 7 ? 'circle-success' : data.correct >= 5 ? 'circle-ok' : 'circle-fail']">
        <text class="result-symbol"><LIcon v-if="data.correct >= 7" name="check" size="72rpx" color="#FFFFFF" /><text v-else>!</text></text>
      </view>
      <text class="result-title">测验完成！</text>
      <view class="result-score">
        <text class="correct-num">{{ data.correct }}</text>
        <text class="total-num"> / 10</text>
      </view>
      <text class="result-message">{{ message }}</text>
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
        <button class="btn-secondary" @tap="goHome">返回首页</button>
        <button class="btn-primary" @tap="goBattle">再来一局PK</button>
      </view>
    </view>
    <Fireworks :active="showFireworks" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Fireworks from '@/components/Fireworks.vue'
import LIcon from '@/components/LIcon.vue'

const data = ref({ correct: 0, wrong: 0, time: '0:00', wrongList: [] })

onLoad((query) => {
  if (query.data) {
    data.value = JSON.parse(decodeURIComponent(query.data))
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
const showFireworks = computed(() => data.value.correct >= 8)

function goHome() { uni.redirectTo({ url: '/pages/home/home' }) }
function goBattle() { uni.redirectTo({ url: '/pages/battle-match/battle-match' }) }
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
.result-score { font-size: 96rpx; font-weight: 900; color: #7C5CBF; }
.total-num { font-size: 48rpx; color: #6B7280; font-weight: 400; }
.result-message { font-size: 32rpx; color: #6B7280; text-align: center; }
.rating-dots { display: flex; gap: 16rpx; }
.rating-dot {
  width: 24rpx; height: 24rpx; border-radius: 50%;
  transition: all 0.3s;
}
.dot-filled { background: #F5A623; }
.dot-empty { background: #E8E5DF; }
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
.result-actions { display: flex; gap: 24rpx; margin-top: 24rpx; width: 100%; max-width: 600rpx; }
.btn-secondary {
  flex: 1; background: #FFFFFF; color: #7C5CBF; border: 3rpx solid #E8E5DF;
  padding: 32rpx; border-radius: 999rpx; font-size: 34rpx; font-weight: 600;
}
.btn-primary {
  flex: 1; background: #7C5CBF; color: #FFFFFF;
  border: none; padding: 32rpx; border-radius: 999rpx; font-size: 34rpx; font-weight: 700;
  box-shadow: 0 8rpx 32rpx rgba(26,26,46,0.08);
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}
</style>
