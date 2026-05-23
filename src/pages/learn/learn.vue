<template>
  <view class="page">
    <view class="float-back" @tap="goHome"><LIcon name="arrow-left" size="48rpx" /></view>
    <view class="word-counter">{{ currentIndex + 1 }} / 10</view>
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: (currentIndex + 1) * 10 + '%' }"></view>
    </view>

    <!-- 大字进度提示 -->
    <view class="progress-big">
      <text class="progress-big-text">已学 {{ currentIndex + 1 }} 个，还剩 {{ 10 - currentIndex - 1 }} 个</text>
    </view>

    <view class="learn-card" :class="{ 'animate-pop': animating }">
      <text class="word-display">{{ currentWord.word }}</text>
      <text class="word-phonetic">{{ currentWord.phonetic }}</text>
      <button class="btn-sound" @tap="speakWord">
        <LIcon name="volume-2" color="#A855C7" size="48rpx" />
        <text class="sound-label">听发音</text>
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
      <button
        class="btn-secondary"
        :disabled="currentIndex === 0"
        :class="{ 'btn-disabled': currentIndex === 0 }"
        @tap="prev"
      >
        <LIcon name="chevron-left" :size="32" color="#A855C7" />
        上一个
      </button>
      <button
        class="btn-primary"
        :class="{ 'btn-primary-active': currentIndex === 9 }"
        @tap="next"
      >
        {{ currentIndex === 9 ? '去测验！' : '记住了' }}
        <LIcon v-if="currentIndex < 9" name="check" :size="32" color="#FFFFFF" />
        <LIcon v-else name="arrow-right" :size="32" color="#FFFFFF" />
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { wordsDB } from '@/utils/words'
import { getDaySeed, seededShuffle, getTodayKey } from '@/utils/helpers'
import { loadStats, saveStats, saveLearnProgress } from '@/utils/storage'
import { getEdition } from '@/utils/edition'
import { playClick } from '@/utils/sound'
import LIcon from '@/components/LIcon.vue'

const grade = ref(uni.getStorageSync('currentGrade') || 3)
const edition = getEdition()
const allWords = wordsDB[edition][grade.value] || []
const todaySeed = getDaySeed()
const todayKey = getTodayKey(grade.value, edition)

const stats = loadStats()

// Restore daily word pool from storage so word order is stable across resumes
let dailyWordPool = stats[todayKey + '_pool']
if (!dailyWordPool) {
  dailyWordPool = seededShuffle([...allWords], todaySeed).slice(0, 10)
  stats[todayKey + '_pool'] = dailyWordPool
  saveStats(stats)
}

// Already learned words (by word string)
const learned = stats[todayKey] || []

const currentIndex = ref(learned.length)

const currentWord = computed(() => dailyWordPool[currentIndex.value] || { word: '', phonetic: '', meaning: '', sentence: '' })

const animating = ref(false)

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
    playClick()
    currentIndex.value--
    triggerAnim()
  }
}

function next() {
  playClick()
  saveLearnProgress(grade.value, dailyWordPool[currentIndex.value].word, edition)
  if (currentIndex.value < 9) {
    currentIndex.value++
    triggerAnim()
  } else {
    // Save learned words to storage and pass to quiz so word order is consistent
    const learnedWords = dailyWordPool.map(w => w.word)
    uni.setStorageSync('todayLearnedWords_' + todayKey, learnedWords)
    uni.setStorageSync('fromLearn', true)
    uni.redirectTo({ url: '/pages/quiz/quiz' })
  }
}

function goHome() {
  uni.showModal({
    title: '提示',
    content: '确定要退出学习吗？退出后当前进度不会保存。',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack({ delta: 1 })
      }
    }
  })
}

triggerAnim()
</script>

<style scoped>
.page { min-height: 100vh; background: #F7F5F0; display: flex; flex-direction: column; position: relative; }
.float-back {
  position: absolute; top: 32rpx; left: 32rpx; z-index: 10;
  width: 80rpx; height: 80rpx; background: #FFFFFF; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.08);
}
.word-counter {
  text-align: center; padding: 40rpx 40rpx 8rpx; font-size: 36rpx;
  color: #A855C7; font-weight: 700;
}
.progress-bar {
  height: 16rpx; background: #EAEAEA; margin: 0 40rpx; border-radius: 8rpx; overflow: hidden;
}
.progress-fill {
  height: 100%; background: linear-gradient(90deg, #E8573A, #F08060);
  border-radius: 8rpx; transition: width 0.4s ease-out;
}

/* 大字进度提示 */
.progress-big {
  text-align: center; padding: 16rpx 40rpx;
}
.progress-big-text {
  font-size: 32rpx; color: #6B7280; font-weight: 600;
  background: rgba(168,85,199,0.08);
  padding: 12rpx 32rpx; border-radius: 999rpx;
}

/* 词卡 */
.learn-card {
  margin: 24rpx 32rpx; padding: 48rpx 36rpx; background: #FFFFFF; border-radius: 36rpx;
  box-shadow: 0 8rpx 32rpx rgba(26,26,46,0.08);
  display: flex; flex-direction: column; align-items: center; gap: 20rpx;
  min-height: 520rpx; justify-content: center;
  border: 4rpx solid transparent;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.learn-card.animate-pop { animation: pop 0.4s ease-out; }
.learn-card:active {
  border-color: #A855C7;
  box-shadow: 0 12rpx 40rpx rgba(168,85,199,0.2);
}
.word-display { font-size: 64rpx; font-weight: 900; color: #1A1A2E; letter-spacing: 2rpx; }
.word-phonetic { font-size: 38rpx; color: #6B7280; font-style: italic; }

/* 发音按钮 */
.btn-sound {
  display: flex; flex-direction: column; align-items: center; gap: 4rpx;
  width: 100rpx; height: 100rpx; border-radius: 50%;
  background: rgba(168,85,199,0.1);
  border: none;
  justify-content: center;
  transition: all 0.2s;
}
.btn-sound:active {
  background: rgba(168,85,199,0.2);
  transform: scale(0.95);
}
.sound-label { font-size: 22rpx; color: #A855C7; font-weight: 600; }

/* 词义盒子 - 统一用紫色语义 */
.meaning-box {
  margin-top: 16rpx; padding: 24rpx 64rpx;
  background: rgba(168,85,199,0.08);
  border-radius: 999rpx;
  border: 3rpx solid rgba(168,85,199,0.15);
}
.word-meaning { font-size: 48rpx; font-weight: 700; color: #A855C7; }

/* 例句 */
.sentence-box { display: flex; flex-direction: column; align-items: center; gap: 8rpx; margin-top: 12rpx; }
.sentence-label { font-size: 28rpx; color: #FFFFFF; background: #A855C7; padding: 6rpx 24rpx; border-radius: 999rpx; font-weight: 600; }
.word-sentence { font-size: 34rpx; color: #1A1A2E; font-style: italic; line-height: 1.6; text-align: center; padding: 0 20rpx; }

/* 操作按钮 */
.learn-actions { display: flex; gap: 24rpx; padding: 0 40rpx; margin-top: auto; padding-bottom: 40rpx; }
.btn-secondary {
  flex: 1; background: #FFFFFF; color: #A855C7; border: 4rpx solid #EAEAEA;
  padding: 32rpx 24rpx; border-radius: 999rpx; font-size: 34rpx; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: 8rpx;
  transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.12s;
  box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.06);
}
.btn-secondary:active {
  background: #A855C7; color: #FFFFFF;
  transform: scale(0.92);
  box-shadow: 0 2rpx 8rpx rgba(168,85,199,0.3);
}
.btn-secondary.btn-disabled {
  opacity: 0.5;
  background: #F0EDE8;
  color: #C0BDB8;
}
.btn-secondary.btn-disabled:active {
  transform: none;
  background: #F0EDE8;
  box-shadow: 0 4rpx 16rpx rgba(26,26,46,0.06);
}

.btn-primary {
  flex: 1.2; background: #A855C7; color: #FFFFFF;
  border: none; padding: 32rpx 24rpx; border-radius: 999rpx; font-size: 36rpx; font-weight: 800;
  display: flex; align-items: center; justify-content: center; gap: 12rpx;
  box-shadow: 0 8rpx 32rpx rgba(168,85,199,0.3);
  transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.12s, background 0.12s;
}
.btn-primary:active {
  background: #8B3DA0;
  transform: scale(0.92);
  box-shadow: 0 4rpx 16rpx rgba(168,85,199,0.5);
}
.btn-primary.btn-primary-active {
  background: linear-gradient(135deg, #E8573A, #F08060);
  box-shadow: 0 8rpx 32rpx rgba(232,87,58,0.3);
}
.btn-primary.btn-primary-active:active {
  background: linear-gradient(135deg, #C04020, #C84030);
}

@keyframes pop {
  0% { transform: scale(0.85); opacity: 0; }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); opacity: 1; }
}
</style>