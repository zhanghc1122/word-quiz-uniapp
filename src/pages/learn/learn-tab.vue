<template>
  <view class="page">
    <view class="header-row">
      <text class="page-title">学习</text>
    </view>
    <view class="tips-card">
      <LIcon name="lightbulb" :size="36" color="#F5A623" />
      <text class="tips-text">每天学习10个新单词，测验答对全部即可打卡！</text>
    </view>

    <view class="action-cards">
      <view class="action-card" @tap="goLearn">
        <view class="action-icon" style="background: rgba(168,85,199,0.1);">
          <LIcon name="book-open" :size="48" color="#A855C7" />
        </view>
        <view class="action-info">
          <text class="action-title">今日学词</text>
          <text class="action-desc">{{ todayDesc }}</text>
        </view>
        <LIcon name="chevron-right" :size="36" color="#9CA3AF" />
      </view>

      <view class="action-card" @tap="goQuiz">
        <view class="action-icon" style="background: rgba(168,85,199,0.1);">
          <LIcon name="pencil" :size="48" color="#A855C7" />
        </view>
        <view class="action-info">
          <text class="action-title">单词测验</text>
          <text class="action-desc">检验学习成果</text>
        </view>
        <LIcon name="chevron-right" :size="36" color="#9CA3AF" />
      </view>

      <view class="action-card" @tap="goBattle">
        <view class="action-icon" style="background: rgba(232,87,58,0.1);">
          <LIcon name="swords" :size="48" color="#E8573A" />
        </view>
        <view class="action-info">
          <text class="action-title">PK对战</text>
          <text class="action-desc">和AI一决高下</text>
        </view>
        <LIcon name="chevron-right" :size="36" color="#9CA3AF" />
      </view>

      <view class="action-card" @tap="goReview">
        <view class="action-icon" style="background: rgba(43,158,143,0.1);">
          <LIcon name="rotate-ccw" :size="48" color="#2B9E8F" />
        </view>
        <view class="action-info">
          <text class="action-title">错题复习</text>
          <text class="action-desc">{{ wrongDesc }}</text>
        </view>
        <LIcon name="chevron-right" :size="36" color="#9CA3AF" />
      </view>
    </view>

    <TabBar />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getTodayKey } from '@/utils/helpers'
import { loadStats, getWrongKey } from '@/utils/storage'
import { getEdition } from '@/utils/edition'
import LIcon from '@/components/LIcon.vue'
import TabBar from '@/components/TabBar.vue'

const grade = ref(uni.getStorageSync('currentGrade') || 3)
const edition = ref(getEdition())
const stats = loadStats()
const todayLearned = ref(stats[getTodayKey(grade.value, edition.value)] || [])
const wrongCount = ref((stats[getWrongKey(grade.value, edition.value)] || []).length)

const todayDesc = computed(() => {
  const remaining = 10 - todayLearned.value.length
  return remaining > 0 ? `还有 ${remaining} 个词未学` : '今日已完成！'
})

const wrongDesc = computed(() =>
  wrongCount.value > 0 ? `${wrongCount.value} 道错题待复习` : '暂无错题'
)

function goLearn() { uni.navigateTo({ url: '/pages/learn/learn' }) }
function goQuiz() { uni.navigateTo({ url: '/pages/quiz/quiz' }) }
function goBattle() { uni.navigateTo({ url: '/pages/battle-match/battle-match' }) }
function goReview() { uni.navigateTo({ url: '/pages/review/review' }) }
</script>

<style scoped>
.page { min-height: 100vh; background: #F7F5F0; padding-bottom: 180rpx; }
.header-row { padding: 32rpx 40rpx 16rpx; }
.page-title { font-size: 48rpx; font-weight: 900; color: #1A1A2E; }

.tips-card {
  margin: 0 40rpx 24rpx; padding: 24rpx 28rpx;
  background: rgba(245,166,35,0.08); border-radius: 20rpx;
  display: flex; align-items: center; gap: 16rpx;
  border: 2rpx solid rgba(245,166,35,0.15);
}
.tips-text { font-size: 28rpx; color: #6B7280; font-weight: 500; flex: 1; }

.action-cards { display: flex; flex-direction: column; gap: 20rpx; padding: 0 40rpx; }
.action-card {
  background: #FFFFFF; border-radius: 24rpx; padding: 32rpx;
  display: flex; align-items: center; gap: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.06);
  transition: transform 0.2s;
}
.action-card:active { transform: scale(0.98); }
.action-icon {
  width: 88rpx; height: 88rpx; border-radius: 24rpx;
  display: flex; align-items: center; justify-content: center;
}
.action-info { flex: 1; display: flex; flex-direction: column; gap: 6rpx; }
.action-title { font-size: 34rpx; font-weight: 700; color: #1A1A2E; }
.action-desc { font-size: 26rpx; color: #9CA3AF; }
</style>