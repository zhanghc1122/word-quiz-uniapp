<template>
  <view class="page">
    <view class="header">
      <view class="btn-back" @tap="confirmQuit"><LIcon name="arrow-left" size="48rpx" /></view>
      <text class="header-title">单词测验</text>
      <text class="word-counter">{{ quizIndex + 1 }} / 10</text>
    </view>
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: (quizIndex + 1) * 10 + '%' }"></view>
    </view>
    <view class="score-bar">
      <view class="score-item">
        <view class="score-dot dot-correct"></view>
        <text class="score-text text-correct">{{ correctCount }}</text>
      </view>
      <view class="score-item">
        <view class="score-dot dot-wrong"></view>
        <text class="score-text text-wrong">{{ wrongCount }}</text>
      </view>
      <view class="score-item">
        <text class="score-text text-muted">{{ timerText }}</text>
      </view>
    </view>
    <view class="question-box">
      <text class="question-prompt">{{ currentQuestion.word.word }} 的意思是？</text>
    </view>
    <view class="options">
      <button
        v-for="(opt, i) in currentQuestion.options" :key="i"
        :class="['option-btn', answered ? (i === currentQuestion.correctIndex ? 'correct' : (i === selectedIdx ? 'wrong' : 'disabled')) : '']"
        :disabled="answered"
        @tap="answer(i)"
      >{{ opt }}</button>
    </view>
    <WordToast :visible="showToastFlag" :isCorrect="toastCorrect" :customText="toastText" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { wordsDB } from '@/utils/words'
import { getDaySeed, seededShuffle } from '@/utils/helpers'
import { saveQuizResult } from '@/utils/storage'
import WordToast from '@/components/WordToast.vue'
import LIcon from '@/components/LIcon.vue'

const grade = ref(uni.getStorageSync('currentGrade') || 3)
const allWords = wordsDB[grade.value] || []
const todaySeed = getDaySeed()
const todayWords = seededShuffle([...allWords], todaySeed).slice(0, 10)

const questions = todayWords.map((w, i) => {
  const others = allWords.filter(x => x.word !== w.word)
  const distractors = seededShuffle([...others], todaySeed + i + 100).slice(0, 3)
  const options = seededShuffle([w, ...distractors], todaySeed + i + 200)
  return {
    word: w,
    correctIndex: options.indexOf(w),
    options: options.map(o => o.meaning)
  }
})

const quizIndex = ref(0)
const correctCount = ref(0)
const wrongCount = ref(0)
const wrongList = ref([])
const answered = ref(false)
const selectedIdx = ref(-1)
const seconds = ref(0)
const showToastFlag = ref(false)
const toastCorrect = ref(true)
const toastText = ref('')
let timerInterval = null

const currentQuestion = computed(() => questions[quizIndex.value] || { word: { word: '' }, options: [], correctIndex: -1 })
const timerText = computed(() => {
  const m = Math.floor(seconds.value / 60)
  const s = seconds.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

onMounted(() => {
  timerInterval = setInterval(() => { seconds.value++ }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

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

  const q = questions[quizIndex.value]
  if (index === q.correctIndex) {
    correctCount.value++
    flashToast(true, '')
  } else {
    wrongCount.value++
    wrongList.value.push({
      word: q.word.word,
      yourAnswer: q.options[index],
      correctAnswer: q.options[q.correctIndex]
    })
    flashToast(false, '已记入错题本')
  }

  setTimeout(() => {
    quizIndex.value++
    answered.value = false
    selectedIdx.value = -1
    if (quizIndex.value >= 10) {
      finishQuiz()
    }
  }, 1000)
}

function finishQuiz() {
  if (timerInterval) clearInterval(timerInterval)
  saveQuizResult(grade.value, correctCount.value, wrongList.value)
  const params = encodeURIComponent(JSON.stringify({
    correct: correctCount.value,
    wrong: wrongCount.value,
    time: timerText.value,
    wrongList: wrongList.value
  }))
  uni.redirectTo({ url: `/pages/result/result?data=${params}` })
}

function confirmQuit() {
  uni.showModal({
    title: '提示',
    content: '确定要退出测验吗？当前进度不会保存。',
    success: (res) => {
      if (res.confirm) {
        if (timerInterval) clearInterval(timerInterval)
        uni.navigateBack({ delta: 1 })
      }
    }
  })
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
  font-size: 28rpx; color: #7C5CBF; font-weight: 600;
  background: rgba(124,92,191,0.08); padding: 8rpx 24rpx; border-radius: 999rpx;
}
.progress-bar {
  height: 12rpx; background: #E8E5DF; margin: 0 40rpx; border-radius: 6rpx; overflow: hidden;
}
.progress-fill {
  height: 100%; background: #7C5CBF; border-radius: 6rpx; transition: width 0.3s;
}
.score-bar {
  display: flex; justify-content: space-between; padding: 24rpx 40rpx; align-items: center;
}
.score-item { display: flex; align-items: center; gap: 8rpx; }
.score-dot { width: 16rpx; height: 16rpx; border-radius: 50%; }
.dot-correct { background: #2B9E8F; }
.dot-wrong { background: #D94848; }
.score-text { font-size: 30rpx; font-weight: 600; }
.text-correct { color: #2B9E8F; }
.text-wrong { color: #D94848; }
.text-muted { color: #9CA3AF; }
.question-box {
  margin: 16rpx 40rpx 40rpx; padding: 56rpx 40rpx; background: #FFFFFF; border-radius: 28rpx;
  box-shadow: 0 8rpx 32rpx rgba(26,26,46,0.08); text-align: center;
}
.question-prompt { font-size: 48rpx; font-weight: 700; color: #1A1A2E; line-height: 1.4; }
.options { display: flex; flex-direction: column; gap: 24rpx; padding: 0 40rpx; }
.option-btn {
  padding: 36rpx 40rpx; background: #FFFFFF; border: 3rpx solid #E8E5DF;
  border-radius: 20rpx; font-size: 36rpx; font-weight: 500; color: #1A1A2E;
  text-align: left; transition: all 0.25s;
}
.option-btn.correct { border-color: #2B9E8F; background: rgba(43,158,143,0.08); color: #2B9E8F; }
.option-btn.wrong { border-color: #D94848; background: rgba(217,72,72,0.08); color: #D94848; }
.option-btn.disabled { opacity: 0.5; }
</style>
