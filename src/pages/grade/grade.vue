<template>
  <view class="page">
    <view class="header">
      <view class="float-back" @tap="goBack"><LIcon name="arrow-left" size="48rpx" /></view>
      <text class="header-title">选择年级</text>
      <view class="spacer"></view>
    </view>
    <view class="grade-grid">
      <view
        v-for="g in 6" :key="g"
        :class="['grade-card', selectedGrade === g ? 'selected' : '']"
        @tap="pickGrade(g)"
      >
        <text class="grade-num">{{ g }}</text>
        <text class="grade-label">{{ gradeNames[g] }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { GRADE_NAMES } from '@/utils/helpers'
import LIcon from '@/components/LIcon.vue'

const gradeNames = GRADE_NAMES
const selectedGrade = ref(null)

function goBack() {
  uni.redirectTo({ url: '/pages/splash/splash' })
}

function pickGrade(g) {
  selectedGrade.value = g
  uni.setStorageSync('currentGrade', g)
  setTimeout(() => {
    uni.redirectTo({ url: '/pages/home/home' })
  }, 300)
}
</script>

<style scoped>
.page { min-height: 100vh; background: #F7F5F0; padding-bottom: 40rpx; }
.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 32rpx 40rpx; position: sticky; top: 0; background: #F7F5F0; z-index: 10;
}
.btn-back {
  width: 80rpx; height: 80rpx; background: #FFFFFF; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(26,26,46,0.04);
}
.back-arrow { display: none; }
.header-title { font-size: 40rpx; font-weight: 700; color: #1A1A2E; }
.spacer { width: 80rpx; }
.grade-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24rpx; padding: 32rpx 40rpx;
}
.grade-card {
  background: #FFFFFF; border-radius: 28rpx; padding: 48rpx 24rpx;
  display: flex; flex-direction: column; align-items: center; gap: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.06);
  border: 3rpx solid transparent; transition: all 0.3s;
}
.grade-card.selected {
  border-color: #E8573A;
  transform: scale(1.05);
}
.grade-num {
  font-size: 80rpx; font-weight: 900; color: #E8573A; line-height: 1;
}
.grade-label { font-size: 30rpx; font-weight: 600; color: #1A1A2E; }
</style>
