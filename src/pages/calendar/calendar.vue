<template>
  <view class="calendar-page">
    <!-- 顶部卡片：年级选择 + 打卡状态 -->
    <view class="status-card">
      <view class="grade-tabs">
        <view
          v-for="g in [1,2,3,4,5,6]" :key="g"
          :class="['grade-tab', currentGrade === g ? 'active' : '']"
          @tap="switchGrade(g)"
        >{{ g }}年级</view>
      </view>

      <view class="streak-info">
        <view v-if="checkinData.streak === 0 && checkinData.maxStreak === 0" class="empty-tip">
          <text class="empty-tip-text">暂无打卡记录</text>
        </view>
        <template v-else>
          <view class="streak-item">
            <text class="streak-num">{{ checkinData.streak || 0 }}</text>
            <text class="streak-label">连续打卡</text>
          </view>
          <view class="streak-divider"></view>
          <view class="streak-item">
            <text class="streak-num">{{ checkinData.maxStreak || 0 }}</text>
            <text class="streak-label">最高记录</text>
          </view>
        </template>
      </view>

      <view v-if="isTodayDone" class="today-done">
        <text class="done-text">今日已打卡</text>
      </view>
      <view v-else class="today-undo" @tap="goLearn">
        <text class="undo-text">去打卡 →</text>
      </view>
    </view>

    <!-- 月历 -->
    <view class="calendar-card">
      <view class="calendar-header">
        <text class="month-label">{{ year }}年{{ month + 1 }}月</text>
        <view class="month-nav">
          <text class="nav-btn" @tap="prevMonth">‹</text>
          <text class="nav-btn" @tap="nextMonth">›</text>
        </view>
      </view>

      <view class="weekday-row">
        <text v-for="d in ['日','一','二','三','四','五','六']" :key="d" class="weekday">{{ d }}</text>
      </view>

      <view class="days-grid">
        <view
          v-for="(day, idx) in calendarDays" :key="idx"
          :class="['day-cell', !day.isCurrentMonth ? 'other-month' : '', day.isToday ? 'today' : '', day.isDone ? 'done' : '', day.isFuture ? 'future' : '']"
          @tap="onDayTap(day)"
        >
          <text class="day-num">{{ day.date }}</text>
          <text v-if="day.isDone" class="done-check">✓</text>
        </view>
      </view>
    </view>

    <!-- 图例 -->
    <view class="legend">
      <view class="legend-item"><view class="legend-dot today-dot"></view><text>今天</text></view>
      <view class="legend-item"><view class="legend-dot done-dot"></view><text>已打卡</text></view>
      <view class="legend-item"><view class="legend-dot future-dot"></view><text>未打卡</text></view>
    </view>

    <TabBar />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCheckinData, isCheckinDoneToday } from '@/utils/storage'
import { getEdition } from '@/utils/edition'
import TabBar from '@/components/TabBar.vue'

const currentGrade = ref(uni.getStorageSync('currentGrade') || 1)
const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth())
const checkinData = ref({ streak: 0, maxStreak: 0 })
const isTodayDone = ref(false)
const checkinDates = ref(new Set())

function getEditionSync() {
  try { return uni.getStorageSync('currentEdition') || 'pep' } catch { return 'pep' }
}

function switchGrade(g) {
  currentGrade.value = g
  loadCheckinData()
}

function getDatesWithCheckin(year, month) {
  const stats = JSON.parse(uni.getStorageSync('wordQuizStats') || '{}')
  const ed = getEditionSync()
  const dates = new Set()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}_g${currentGrade.value}_${ed}`
    if (stats[`checkin_done_${key}`]) dates.add(d)
  }
  return dates
}

function loadCheckinData() {
  const ed = getEditionSync()
  checkinData.value = getCheckinData(currentGrade.value, ed)
  isTodayDone.value = isCheckinDoneToday(currentGrade.value, ed)
  checkinDates.value = getDatesWithCheckin(year.value, month.value)
}

const calendarDays = computed(() => {
  const firstDay = new Date(year.value, month.value, 1).getDay()
  const daysInMonth = new Date(year.value, month.value + 1, 0).getDate()
  const daysInPrevMonth = new Date(year.value, month.value, 0).getDate()
  const days = []

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ date: daysInPrevMonth - i, isCurrentMonth: false, isFuture: false, isDone: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = year.value === today.getFullYear() && month.value === today.getMonth() && d === today.getDate()
    const isFuture = new Date(year.value, month.value, d) > today
    days.push({
      date: d,
      isCurrentMonth: true,
      isToday,
      isFuture,
      isDone: checkinDates.value.has(d)
    })
  }
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    days.push({ date: d, isCurrentMonth: false, isFuture: false, isDone: false })
  }
  return days
})

function prevMonth() {
  if (month.value === 0) { month.value = 11; year.value-- }
  else month.value--
  loadCheckinData()
}

function nextMonth() {
  if (month.value === 11) { month.value = 0; year.value++ }
  else month.value++
  loadCheckinData()
}

function onDayTap(day) {
  if (!day.isCurrentMonth || day.isFuture || day.isDone) return
  goLearn()
}

function goLearn() {
  uni.navigateTo({ url: '/pages/learn/learn' })
}

onMounted(() => {
  loadCheckinData()
})
</script>

<style scoped>
.calendar-page { min-height: 100vh; background: #F7F5F0; padding: 24rpx; padding-bottom: 160rpx; }
.status-card { background: #FFFFFF; border-radius: 24rpx; padding: 32rpx; margin-bottom: 24rpx; box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.06); }
.grade-tabs { display: flex; gap: 8rpx; margin-bottom: 32rpx; }
.grade-tab { flex: 1; text-align: center; padding: 16rpx 0; border-radius: 12rpx; font-size: 24rpx; color: #9CA3AF; background: #F7F5F0; font-weight: 600; }
.grade-tab.active { background: #E8573A; color: #FFFFFF; }
.streak-info { display: flex; align-items: center; justify-content: center; gap: 48rpx; margin-bottom: 24rpx; }
.streak-item { display: flex; flex-direction: column; align-items: center; }
.streak-num { font-size: 56rpx; font-weight: 800; color: #E8573A; }
.streak-label { font-size: 24rpx; color: #9CA3AF; margin-top: 4rpx; }
.streak-divider { width: 2rpx; height: 80rpx; background: #E8E8E8; }
.empty-tip { display: flex; align-items: center; justify-content: center; padding: 16rpx 0; }
.empty-tip-text { font-size: 26rpx; color: #9CA3AF; }
.today-done { text-align: center; padding: 24rpx; background: linear-gradient(135deg, #4CAF50, #45a049); border-radius: 16rpx; }
.done-text { color: #FFFFFF; font-size: 28rpx; font-weight: 600; }
.today-undo { text-align: center; padding: 24rpx; background: linear-gradient(135deg, #E8573A, #ff6b4a); border-radius: 16rpx; cursor: pointer; }
.undo-text { color: #FFFFFF; font-size: 28rpx; font-weight: 600; }
.calendar-card { background: #FFFFFF; border-radius: 24rpx; padding: 32rpx; box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.06); }
.calendar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24rpx; }
.month-label { font-size: 32rpx; font-weight: 700; color: #1a1a2e; }
.month-nav { display: flex; gap: 16rpx; }
.nav-btn { font-size: 40rpx; color: #E8573A; padding: 8rpx 16rpx; }
.weekday-row { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 16rpx; }
.weekday { text-align: center; font-size: 24rpx; color: #9CA3AF; font-weight: 600; padding: 8rpx 0; }
.days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8rpx; }
.day-cell { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 50%; position: relative; }
.day-num { font-size: 28rpx; color: #1a1a2e; }
.other-month .day-num { color: #D1D1D1; }
.today { background: #E8573A; border-radius: 50%; }
.today .day-num { color: #FFFFFF; }
.done { background: #E8F5E9; border-radius: 50%; }
.done .day-num { color: #4CAF50; }
.done-check { position: absolute; bottom: -4rpx; font-size: 18rpx; color: #4CAF50; }
.future .day-num { color: #D1D1D1; }
.legend { display: flex; justify-content: center; gap: 32rpx; margin-top: 24rpx; }
.legend-item { display: flex; align-items: center; gap: 8rpx; font-size: 24rpx; color: #9CA3AF; }
.legend-dot { width: 24rpx; height: 24rpx; border-radius: 50%; }
.today-dot { background: #E8573A; }
.done-dot { background: #E8F5E9; border: 2rpx solid #4CAF50; }
.future-dot { background: #F0F0F0; }
</style>