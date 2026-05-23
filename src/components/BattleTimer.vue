<template>
  <view v-if="active" class="timer-wrap">
    <view class="timer-ring" :style="ringStyle">
      <text class="timer-num" :style="{ color: currentColor }">{{ displaySeconds }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  duration: { type: Number, default: 10 },
  active: { type: Boolean, default: false },
})

const emit = defineEmits(['timeout'])

const remaining = ref(props.duration * 10)
let interval = null

const displaySeconds = computed(() => Math.ceil(remaining.value / 10))
const fraction = computed(() => remaining.value / (props.duration * 10))

const currentColor = computed(() => {
  if (fraction.value > 0.5) return '#2B9E8F'
  if (fraction.value > 0.25) return '#F5A623'
  return '#D94848'
})

const ringStyle = computed(() => {
  const deg = fraction.value * 360
  return {
    background: `conic-gradient(${currentColor.value} ${deg}deg, #EAEAEA ${deg}deg)`,
  }
})

function startTimer() {
  stopTimer()
  remaining.value = props.duration * 10
  interval = setInterval(() => {
    remaining.value--
    if (remaining.value <= 0) {
      stopTimer()
      emit('timeout')
    }
  }, 100)
}

function stopTimer() {
  if (interval) { clearInterval(interval); interval = null }
}

watch(() => props.active, (val) => {
  if (val) startTimer()
  else stopTimer()
})

onUnmounted(() => stopTimer())
</script>

<style scoped>
.timer-wrap {
  display: flex; align-items: center; justify-content: center;
}
.timer-ring {
  width: 80rpx; height: 80rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.timer-ring::after {
  content: '';
  position: absolute;
  width: 60rpx; height: 60rpx;
  border-radius: 50%;
  background: #fff;
}
.timer-num {
  position: relative; z-index: 1;
  font-size: 28rpx; font-weight: 800;
}
</style>
