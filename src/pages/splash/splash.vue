<template>
  <view class="splash">
    <view class="splash-content">
      <view class="splash-icon">
        <text class="icon-letter">W</text>
      </view>
      <text class="splash-title">单词大闯关</text>
      <text class="splash-subtitle">每天10个词 · 轻松学英语</text>
      <button class="btn-start" @tap="goGrade">开始学习</button>
      <text class="splash-hint">适用：小学 1-6 年级</text>
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
  background: #F7F5F0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28rpx;
  padding: 60rpx;
}
.splash-icon {
  width: 240rpx;
  height: 240rpx;
  background: #E8573A;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
}
.icon-letter {
  font-size: 120rpx;
  font-weight: 900;
  color: #FFFFFF;
}
.splash-title {
  font-size: 72rpx;
  color: #1A1A2E;
  font-weight: 900;
  letter-spacing: 4rpx;
}
.splash-subtitle { color: #6B7280; font-size: 34rpx; font-weight: 500; }
.splash-hint { color: #9CA3AF; font-size: 28rpx; margin-top: 48rpx; }
.btn-start {
  background: #E8573A;
  color: #FFFFFF;
  border: none;
  padding: 32rpx 108rpx;
  border-radius: 999rpx;
  font-size: 40rpx;
  font-weight: 700;
  margin-top: 20rpx;
  box-shadow: 0 8rpx 32rpx rgba(26,26,46,0.08);
}
.btn-start:active {
  background: #D04830;
  transform: scale(0.96);
  box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.08);
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}
</style>
