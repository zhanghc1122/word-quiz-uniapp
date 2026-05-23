<template>
  <view class="page">
    <view class="result-content">
      <text class="result-icon">{{ icon }}</text>
      <text class="result-title">测验完成！</text>
      <view class="result-score">
        <text class="correct-num">{{ data.correct }}</text>
        <text class="total-num"> / 10</text>
      </view>
      <text class="result-message">{{ message }}</text>
      <text class="result-stars">{{ stars }}</text>
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

const data = ref({ correct: 0, wrong: 0, time: '0:00', wrongList: [] })

onLoad((query) => {
  if (query.data) {
    data.value = JSON.parse(decodeURIComponent(query.data))
  }
})

const icon = computed(() => data.value.correct >= 7 ? '🎉' : data.value.correct >= 5 ? '👍' : '💪')
const accuracy = computed(() => Math.round((data.value.correct / 10) * 100))
const stars = computed(() => {
  const c = data.value.correct
  if (c >= 9) return '⭐⭐⭐⭐⭐'
  if (c >= 7) return '⭐⭐⭐⭐'
  if (c >= 5) return '⭐⭐⭐'
  if (c >= 3) return '⭐⭐'
  return '⭐'
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
.page { min-height: 100vh; background: #FFF8E1; position: relative; }
.result-content {
  display: flex; flex-direction: column; align-items: center;
  padding: 80rpx 48rpx; gap: 24rpx;
}
.result-icon { font-size: 128rpx; animation: float 2s ease-in-out infinite; }
.result-title { font-size: 52rpx; font-weight: 800; color: #37474F; }
.result-score { font-size: 96rpx; font-weight: 900; color: #AB47BC; }
.total-num { font-size: 48rpx; color: #78909C; font-weight: 400; }
.result-message { font-size: 32rpx; color: #78909C; text-align: center; }
.result-stars { font-size: 64rpx; letter-spacing: 8rpx; }
.result-details {
  width: 100%; max-width: 600rpx; background: #fff; border-radius: 40rpx;
  padding: 32rpx; box-shadow: 0 8rpx 40rpx rgba(171,71,188,0.1); margin: 16rpx 0;
}
.detail-row {
  display: flex; justify-content: space-between; padding: 16rpx 0;
  font-size: 30rpx; border-bottom: 2rpx solid #FFF8E1;
}
.detail-row:last-child { border-bottom: none; }
.detail-label { color: #78909C; }
.detail-value { font-weight: 700; color: #37474F; }
.wrong-box {
  width: 100%; max-width: 600rpx; background: rgba(239,83,80,0.04);
  border-radius: 40rpx; padding: 32rpx; border: 2rpx solid rgba(239,83,80,0.12);
}
.wrong-title { font-size: 30rpx; color: #EF5350; font-weight: 700; margin-bottom: 20rpx; }
.wrong-item { display: flex; flex-direction: column; gap: 4rpx; padding: 16rpx 0; border-bottom: 2rpx solid rgba(239,83,80,0.08); }
.wrong-item:last-child { border-bottom: none; }
.wrong-word { font-weight: 700; color: #37474F; font-size: 32rpx; }
.wrong-answer { font-size: 26rpx; color: #EF5350; }
.correct-answer { font-size: 26rpx; color: #66BB6A; }
.result-actions { display: flex; gap: 24rpx; margin-top: 24rpx; width: 100%; max-width: 600rpx; }
.btn-secondary {
  flex: 1; background: #fff; color: #AB47BC; border: 4rpx solid #CE93D8;
  padding: 32rpx; border-radius: 100rpx; font-size: 34rpx; font-weight: 600;
}
.btn-primary {
  flex: 1; background: linear-gradient(to right, #AB47BC, #CE93D8); color: #fff;
  border: none; padding: 32rpx; border-radius: 100rpx; font-size: 34rpx; font-weight: 700;
  box-shadow: 0 8rpx 30rpx rgba(171,71,188,0.3);
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}
</style>
