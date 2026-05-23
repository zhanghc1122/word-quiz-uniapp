<template>
  <view class="empty-state">
    <view class="empty-icon-wrap">
      <LIcon :name="icon" :size="iconSize" color="#9CA3AF" />
    </view>
    <text class="empty-title">{{ title }}</text>
    <text v-if="desc" class="empty-desc">{{ desc }}</text>
    <button v-if="actionText" class="empty-action" @tap="$emit('action')">
      {{ actionText }}
    </button>
  </view>
</template>

<script setup>
import LIcon from '@/components/LIcon.vue'

defineProps({
  icon: { type: String, default: 'inbox' },
  iconSize: { type: [Number, String], default: 64 },
  title: { type: String, default: '暂无内容' },
  desc: { type: String, default: '' },
  actionText: { type: String, default: '' },
})
defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 16rpx; padding: 80rpx 40rpx;
}
.empty-icon-wrap {
  width: 140rpx; height: 140rpx; border-radius: 50%;
  background: rgba(168,85,199,0.08);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8rpx;
}
.empty-title { font-size: 34rpx; font-weight: 700; color: #1A1A2E; }
.empty-desc { font-size: 28rpx; color: #9CA3AF; text-align: center; }
.empty-action {
  margin-top: 16rpx; background: #F3E8FF; color: #A855C7; border: none;
  padding: 20rpx 48rpx; border-radius: 999rpx; font-size: 30rpx; font-weight: 600;
}
.empty-action:active { background: rgba(168,85,199,0.15); transform: scale(0.97); }
</style>