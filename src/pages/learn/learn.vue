<template>
  <view class="page">
    <view class="float-back" @tap="goHome"><text class="back-arrow">‹</text></view>
    <view class="word-counter">{{ currentIndex + 1 }} / 10</view>
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: (currentIndex + 1) * 10 + '%' }"></view>
    </view>
    <view class="learn-card" :class="{ 'animate-pop': animating }">
      <text class="word-display">{{ currentWord.word }}</text>
      <text class="word-phonetic">{{ currentWord.phonetic }}</text>
      <button class="btn-sound" @tap="speakWord">🔊</button>
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
.page { min-height: 100vh; background: #FFF8E1; display: flex; flex-direction: column; position: relative; }
.float-back {
  position: absolute; top: 32rpx; left: 32rpx; z-index: 10;
  width: 80rpx; height: 80rpx; background: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(66,165,245,0.15);
}
.back-arrow { font-size: 48rpx; font-weight: bold; color: #37474F; }
.word-counter {
  text-align: center; padding: 40rpx 40rpx 12rpx; font-size: 30rpx;
  color: #42A5F5; font-weight: 700;
}
.progress-bar {
  height: 12rpx; background: rgba(66,165,245,0.15); margin: 0 40rpx; border-radius: 6rpx; overflow: hidden;
}
.progress-fill {
  height: 100%; background: linear-gradient(to right, #42A5F5, #90CAF9); border-radius: 6rpx; transition: width 0.3s;
}
.learn-card {
  margin: 40rpx 32rpx; padding: 56rpx 40rpx; background: #fff; border-radius: 48rpx;
  box-shadow: 0 8rpx 40rpx rgba(66,165,245,0.12);
  display: flex; flex-direction: column; align-items: center; gap: 24rpx;
  min-height: 580rpx; justify-content: center;
}
.learn-card.animate-pop { animation: pop 0.4s ease-out; }
.word-display { font-size: 88rpx; font-weight: 900; color: #42A5F5; letter-spacing: 2rpx; }
.word-phonetic { font-size: 34rpx; color: #78909C; font-style: italic; }
.btn-sound {
  width: 96rpx; height: 96rpx; border-radius: 50%;
  background: linear-gradient(to right, #42A5F5, #90CAF9);
  font-size: 44rpx; border: none;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(66,165,245,0.3);
}
.meaning-box {
  margin-top: 24rpx; padding: 20rpx 56rpx;
  background: linear-gradient(135deg, rgba(102,187,106,0.1), rgba(102,187,106,0.05));
  border-radius: 60rpx;
}
.word-meaning { font-size: 52rpx; font-weight: 700; color: #66BB6A; }
.sentence-box { display: flex; flex-direction: column; align-items: center; gap: 8rpx; margin-top: 16rpx; }
.sentence-label { font-size: 26rpx; color: #78909C; background: #FFF8E1; padding: 4rpx 20rpx; border-radius: 20rpx; }
.word-sentence { font-size: 30rpx; color: #37474F; font-style: italic; line-height: 1.6; }
.learn-actions { display: flex; gap: 28rpx; padding: 0 40rpx; margin-top: auto; padding-bottom: 40rpx; }
.btn-secondary {
  flex: 1; background: #fff; color: #42A5F5; border: 4rpx solid #90CAF9;
  padding: 32rpx; border-radius: 100rpx; font-size: 34rpx; font-weight: 600;
}
.btn-secondary[disabled] { opacity: 0.4; }
.btn-primary {
  flex: 1; background: linear-gradient(to right, #42A5F5, #90CAF9); color: #fff;
  border: none; padding: 32rpx; border-radius: 100rpx; font-size: 34rpx; font-weight: 700;
  box-shadow: 0 8rpx 30rpx rgba(66,165,245,0.3);
}
@keyframes pop {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
</style>
