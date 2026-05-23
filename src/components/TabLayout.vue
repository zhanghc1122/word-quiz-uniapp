<template>
  <view class="tab-layout">
    <slot />
    <TabBar />
  </view>
</template>

<script setup>
import TabBar from '@/components/TabBar.vue'
</script>

<style scoped>
.tab-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>