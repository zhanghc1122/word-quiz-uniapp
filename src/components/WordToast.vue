<template>
  <view v-if="visible" class="toast-overlay">
    <view :class="['toast', isCorrect ? 'correct' : 'wrong']">
      <text class="toast-symbol">{{ isCorrect ? '✓' : '✗' }}</text>
      <text class="toast-text">{{ text }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const TOAST_CORRECT = ['答对啦！', '太棒了！', '真厉害！', '满分！', '完美！']

const props = defineProps({
  visible: Boolean,
  isCorrect: { type: Boolean, default: true },
  customText: { type: String, default: '' }
})

const text = ref('')

watch(() => props.visible, (val) => {
  if (val) {
    if (props.isCorrect) {
      text.value = props.customText || TOAST_CORRECT[Math.floor(Math.random() * TOAST_CORRECT.length)]
    } else {
      text.value = props.customText || '已记入错题本'
    }
  }
})
</script>

<style scoped>
.toast-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex; align-items: center; justify-content: center;
  z-index: 999; pointer-events: none;
}
.toast {
  padding: 32rpx 64rpx; border-radius: 48rpx;
  display: flex; flex-direction: column; align-items: center;
  animation: toastPop 1s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
}
.toast.correct {
  background: #2B9E8F;
  box-shadow: 0 8rpx 32rpx rgba(26,26,46,0.08);
}
.toast.wrong {
  background: #D94848;
  box-shadow: 0 8rpx 32rpx rgba(26,26,46,0.08);
}
.toast-symbol { font-size: 96rpx; color: #fff; }
.toast-text { font-size: 36rpx; font-weight: 800; color: #fff; }
@keyframes toastPop {
  0%   { transform: scale(0); opacity: 0; }
  15%  { transform: scale(1.2); opacity: 1; }
  30%  { transform: scale(1); opacity: 1; }
  75%  { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0; }
}
</style>
