<template>
  <view class="page">
    <view class="header">
      <view class="btn-back" @tap="goHome"><text class="back-arrow">‹</text></view>
      <text class="header-title">错题复习</text>
      <text class="word-counter">{{ reviewIndex + 1 }} / {{ reviewWords.length }}</text>
    </view>
    <view v-if="reviewWords.length > 0" class="quiz-area">
      <view class="question-box">
        <text class="question-prompt">{{ currentWord.word }} 的意思是？</text>
      </view>
      <view class="options">
        <button
          v-for="(opt, i) in currentOptions" :key="i"
          :class="['option-btn', answered ? (i === correctIdx ? 'correct' : (i === selectedIdx ? 'wrong' : 'disabled')) : '']"
          :disabled="answered"
          @tap="answer(i)"
        >{{ opt.meaning }}</button>
      </view>
    </view>
    <view v-else class="empty">
      <text class="empty-icon">🎉</text>
      <text class="empty-text">暂无错题，太棒了！</text>
    </view>
    <WordToast :visible="showToastFlag" :isCorrect="toastCorrect" :customText="toastText" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { wordsDB } from '@/utils/words'
import { seededShuffle } from '@/utils/helpers'
import { loadStats } from '@/utils/storage'
import WordToast from '@/components/WordToast.vue'

const grade = ref(uni.getStorageSync('currentGrade') || 3)
const allWords = wordsDB[grade.value] || []
const stats = loadStats()
const wrongIds = stats[`wrong_g${grade.value}`] || []

const reviewWords = wrongIds.map(id => allWords.find(w => w.word === id)).filter(Boolean).slice(0, 10)
const reviewIndex = ref(0)
const answered = ref(false)
const selectedIdx = ref(-1)
const currentOptions = ref([])
const correctIdx = ref(-1)
const showToastFlag = ref(false)
const toastCorrect = ref(true)
const toastText = ref('')

const currentWord = computed(() => reviewWords[reviewIndex.value] || { word: '', meaning: '' })

onMounted(() => {
  if (reviewWords.length > 0) buildOptions()
})

function buildOptions() {
  const w = reviewWords[reviewIndex.value]
  if (!w) return
  const others = allWords.filter(x => x.word !== w.word)
  const distractors = seededShuffle([...others], Date.now()).slice(0, 3)
  const options = seededShuffle([w, ...distractors], Date.now() + 1)
  currentOptions.value = options
  correctIdx.value = options.indexOf(w)
}

function flashToast(correct, text) {
  toastCorrect.value = correct
  toastText.value = text
  showToastFlag.value = false
  setTimeout(() => { showToastFlag.value = true }, 30)
  setTimeout(() => { showToastFlag.value = false }, 1100)
}

function answer(index) {
  if (answered.value) return
  answered.value = true
  selectedIdx.value = index

  if (index === correctIdx.value) {
    flashToast(true, '')
  } else {
    flashToast(false, '')
  }

  setTimeout(() => {
    reviewIndex.value++
    answered.value = false
    selectedIdx.value = -1
    if (reviewIndex.value < reviewWords.length) {
      buildOptions()
    } else {
      uni.showModal({
        title: '复习完成！',
        content: '所有错题已复习完毕',
        showCancel: false,
        success: () => { uni.navigateBack({ delta: 1 }) }
      })
    }
  }, 1000)
}

function goHome() {
  uni.navigateBack({ delta: 1 })
}
</script>

<style scoped>
.page { min-height: 100vh; background: #FFF8E1; }
.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 32rpx 40rpx;
}
.btn-back {
  width: 80rpx; height: 80rpx; background: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(38,166,154,0.12);
}
.back-arrow { font-size: 48rpx; font-weight: bold; color: #37474F; }
.header-title { font-size: 40rpx; font-weight: 700; color: #37474F; }
.word-counter {
  font-size: 28rpx; color: #26A69A; font-weight: 600;
  background: rgba(38,166,154,0.1); padding: 8rpx 24rpx; border-radius: 40rpx;
}
.question-box {
  margin: 40rpx 40rpx 40rpx; padding: 56rpx 40rpx; background: #fff; border-radius: 40rpx;
  box-shadow: 0 8rpx 40rpx rgba(38,166,154,0.1); text-align: center;
}
.question-prompt { font-size: 48rpx; font-weight: 700; color: #37474F; }
.options { display: flex; flex-direction: column; gap: 24rpx; padding: 0 40rpx; }
.option-btn {
  padding: 36rpx 40rpx; background: #fff; border: 4rpx solid #E0F2F1;
  border-radius: 24rpx; font-size: 36rpx; font-weight: 500; color: #37474F; text-align: left;
}
.option-btn.correct { border-color: #66BB6A; background: rgba(102,187,106,0.1); color: #66BB6A; }
.option-btn.wrong { border-color: #EF5350; background: rgba(239,83,80,0.1); color: #EF5350; }
.option-btn.disabled { opacity: 0.5; }
.empty { display: flex; flex-direction: column; align-items: center; padding-top: 200rpx; gap: 24rpx; }
.empty-icon { font-size: 120rpx; }
.empty-text { font-size: 34rpx; color: #78909C; }
</style>
