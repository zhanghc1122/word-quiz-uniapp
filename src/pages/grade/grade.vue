<template>
  <view class="page">
    <view class="header">
      <view class="float-back" @tap="goBack"><LIcon name="arrow-left" size="48rpx" /></view>
      <text class="header-title">选择年级</text>
      <view class="spacer"></view>
    </view>
    <view class="edition-selector">
      <view
        v-for="ed in editions"
        :key="ed.value"
        :class="['edition-pill', selectedEdition === ed.value ? 'selected' : '']"
        @tap.stop="selectedEdition = ed.value"
      >
        <text class="edition-text">{{ ed.label }}</text>
      </view>
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
import { setEdition } from '@/utils/edition'
import LIcon from '@/components/LIcon.vue'

const gradeNames = GRADE_NAMES
const selectedGrade = ref(null)
const selectedEdition = ref(uni.getStorageSync('currentEdition') || 'pep')
const editions = [
  { label: '人教版', value: 'pep' },
  { label: '沪教版', value: 'shanghai' },
]

function goBack() {
  uni.redirectTo({ url: '/pages/splash/splash' })
}

function pickGrade(g) {
  selectedGrade.value = g
  uni.setStorageSync('currentGrade', g)
  setEdition(selectedEdition.value)
  setTimeout(() => {
    uni.switchTab({ url: '/pages/home/home' })
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
.edition-selector {
  display: flex; gap: 24rpx; padding: 0 40rpx 32rpx;
}
.edition-pill {
  flex: 1; padding: 20rpx; border-radius: 20rpx; text-align: center;
  background: #FFFFFF; border: 3rpx solid transparent;
  box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.06);
  transition: all 0.3s;
}
.edition-pill.selected {
  border-color: #A855C7;
  background: rgba(168,85,199,0.08);
}
.edition-text { font-size: 30rpx; font-weight: 600; color: #1A1A2E; }
.grade-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24rpx; padding: 0 40rpx;
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
.grade-card:active {
  transform: scale(0.96);
  background: rgba(232,87,58,0.04);
}
.grade-num {
  font-size: 80rpx; font-weight: 900; color: #E8573A; line-height: 1;
}
.grade-label { font-size: 30rpx; font-weight: 600; color: #1A1A2E; }
</style>
