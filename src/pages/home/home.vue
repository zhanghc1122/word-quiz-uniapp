<template>
  <view class="page">
    <view class="greeting">
      <view class="greeting-left">
        <text class="greeting-title">每日打卡</text>
        <text class="greeting-sub">坚持学习，积少成多</text>
      </view>
      <view class="greeting-right">
        <view class="mute-btn" @tap="toggleMute">
          <LIcon :name="muted ? 'volume-x' : 'volume-2'" :size="40" :color="muted ? '#9CA3AF' : '#A855C7'" />
        </view>
        <view class="level-badge" @tap="goMy">
          <LIcon :name="xpLevel.icon" :size="36" :color="xpLevel.color || '#A855C7'" />
          <text class="level-text">Lv.{{ xpLevel.level }} {{ xpLevel.name }}</text>
        </view>
      </view>
    </view>

    <view :class="['checkin-card', checkinDone ? 'checkin-card-done' : '']" @tap="goCheckin">
      <view class="checkin-left">
        <LIcon :name="checkinDone ? 'check-circle' : 'calendar-check'" :size="48" color="#FFFFFF" />
        <view class="checkin-info">
          <text class="checkin-title">{{ checkinDone ? '已打卡' : '今日打卡' }}</text>
          <text class="checkin-sub">{{ checkinDone ? '太棒了，明天继续保持！' : '全部答对即可打卡' }}</text>
        </view>
      </view>
      <view v-if="checkinStreak > 0" class="streak-badge">
        <LIcon name="flame" :size="28" color="#FFFFFF" /><text class="streak-text">{{ checkinStreak }}天</text>
      </view>
      <view v-if="!checkinDone" class="checkin-go">
        <LIcon name="chevron-right" :size="36" color="rgba(255,255,255,0.7)" />
      </view>
    </view>

    <view class="menu-grid">
      <view class="menu-card" @tap="goLearn">
        <view class="menu-icon-circle" style="background: rgba(168,85,199,0.08);">
          <LIcon name="book-open" color="#A855C7" size="36rpx" />
        </view>
        <text class="menu-title">今日学词</text>
        <text class="menu-desc">{{ todayDesc }}</text>
      </view>
      <view class="menu-card" @tap="goQuiz">
        <view class="menu-icon-circle" style="background: rgba(168,85,199,0.08);">
          <LIcon name="pencil" color="#A855C7" size="36rpx" />
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

    <TabBar />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getTodayKey, getLevelFromXP } from '@/utils/helpers'
import { loadStats, migrateXP, getCheckinData, isCheckinDoneToday } from '@/utils/storage'
import { getEdition } from '@/utils/edition'
import { isMuted, setMuted } from '@/utils/sound'
import { onShow } from '@dcloudio/uni-app'
import LIcon from '@/components/LIcon.vue'
import TabBar from '@/components/TabBar.vue'

const grade = ref(uni.getStorageSync('currentGrade') || 3)
const edition = ref(getEdition())
const muted = ref(isMuted())

const totalXP = ref(0)
const todayLearned = ref([])
const wrongCount = ref(0)
const checkinDone = ref(false)
const checkinStreak = ref(0)

const todayDesc = computed(() => {
  const remaining = 10 - todayLearned.value.length
  return remaining > 0 ? `还有${remaining}个词` : '已学完!'
})

const wrongDesc = computed(() =>
  wrongCount.value > 0 ? `${wrongCount.value}道错题` : '暂无错题'
)
const xpLevel = computed(() => getLevelFromXP(totalXP.value))

function toggleMute() {
  const newMuted = !muted.value
  setMuted(newMuted)
  muted.value = newMuted
}

function refreshData() {
  grade.value = uni.getStorageSync('currentGrade') || 3
  edition.value = uni.getStorageSync('currentEdition') || 'pep'
  muted.value = isMuted()
  const stats = loadStats()
  migrateXP()
  totalXP.value = stats.totalXP || 0
  todayLearned.value = stats[getTodayKey(grade.value, edition.value)] || []
  wrongCount.value = (stats[`wrong_g${grade.value}_${edition.value}`] || []).length
  checkinDone.value = isCheckinDoneToday(grade.value, edition.value)
  const checkinData = getCheckinData(grade.value, edition.value)
  checkinStreak.value = checkinData.streak
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
function goMy() {
  uni.switchTab({ url: '/pages/my/my' })
}
function goCheckin() {
  if (!checkinDone.value) {
    uni.navigateTo({ url: '/pages/quiz/quiz?mode=checkin' })
  }
}

onShow(() => { refreshData() })
</script>

<style scoped>
.page { min-height: 100vh; background: #F7F5F0; padding: 32rpx 40rpx 180rpx; }
.greeting { margin-bottom: 24rpx; display: flex; align-items: center; justify-content: space-between; }
.greeting-left { display: flex; flex-direction: column; }
.greeting-right { display: flex; align-items: center; gap: 12rpx; }
.greeting-title { font-size: 56rpx; font-weight: 900; color: #1A1A2E; display: block; }
.greeting-sub { font-size: 28rpx; color: #9CA3AF; margin-top: 4rpx; }
.mute-btn {
  width: 80rpx; height: 80rpx; background: #FFFFFF; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.08);
  transition: transform 0.2s;
}
.mute-btn:active { transform: scale(0.9); }
.level-badge {
  background: #FFFFFF; border-radius: 20rpx; padding: 16rpx 24rpx;
  display: flex; align-items: center; gap: 8rpx;
  box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.08);
  transition: transform 0.2s;
}
.level-badge:active { transform: scale(0.95); }
.level-text { font-size: 28rpx; font-weight: 800; color: #1A1A2E; }

.checkin-card {
  margin: 0 0 32rpx; padding: 36rpx; border-radius: 28rpx;
  background: linear-gradient(135deg, #E8573A, #F08060);
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 8rpx 32rpx rgba(232,87,58,0.25);
  transition: transform 0.2s;
}
.checkin-card:active { transform: scale(0.98); }
.checkin-card-done {
  background: linear-gradient(135deg, #2B9E8F, #2B9E8F);
  box-shadow: 0 8rpx 32rpx rgba(43,158,143,0.25);
}
.checkin-left { display: flex; align-items: center; gap: 20rpx; }
.checkin-info { display: flex; flex-direction: column; gap: 4rpx; }
.checkin-title { font-size: 36rpx; font-weight: 700; color: #FFFFFF; }
.checkin-sub { font-size: 26rpx; color: rgba(255,255,255,0.8); }
.streak-badge {
  background: rgba(255,255,255,0.2); padding: 10rpx 20rpx; border-radius: 999rpx;
}
.streak-text { font-size: 26rpx; font-weight: 700; color: #FFFFFF; }
.checkin-go {
  width: 72rpx; height: 72rpx; border-radius: 50%;
  background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center;
}

.menu-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 24rpx; margin-bottom: 32rpx;
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