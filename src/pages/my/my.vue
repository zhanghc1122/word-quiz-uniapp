<template>
  <view class="page">
    <view class="header-row">
      <text class="page-title">我的</text>
    </view>

    <!-- Edition + Grade Selector -->
    <view class="selector-card">
      <text class="section-label">选择教材版本和年级</text>
      <view class="edition-row">
        <view
          v-for="(label, id) in EDITION_NAMES" :key="id"
          :class="['edition-pill', selectedEdition === id ? 'selected' : '']"
          @tap="pickEdition(id)"
        >
          <LIcon name="book" :size="32" :color="selectedEdition === id ? '#FFFFFF' : '#A855C7'" />
          <text class="edition-text">{{ label }}</text>
        </view>
      </view>
      <view class="grade-grid">
        <view
          v-for="g in 6" :key="g"
          :class="['grade-chip', selectedGrade === g ? 'selected' : '']"
          @tap="pickGrade(g)"
        >
          <text class="grade-chip-text">{{ GRADE_NAMES[g] }}</text>
        </view>
      </view>
    </view>

    <!-- Stats Card -->
    <view class="stats-card">
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-num">{{ gs.learned }}</text>
          <text class="stat-label">已学测验</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-num">{{ gs.mastered }}</text>
          <text class="stat-label">答对词数</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-num">{{ gs.wins }}</text>
          <text class="stat-label">PK胜场</text>
        </view>
      </view>
    </view>

    <!-- Checkin Card -->
    <view :class="['checkin-card', checkinDone ? 'done' : '']" @tap="goCheckin">
      <view class="checkin-left">
        <LIcon name="calendar-check" :size="48" :color="checkinDone ? '#FFFFFF' : '#A855C7'" />
        <view class="checkin-info">
          <text class="checkin-title">{{ checkinDone ? '已打卡' : '今日打卡' }}</text>
          <text class="checkin-sub">{{ checkinDone ? '明天继续保持！' : (checkinStreak > 0 ? `连续 ${checkinStreak} 天` : '快去打卡吧') }}</text>
        </view>
      </view>
      <LIcon name="chevron-right" :size="36" color="rgba(255,255,255,0.6)" />
    </view>

    <!-- Profile Card -->
    <view class="profile-card" @tap="openEditPopup">
      <view class="profile-avatar">
        <LIcon :name="userProfile.avatar" :size="44" :color="'#A855C7'" />
      </view>
      <view class="profile-info">
        <text class="profile-name">{{ userProfile.name }}</text>
        <text class="profile-sub">点击编辑资料</text>
      </view>
      <LIcon name="edit" :size="32" color="#9CA3AF" class="edit-icon" />
    </view>

    <!-- XP Card -->
    <view class="xp-card" @tap="openLevelList">
      <view class="xp-top">
        <LIcon :name="xpLevel.icon" :size="48" :color="xpLevel.color || '#A855C7'" />
        <view class="xp-info">
          <text class="xp-name">Lv.{{ xpLevel.level }} {{ xpLevel.name }}</text>
          <text class="xp-total">{{ totalXP }} XP</text>
        </view>
        <LIcon name="chevron-right" :size="32" color="#9CA3AF" />
      </view>
      <view class="xp-bar">
        <view class="xp-fill" :style="{ width: xpProgress.percent + '%', background: xpLevel.color }"></view>
      </view>
      <view class="xp-next-row" v-if="nextLevel">
        <text class="xp-next-label">距</text>
        <LIcon :name="nextLevel.icon" :size="24" :color="nextLevel.color || '#A855C7'" />
        <text class="xp-next-label">{{ nextLevel.name }} 还差</text>
        <text class="xp-next-num">{{ nextLevel.minXP - totalXP }}</text>
        <text class="xp-next-label">XP</text>
      </view>
      <text v-else class="xp-next-label">已达最高等级！</text>
    </view>

    <!-- Edit Profile Popup -->
    <view v-if="showEditPopup" class="popup-mask" @tap="showEditPopup = false">
      <view class="popup-card" @tap.stop>
        <text class="popup-title">编辑资料</text>
        <text class="popup-section">头像</text>
        <view class="avatar-grid">
          <view
            v-for="opt in avatarOptions" :key="opt.icon"
            :class="['avatar-option', editAvatar === opt.icon ? 'selected' : '']"
            @tap="editAvatar = opt.icon"
          >
            <LIcon :name="opt.icon" :size="40" :color="opt.color" />
          </view>
        </view>
        <text class="popup-section">昵称</text>
        <input class="name-input" v-model="editName" placeholder="请输入昵称" maxlength="10" />
        <view class="popup-btns">
          <view class="popup-btn cancel" @tap="showEditPopup = false"><text>取消</text></view>
          <view class="popup-btn confirm" @tap="saveProfile"><text>保存</text></view>
        </view>
      </view>
    </view>

    <!-- Level List Popup -->
    <view v-if="showLevelList" class="popup-mask" @tap="showLevelList = false">
      <view class="popup-card level-popup" @tap.stop>
        <text class="popup-title">等级一览</text>
        <scroll-view scroll-y class="level-scroll">
          <view
            v-for="lv in XP_LEVELS" :key="lv.level"
            :class="['level-row', lv.level === xpLevel.level ? 'current' : '']"
          >
            <view class="level-left">
              <LIcon :name="lv.icon" :size="36" :color="lv.color || '#A855C7'" />
              <view class="level-info">
                <text class="level-name">Lv.{{ lv.level }} {{ lv.name }}</text>
                <text class="level-xp">{{ lv.minXP }} XP</text>
              </view>
            </view>
            <text v-if="lv.level === xpLevel.level" class="level-cur-tag">当前</text>
          </view>
        </scroll-view>
        <view class="popup-btns">
          <view class="popup-btn confirm full" @tap="showLevelList = false"><text>关闭</text></view>
        </view>
      </view>
    </view>

    <TabBar />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { GRADE_NAMES, EDITION_NAMES, XP_LEVELS, getLevelFromXP, getNextLevel, getXPProgress } from '@/utils/helpers'
import { loadStats, saveCheckin, getCheckinData, isCheckinDoneToday, getGradeKey, getWrongKey, migrateXP, getUserProfile, saveUserProfile } from '@/utils/storage'
import { getEdition } from '@/utils/edition'
import { onShow } from '@dcloudio/uni-app'
import LIcon from '@/components/LIcon.vue'
import TabBar from '@/components/TabBar.vue'

const selectedGrade = ref(uni.getStorageSync('currentGrade') || 3)
const selectedEdition = ref(getEdition())
const gs = ref({ learned: 0, mastered: 0, wins: 0 })
const checkinDone = ref(false)
const checkinStreak = ref(0)
const totalXP = ref(0)
const xpLevel = computed(() => getLevelFromXP(totalXP.value))
const nextLevel = computed(() => getNextLevel(totalXP.value))
const xpProgress = computed(() => getXPProgress(totalXP.value))

const userProfile = ref({ name: '小学习者', avatar: 'user' })
const showEditPopup = ref(false)
const showLevelList = ref(false)
const editName = ref('')
const editAvatar = ref('user')
const avatarOptions = [
  { icon: 'user', color: '#A855C7' },
  { icon: 'heart', color: '#E8573A' },
  { icon: 'star', color: '#F5A623' },
  { icon: 'sun', color: '#2B9E8F' },
  { icon: 'crown', color: '#3B82C4' },
  { icon: 'gem', color: '#9C27B0' },
]

function pickEdition(id) {
  selectedEdition.value = id
  uni.setStorageSync('currentEdition', id)
  refreshData()
}

function pickGrade(g) {
  selectedGrade.value = g
  uni.setStorageSync('currentGrade', g)
  refreshData()
}

function refreshData() {
  const stats = loadStats()
  migrateXP()
  totalXP.value = stats.totalXP || 0
  gs.value = stats[getGradeKey(selectedGrade.value, selectedEdition.value)] || { learned: 0, mastered: 0, wins: 0 }
  checkinDone.value = isCheckinDoneToday(selectedGrade.value, selectedEdition.value)
  const cd = getCheckinData(selectedGrade.value, selectedEdition.value)
  checkinStreak.value = cd.streak
  userProfile.value = getUserProfile()
}

function goCheckin() {
  if (!checkinDone.value) {
    uni.navigateTo({ url: '/pages/quiz/quiz?mode=checkin' })
  }
}
function openEditPopup() {
  editName.value = userProfile.value.name
  editAvatar.value = userProfile.value.avatar
  showEditPopup.value = true
}
function saveProfile() {
  userProfile.value = { name: editName.value, avatar: editAvatar.value }
  saveUserProfile(userProfile.value)
  showEditPopup.value = false
}
function openLevelList() { showLevelList.value = true }

onShow(() => {
  selectedGrade.value = uni.getStorageSync('currentGrade') || 3
  selectedEdition.value = uni.getStorageSync('currentEdition') || 'pep'
  refreshData()
})
</script>

<style scoped>
.page { min-height: 100vh; background: #F7F5F0; padding-bottom: 180rpx; }
.header-row { padding: 32rpx 40rpx 16rpx; }
.page-title { font-size: 48rpx; font-weight: 900; color: #1A1A2E; }

.selector-card { margin: 0 40rpx 24rpx; padding: 32rpx; background: #FFFFFF; border-radius: 28rpx; box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.06); }
.section-label { font-size: 28rpx; color: #6B7280; font-weight: 600; margin-bottom: 20rpx; display: block; }
.edition-row { display: flex; gap: 20rpx; margin-bottom: 24rpx; }
.edition-pill {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8rpx;
  padding: 20rpx; border: 3rpx solid #EAEAEA; border-radius: 16rpx;
  transition: all 0.2s;
}
.edition-pill.selected { background: #A855C7; border-color: #A855C7; }
.edition-text { font-size: 30rpx; font-weight: 700; color: #A855C7; }
.edition-pill.selected .edition-text { color: #FFFFFF; }

.grade-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rpx; }
.grade-chip {
  padding: 20rpx; border: 3rpx solid #EAEAEA; border-radius: 16rpx;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.grade-chip.selected { background: rgba(168,85,199,0.1); border-color: #A855C7; }
.grade-chip-text { font-size: 28rpx; font-weight: 600; color: #6B7280; }
.grade-chip.selected .grade-chip-text { color: #A855C7; }

.stats-card { margin: 0 40rpx 24rpx; padding: 32rpx; background: #FFFFFF; border-radius: 28rpx; box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.06); }
.stats-row { display: flex; align-items: center; }
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.stat-num { font-size: 48rpx; font-weight: 900; color: #1A1A2E; }
.stat-label { font-size: 26rpx; color: #9CA3AF; }
.stat-divider { width: 2rpx; height: 60rpx; background: #EAEAEA; }

.checkin-card {
  margin: 0 40rpx 24rpx; padding: 32rpx; border-radius: 28rpx;
  background: linear-gradient(135deg, #E8573A, #F08060);
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 8rpx 32rpx rgba(168,85,199,0.25);
  transition: transform 0.2s;
}
.checkin-card.done { background: linear-gradient(135deg, #2B9E8F, #2B9E8F); box-shadow: 0 8rpx 32rpx rgba(43,158,143,0.25); }
.checkin-card:active { transform: scale(0.98); }
.checkin-left { display: flex; align-items: center; gap: 20rpx; }
.checkin-info { display: flex; flex-direction: column; gap: 4rpx; }
.checkin-title { font-size: 34rpx; font-weight: 700; color: #FFFFFF; }
.checkin-sub { font-size: 24rpx; color: rgba(255,255,255,0.8); }

.xp-card { margin: 0 40rpx; padding: 28rpx 32rpx; background: #FFFFFF; border-radius: 28rpx; box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.06); }
.xp-top { display: flex; align-items: center; gap: 16rpx; margin-bottom: 20rpx; }
.xp-info { flex: 1; display: flex; flex-direction: column; gap: 4rpx; }
.xp-name { font-size: 30rpx; font-weight: 700; color: #1A1A2E; }
.xp-total { font-size: 26rpx; color: #9CA3AF; }
.xp-bar { height: 12rpx; background: #EAEAEA; border-radius: 6rpx; overflow: hidden; margin-bottom: 12rpx; }
.xp-fill { height: 100%; border-radius: 6rpx; transition: width 0.6s; }
.xp-next-row { display: flex; align-items: center; justify-content: center; gap: 6rpx; }
.xp-next-label { font-size: 24rpx; color: #9CA3AF; }
.xp-next-num { font-size: 24rpx; color: #A855C7; font-weight: 700; }

/* Profile Card */
.profile-card {
  margin: 0 40rpx 24rpx; padding: 28rpx 32rpx; background: #FFFFFF; border-radius: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.06); display: flex; align-items: center; gap: 20rpx;
  transition: transform 0.2s;
}
.profile-card:active { transform: scale(0.98); }
.profile-avatar {
  width: 80rpx; height: 80rpx; border-radius: 50%; background: rgba(168,85,199,0.1);
  display: flex; align-items: center; justify-content: center;
}
.profile-info { flex: 1; display: flex; flex-direction: column; gap: 4rpx; }
.profile-name { font-size: 34rpx; font-weight: 700; color: #1A1A2E; }
.profile-sub { font-size: 24rpx; color: #9CA3AF; }
.edit-icon { opacity: 0.5; }

/* Popup */
.popup-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: center; justify-content: center;
}
.popup-card {
  width: 600rpx; background: #FFFFFF; border-radius: 32rpx; padding: 48rpx 40rpx 40rpx;
  display: flex; flex-direction: column; gap: 24rpx;
}
.popup-title { font-size: 36rpx; font-weight: 800; color: #1A1A2E; text-align: center; }
.popup-section { font-size: 28rpx; color: #6B7280; font-weight: 600; }
.avatar-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24rpx; justify-items: center; }
.avatar-option {
  width: 100rpx; height: 100rpx; border-radius: 50%; background: #F3F4F6;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; border: 4rpx solid transparent;
}
.avatar-option.selected { border-color: #A855C7; background: rgba(168,85,199,0.1); }
.name-input {
  border: 2rpx solid #E5E7EB; border-radius: 16rpx; padding: 20rpx 24rpx;
  font-size: 30rpx; color: #1A1A2E; background: #F9FAFB;
}
.popup-btns { display: flex; gap: 20rpx; margin-top: 8rpx; }
.popup-btn {
  flex: 1; padding: 24rpx; border-radius: 20rpx; text-align: center;
  font-size: 32rpx; font-weight: 700;
}
.popup-btn.cancel { background: #F3F4F6; color: #6B7280; }
.popup-btn.confirm { background: #A855C7; color: #FFFFFF; }
.popup-btn.confirm.full { background: #F3F4F6; color: #6B7280; }

/* Level List Popup */
.level-popup { max-height: 800rpx; }
.level-scroll { max-height: 600rpx; }
.level-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20rpx 0; border-bottom: 1rpx solid #F3F4F6;
}
.level-row:last-child { border-bottom: none; }
.level-row.current { background: rgba(168,85,199,0.06); border-radius: 12rpx; padding: 20rpx 16rpx; margin-bottom: 8rpx; }
.level-left { display: flex; align-items: center; gap: 16rpx; }
.level-info { display: flex; flex-direction: column; gap: 2rpx; }
.level-name { font-size: 28rpx; font-weight: 700; color: #1A1A2E; }
.level-xp { font-size: 24rpx; color: #9CA3AF; }
.level-cur-tag { font-size: 22rpx; color: #A855C7; font-weight: 700; background: rgba(168,85,199,0.1); padding: 4rpx 12rpx; border-radius: 999rpx; }
</style>