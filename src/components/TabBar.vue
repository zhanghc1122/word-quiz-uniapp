<template>
  <view class="tabbar">
    <view
      v-for="tab in tabs" :key="tab.pagePath"
      :class="['tab-item', currentPage === tab.pagePath ? 'active' : '']"
      @tap="switchTab(tab)"
    >
      <LIcon :name="tab.icon" size="48" :color="currentPage === tab.pagePath ? '#E8573A' : '#9CA3AF'" />
      <text class="tab-label" :style="{ color: currentPage === tab.pagePath ? '#E8573A' : '' }">{{ tab.label }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LIcon from '@/components/LIcon.vue'

const currentPage = ref('/pages/home/home')

const tabs = [
  { label: '首页', icon: 'home', pagePath: '/pages/home/home' },
  { label: '日历', icon: 'calendar', pagePath: '/pages/calendar/calendar' },
  { label: '我的', icon: 'user', pagePath: '/pages/my/my' },
]

function switchTab(tab) {
  if (currentPage.value === tab.pagePath) return
  currentPage.value = tab.pagePath
  uni.switchTab({ url: tab.pagePath })
}

onMounted(() => {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    currentPage.value = '/' + pages[pages.length - 1].route
  }
})
</script>

<style scoped>
.tabbar {
  position: fixed; bottom: 0; left: 0; right: 0;
  display: flex; background: #FFFFFF;
  box-shadow: 0 -4rpx 16rpx rgba(26,26,46,0.06);
  padding: 16rpx 0 calc(env(safe-area-inset-bottom) + 12rpx);
  z-index: 100;
}
.tab-item {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  gap: 4rpx; padding: 8rpx 0;
}
.tab-label { font-size: 24rpx; color: #9CA3AF; font-weight: 600; }
</style>