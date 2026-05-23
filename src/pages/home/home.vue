<template>
  <view class="page">
    <view class="header">
      <view class="btn-back" @tap="goGrade"><LIcon name="arrow-left" size="48rpx" /></view>
      <text class="header-title">{{ gradeTitle }}</text>
      <view class="spacer"></view>
    </view>

    <view class="user-row">
      <view class="avatar-circle"><text class="avatar-letter">学</text></view>
      <view class="user-info">
        <text class="user-name">小学霸</text>
        <text class="user-level">{{ playerRank.icon }} {{ playerRank.name }} · {{ levelText }}</text>
      </view>
    </view>

    <view class="menu-grid">
      <view class="menu-card" @tap="goLearn">
        <view class="menu-icon-circle" style="background: rgba(124,92,191,0.08);">
          <LIcon name="book-open" color="#7C5CBF" size="36rpx" />
        </view>
        <text class="menu-title">今日学词</text>
        <text class="menu-desc">{{ todayDesc }}</text>
      </view>
      <view class="menu-card" @tap="goQuiz">
        <view class="menu-icon-circle" style="background: rgba(124,92,191,0.08);">
          <LIcon name="pencil" color="#7C5CBF" size="36rpx" />
        </view>
        <text class="menu-title">单词测验</text>
        <text class="menu-desc">检验学习成果</text>
      </view>
      <view class="menu-card" @tap="goBattle">
        <view class="menu-icon-circle" style="background: rgba(232,87,58,0.08);">
          <LIcon name="swords" color="#E8573A" size="36rpx" />
        </view>
        <text class="menu-title">PK对战</text>
        <text class="menu-desc">和AI比拼</text>
      </view>
      <view class="menu-card" @tap="goReview">
        <view class="menu-icon-circle" style="background: rgba(43,158,143,0.08);">
          <LIcon name="rotate-ccw" color="#2B9E8F" size="36rpx" />
        </view>
        <text class="menu-title">错题复习</text>
        <text class="menu-desc">{{ wrongDesc }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { GRADE_NAMES, LEVELS, getTodayKey } from '@/utils/helpers'
import { loadStats, getPlayerRank } from '@/utils/storage'
import { onShow } from '@dcloudio/uni-app'
import LIcon from '@/components/LIcon.vue'

const grade = ref(uni.getStorageSync('currentGrade') || 3)
const gradeTitle = computed(() => GRADE_NAMES[grade.value])

const gs = ref({ learned: 0, mastered: 0, wins: 0 })
const todayLearned = ref([])
const wrongCount = ref(0)
const playerRank = ref(getPlayerRank())

const levelText = computed(() => {
  const lv = Math.min(Math.floor(gs.value.mastered / 30), LEVELS.length - 1)
  return LEVELS[lv]
})

const todayDesc = computed(() => {
  const remaining = 10 - todayLearned.value.length
  return remaining > 0 ? `还有${remaining}个词` : '已学完!'
})

const wrongDesc = computed(() =>
  wrongCount.value > 0 ? `${wrongCount.value}道错题` : '暂无错题'
)

function refreshData() {
  grade.value = uni.getStorageSync('currentGrade') || 3
  const stats = loadStats()
  gs.value = stats[`g${grade.value}`] || { learned: 0, mastered: 0, wins: 0 }
  todayLearned.value = stats[getTodayKey(grade.value)] || []
  wrongCount.value = (stats[`wrong_g${grade.value}`] || []).length
  playerRank.value = getPlayerRank()
}

function goGrade() {
  uni.redirectTo({ url: '/pages/grade/grade' })
}
function goLearn() {
  uni.navigateTo({ url: '/pages/learn/learn' })
}
function goQuiz() {
  uni.navigateTo({ url: '/pages/quiz/quiz' })
}
function goBattle() {
  uni.navigateTo({ url: '/pages/battle-match/battle-match' })
}
function goReview() {
  uni.navigateTo({ url: '/pages/review/review' })
}

onShow(() => { refreshData() })
</script>

<style scoped>
.page { min-height: 100vh; background: #F7F5F0; padding-bottom: 40rpx; }
.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 32rpx 40rpx;
}
.btn-back {
  width: 80rpx; height: 80rpx; background: #FFFFFF; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(26,26,46,0.04);
}
.back-arrow { display: none; }
.header-title { font-size: 40rpx; font-weight: 700; color: #1A1A2E; }
.spacer { width: 80rpx; }

.user-row {
  display: flex; align-items: center; gap: 24rpx; padding: 24rpx 40rpx 32rpx;
}
.avatar-circle {
  width: 96rpx; height: 96rpx; border-radius: 50%;
  background: #E8573A;
  display: flex; align-items: center; justify-content: center;
}
.avatar-letter { font-size: 40rpx; font-weight: 700; color: #FFFFFF; }
.user-info { display: flex; flex-direction: column; gap: 4rpx; }
.user-name { font-size: 34rpx; font-weight: 700; color: #1A1A2E; }
.user-level { font-size: 26rpx; color: #6B7280; font-weight: 600; }

.menu-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 24rpx; padding: 8rpx 40rpx;
}
.menu-card {
  background: #FFFFFF; border-radius: 28rpx; padding: 40rpx 28rpx;
  display: flex; flex-direction: column; align-items: center; gap: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.06);
  transition: transform 0.2s;
}
.menu-card:active { transform: scale(0.96); }
.menu-icon-circle {
  width: 80rpx; height: 80rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.menu-title { font-size: 32rpx; font-weight: 700; color: #1A1A2E; }
.menu-desc { font-size: 26rpx; color: #6B7280; }
</style>
