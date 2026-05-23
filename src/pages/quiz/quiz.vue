<template>
  <view class="page">
    <view class="header">
      <view class="btn-back" @tap="confirmQuit"><text class="back-arrow">‹</text></view>
      <text class="header-title">单词测验</text>
      <text class="word-counter">{{ quizIndex + 1 }} / 10</text>
    </view>
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: (quizIndex + 1) * 10 + '%' }"></view>
    </view>
    <view class="score-bar">
      <text class="correct-text">✅ {{ correctCount }}</text>
      <text class="wrong-text">❌ {{ wrongCount }}</text>
      <text class="timer-text">⏱ {{ timerText }}</text>
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
.page { min-height: 100vh; background: #FFF8E1; }
.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 32rpx 40rpx;
}
.btn-back {
  width: 80rpx; height: 80rpx; background: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(171,71,188,0.12);
}
.back-arrow { font-size: 48rpx; font-weight: bold; color: #37474F; }
.header-title { font-size: 40rpx; font-weight: 700; color: #37474F; }
.word-counter {
  font-size: 28rpx; color: #AB47BC; font-weight: 600;
  background: rgba(171,71,188,0.1); padding: 8rpx 24rpx; border-radius: 40rpx;
}
.progress-bar {
  height: 12rpx; background: rgba(171,71,188,0.1); margin: 0 40rpx; border-radius: 6rpx; overflow: hidden;
}
.progress-fill {
  height: 100%; background: linear-gradient(to right, #AB47BC, #CE93D8); border-radius: 6rpx; transition: width 0.3s;
}
.score-bar {
  display: flex; justify-content: space-between; padding: 24rpx 40rpx; font-size: 30rpx; font-weight: 600;
}
.correct-text { color: #66BB6A; }
.wrong-text { color: #EF5350; }
.timer-text { color: #AB47BC; }
.question-box {
  margin: 16rpx 40rpx 40rpx; padding: 56rpx 40rpx; background: #fff; border-radius: 40rpx;
  box-shadow: 0 8rpx 40rpx rgba(171,71,188,0.1); text-align: center;
}
.question-prompt { font-size: 48rpx; font-weight: 700; color: #37474F; line-height: 1.4; }
.options { display: flex; flex-direction: column; gap: 24rpx; padding: 0 40rpx; }
.option-btn {
  padding: 36rpx 40rpx; background: #fff; border: 4rpx solid #F0E6F6;
  border-radius: 24rpx; font-size: 36rpx; font-weight: 500; color: #37474F;
  text-align: left; transition: all 0.25s;
}
.option-btn.correct { border-color: #66BB6A; background: rgba(102,187,106,0.1); color: #66BB6A; }
.option-btn.wrong { border-color: #EF5350; background: rgba(239,83,80,0.1); color: #EF5350; }
.option-btn.disabled { opacity: 0.5; }
</style>
