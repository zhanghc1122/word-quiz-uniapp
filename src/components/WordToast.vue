<template>
  <view v-if="visible" class="toast-overlay">
    <view :class="['toast', isCorrect ? 'correct' : 'wrong']">
      <text class="toast-emoji">{{ emoji }}</text>
      <text class="toast-text">{{ text }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  isCorrect: { type: Boolean, default: true },
  customText: { type: String, default: '' }
})

const TOAST_CORRECT = [
  { emoji: '🎉', text: '答对啦！' },
  { emoji: '🌟', text: '太棒了！' },
  { emoji: '👏', text: '真厉害！' },
  { emoji: '💯', text: '满分！' },
  { emoji: '✨', text: '完美！' },
]

const emoji = ref('')
const text = ref('')

watch(() => props.visible, (val) => {
  if (val) {
    if (props.isCorrect) {
      const pick = TOAST_CORRECT[Math.floor(Math.random() * TOAST_CORRECT.length)]
      emoji.value = pick.emoji
      text.value = props.customText || pick.text
    } else {
      emoji.value = '📝'
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
  background: linear-gradient(135deg, #66BB6A, #A5D6A7);
  box-shadow: 0 16rpx 60rpx rgba(102, 187, 106, 0.5);
}
.toast.wrong {
  background: linear-gradient(135deg, #EF5350, #EF9A9A);
  box-shadow: 0 16rpx 60rpx rgba(239, 83, 80, 0.5);
}
.toast-emoji { font-size: 80rpx; margin-bottom: 8rpx; }
.toast-text { font-size: 36rpx; font-weight: 800; color: #fff; }
@keyframes toastPop {
  0%   { transform: scale(0); opacity: 0; }
  15%  { transform: scale(1.2); opacity: 1; }
  30%  { transform: scale(1); opacity: 1; }
  75%  { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0; }
}
</style>
