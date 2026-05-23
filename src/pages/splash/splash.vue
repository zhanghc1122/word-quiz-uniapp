<template>
  <view class="splash">
    <view class="splash-content">
      <view class="splash-icon">
        <text class="emoji-big">📚</text>
      </view>
      <text class="splash-title">单词大闯关</text>
      <text class="splash-subtitle">每天10个词 · 轻松学英语</text>
      <button class="btn-primary btn-glow" @tap="goGrade">开始学习</button>
      <text class="splash-hint">适用：小学 1-6 年级</text>
    </view>
    <view class="wave-decoration">
      <view class="wave w1"></view>
      <view class="wave w2"></view>
    </view>
  </view>
</template>

<script setup>
function goGrade() {
  uni.redirectTo({ url: '/pages/grade/grade' })
}
</script>

<style scoped>
.splash {
  min-height: 100vh;
  background: linear-gradient(160deg, #FF8A65 0%, #FFB74D 40%, #FFD54F 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28rpx;
  padding: 60rpx;
  z-index: 1;
}
.splash-icon {
  width: 280rpx;
  height: 280rpx;
  background: rgba(255,255,255,0.3);
  border-radius: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 16rpx 48rpx rgba(255,255,255,0.2);
}
.emoji-big { font-size: 140rpx; }
.splash-title {
  font-size: 72rpx;
  color: #fff;
  font-weight: 900;
  text-shadow: 0 4rpx 8rpx rgba(0,0,0,0.1);
  letter-spacing: 4rpx;
}
.splash-subtitle { color: rgba(255,255,255,0.9); font-size: 34rpx; font-weight: 500; }
.splash-hint { color: rgba(255,255,255,0.6); font-size: 28rpx; margin-top: 48rpx; }
.btn-primary {
  background: linear-gradient(to right, #FF7043, #FF8A65);
  color: #fff;
  border: none;
  padding: 32rpx 108rpx;
  border-radius: 100rpx;
  font-size: 40rpx;
  font-weight: 700;
  box-shadow: 0 12rpx 40rpx rgba(255,112,67,0.4);
  animation: glow 2s ease-in-out infinite;
  margin-top: 20rpx;
}
.wave-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200rpx;
}
.wave {
  position: absolute;
  bottom: 0;
  left: -10%;
  width: 120%;
  height: 200rpx;
  border-radius: 50% 50% 0 0;
}
.w1 { background: rgba(255,255,255,0.15); }
.w2 { background: rgba(255,255,255,0.1); bottom: -40rpx; height: 160rpx; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-24rpx); }
}
@keyframes glow {
  0%, 100% { box-shadow: 0 12rpx 40rpx rgba(255,112,67,0.4); }
  50% { box-shadow: 0 16rpx 64rpx rgba(255,112,67,0.6); }
}
</style>
