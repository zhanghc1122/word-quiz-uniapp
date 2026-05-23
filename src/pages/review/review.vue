<template>
  <view class="page">
    <view class="header">
      <view class="btn-back" @tap="goHome"><LIcon name="arrow-left" size="48rpx" /></view>
      <text class="header-title">错题复习</text>
      <text v-if="reviewWords.length > 0" class="word-counter">{{ reviewIndex + 1 }} / {{ reviewWords.length }}</text>
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
    <EmptyState
      v-if="reviewWords.length === 0"
      icon="check-circle"
      title="太棒了！暂无错题"
      desc="学习愉快，继续保持吧～"
    />
    <WordToast :visible="showToastFlag" :isCorrect="toastCorrect" :customText="toastText" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { wordsDB } from '@/utils/words'
import { seededShuffle } from '@/utils/helpers'
import { loadStats, saveReviewComplete, removeWrongWord } from '@/utils/storage'
import { getEdition } from '@/utils/edition'
import EmptyState from '@/components/EmptyState.vue'
import { playCorrect, playWrong, playClick } from '@/utils/sound'
import WordToast from '@/components/WordToast.vue'
import LIcon from '@/components/LIcon.vue'

const grade = ref(uni.getStorageSync('currentGrade') || 3)
const edition = getEdition()
const allWords = wordsDB[edition][grade.value] || []
const stats = loadStats()
const wrongIds = stats[`wrong_g${grade.value}_${edition}`] || []

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
  playClick()
  answered.value = true
  selectedIdx.value = index

  if (index === correctIdx.value) {
    playCorrect()
    removeWrongWord(grade.value, reviewWords[reviewIndex.value].word, edition)
    flashToast(true, '')
  } else {
    playWrong()
    flashToast(false, '加油，你一定能记住！')
  }

  setTimeout(() => {
    reviewIndex.value++
    answered.value = false
    selectedIdx.value = -1
    if (reviewIndex.value < reviewWords.length) {
      buildOptions()
    } else {
      saveReviewComplete(grade.value, reviewWords.length, edition)
      uni.showModal({
        title: '复习完成！',
        content: `太棒了！复习了 ${reviewWords.length} 道题，获得 +${reviewWords.length * 2} XP`,
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
.page { min-height: 100vh; background: #F7F5F0; }
.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 32rpx 40rpx;
}
.btn-back {
  width: 80rpx; height: 80rpx; background: #FFFFFF; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(26,26,46,0.04);
}
.back-arrow { display: none; }
.header-title { font-size: 40rpx; font-weight: 700; color: #1A1A2E; }
.word-counter {
  font-size: 28rpx; color: #2B9E8F; font-weight: 600;
  background: rgba(43,158,143,0.08); padding: 8rpx 24rpx; border-radius: 999rpx;
}
.question-box {
  margin: 40rpx 40rpx 40rpx; padding: 56rpx 40rpx; background: #FFFFFF; border-radius: 28rpx;
  box-shadow: 0 8rpx 32rpx rgba(26,26,46,0.08); text-align: center;
}
.question-prompt { font-size: 48rpx; font-weight: 700; color: #1A1A2E; }
.options { display: flex; flex-direction: column; gap: 24rpx; padding: 0 40rpx; }
.option-btn {
  padding: 36rpx 40rpx; background: #FFFFFF; border: 3rpx solid #EAEAEA;
  border-radius: 20rpx; font-size: 36rpx; font-weight: 500; color: #1A1A2E; text-align: left;
}
.option-btn:active { background: rgba(168,85,199,0.08); transform: scale(0.98); }
.option-btn.correct { border-color: #2B9E8F; background: rgba(43,158,143,0.08); color: #2B9E8F; }
.option-btn.wrong { border-color: #D94848; background: rgba(217,72,72,0.08); color: #D94848; }
.option-btn.disabled { opacity: 0.5; }
</style>
