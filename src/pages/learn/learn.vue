<template>
  <view class="page">
    <view class="float-back" @tap="goHome"><LIcon name="arrow-left" size="48rpx" /></view>
    <view class="word-counter">{{ currentIndex + 1 }} / 10</view>
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: (currentIndex + 1) * 10 + '%' }"></view>
    </view>
    <view class="learn-card" :class="{ 'animate-pop': animating }">
      <text class="word-display">{{ currentWord.word }}</text>
      <text class="word-phonetic">{{ currentWord.phonetic }}</text>
      <button class="btn-sound" @tap="speakWord">
        <LIcon name="volume-2" color="#7C5CBF" size="44rpx" />
      </button>
      <view class="meaning-box">
        <text class="word-meaning">{{ currentWord.meaning }}</text>
      </view>
      <view class="sentence-box">
        <text class="sentence-label">例句</text>
        <text class="word-sentence">{{ currentWord.sentence }}</text>
      </view>
    </view>
    <view class="learn-actions">
      <button class="btn-secondary" :disabled="currentIndex === 0" @tap="prev">上一个</button>
      <button class="btn-primary" @tap="next">{{ currentIndex === 9 ? '去测验！' : '记住了' }}</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { wordsDB } from '@/utils/words'
import { getDaySeed, seededShuffle, getTodayKey } from '@/utils/helpers'
import { loadStats, saveLearnProgress } from '@/utils/storage'
import LIcon from '@/components/LIcon.vue'

const grade = ref(uni.getStorageSync('currentGrade') || 3)
const allWords = wordsDB[grade.value] || []
const todaySeed = getDaySeed()
const todayWords = seededShuffle([...allWords], todaySeed).slice(0, 10)

const stats = loadStats()
const todayKey = getTodayKey(grade.value)
const learned = stats[todayKey] || []

const currentIndex = ref(learned.length)
const animating = ref(false)

const currentWord = computed(() => todayWords[currentIndex.value] || { word: '', phonetic: '', meaning: '', sentence: '' })

function triggerAnim() {
  animating.value = false
  setTimeout(() => { animating.value = true }, 50)
}

function speakWord() {
  const word = currentWord.value.word
  if (!word) return
  // #ifdef H5
  const u = new SpeechSynthesisUtterance(word)
  u.lang = 'en-US'; u.rate = 0.8
  speechSynthesis.speak(u)
  // #endif
}

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    triggerAnim()
  }
}

function next() {
  saveLearnProgress(grade.value, todayWords[currentIndex.value].word)
  if (currentIndex.value < 9) {
    currentIndex.value++
    triggerAnim()
  } else {
    uni.redirectTo({ url: '/pages/quiz/quiz' })
  }
}

function goHome() {
  uni.navigateBack({ delta: 1 })
}

triggerAnim()
</script>

<style scoped>
.page { min-height: 100vh; background: #F7F5F0; display: flex; flex-direction: column; position: relative; }
.float-back {
  position: absolute; top: 32rpx; left: 32rpx; z-index: 10;
  width: 80rpx; height: 80rpx; background: #FFFFFF; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(26,26,46,0.04);
}
.back-arrow { display: none; }
.word-counter {
  text-align: center; padding: 40rpx 40rpx 12rpx; font-size: 30rpx;
  color: #7C5CBF; font-weight: 700;
}
.progress-bar {
  height: 12rpx; background: #E8E5DF; margin: 0 40rpx; border-radius: 6rpx; overflow: hidden;
}
.progress-fill {
  height: 100%; background: #7C5CBF; border-radius: 6rpx; transition: width 0.3s;
}
.learn-card {
  margin: 40rpx 32rpx; padding: 56rpx 40rpx; background: #FFFFFF; border-radius: 36rpx;
  box-shadow: 0 8rpx 32rpx rgba(26,26,46,0.08);
  display: flex; flex-direction: column; align-items: center; gap: 24rpx;
  min-height: 580rpx; justify-content: center;
}
.learn-card.animate-pop { animation: pop 0.4s ease-out; }
.word-display { font-size: 88rpx; font-weight: 900; color: #7C5CBF; letter-spacing: 2rpx; }
.word-phonetic { font-size: 34rpx; color: #6B7280; font-style: italic; }
.btn-sound {
  width: 96rpx; height: 96rpx; border-radius: 50%;
  background: rgba(124,92,191,0.08);
  border: none;
  display: flex; align-items: center; justify-content: center;
}
.meaning-box {
  margin-top: 24rpx; padding: 20rpx 56rpx;
  background: rgba(43,158,143,0.08);
  border-radius: 999rpx;
}
.word-meaning { font-size: 52rpx; font-weight: 700; color: #2B9E8F; }
.sentence-box { display: flex; flex-direction: column; align-items: center; gap: 8rpx; margin-top: 16rpx; }
.sentence-label { font-size: 26rpx; color: #6B7280; background: #F7F5F0; padding: 4rpx 20rpx; border-radius: 999rpx; }
.word-sentence { font-size: 30rpx; color: #1A1A2E; font-style: italic; line-height: 1.6; }
.learn-actions { display: flex; gap: 28rpx; padding: 0 40rpx; margin-top: auto; padding-bottom: 40rpx; }
.btn-secondary {
  flex: 1; background: #FFFFFF; color: #7C5CBF; border: 3rpx solid #E8E5DF;
  padding: 32rpx; border-radius: 999rpx; font-size: 34rpx; font-weight: 600;
}
.btn-secondary[disabled] { opacity: 0.4; }
.btn-primary {
  flex: 1; background: #7C5CBF; color: #FFFFFF;
  border: none; padding: 32rpx; border-radius: 999rpx; font-size: 34rpx; font-weight: 700;
  box-shadow: 0 8rpx 32rpx rgba(26,26,46,0.08);
}
@keyframes pop {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
</style>
