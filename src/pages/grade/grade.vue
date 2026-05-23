<template>
  <view class="page">
    <view class="header">
      <view class="btn-back" @tap="goBack"><text class="back-arrow">‹</text></view>
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
.page { min-height: 100vh; background: #FFF8E1; padding-bottom: 40rpx; }
.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 32rpx 40rpx; position: sticky; top: 0; background: #FFF8E1; z-index: 10;
}
.btn-back {
  width: 80rpx; height: 80rpx; background: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(255,138,101,0.12);
}
.back-arrow { font-size: 48rpx; font-weight: bold; color: #37474F; }
.header-title { font-size: 40rpx; font-weight: 700; color: #37474F; }
.spacer { width: 80rpx; }
.grade-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24rpx; padding: 32rpx 40rpx;
}
.grade-card {
  background: #fff; border-radius: 40rpx; padding: 48rpx 24rpx;
  display: flex; flex-direction: column; align-items: center; gap: 12rpx;
  box-shadow: 0 8rpx 40rpx rgba(255,138,101,0.12);
  border: 4rpx solid transparent; transition: all 0.3s;
}
.grade-card.selected {
  border-color: #FF8A65;
  background: linear-gradient(135deg, rgba(255,138,101,0.08), rgba(255,183,77,0.12));
  transform: scale(1.05);
}
.grade-num {
  font-size: 80rpx; font-weight: 900; color: #FF8A65; line-height: 1;
}
.grade-label { font-size: 30rpx; font-weight: 600; color: #37474F; }
</style>
