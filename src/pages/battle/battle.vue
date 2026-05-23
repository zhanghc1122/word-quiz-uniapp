<template>
  <view class="page">
    <view class="battle-header">
      <view class="battle-player">
        <view class="battle-avatar me-avatar"><text class="avatar-letter">学</text></view>
        <text class="battle-name white">我</text>
        <view class="hp-bar"><view class="hp-fill me-fill" :style="{ width: (100 - oppScore * 10) + '%' }"></view></view>
        <text class="battle-score">{{ myScore }}</text>
      </view>
      <text class="battle-vs">VS</text>
      <view class="battle-player">
        <view class="battle-avatar opp-avatar" :style="{ background: opponent.avatar.color }">
          <text class="avatar-letter">{{ opponent.avatar.initial }}</text>
        </view>
        <text class="battle-name white">{{ opponent.name }}</text>
        <view class="hp-bar"><view class="hp-fill opp-fill" :style="{ width: (100 - myScore * 10) + '%' }"></view></view>
        <text class="battle-score">{{ oppScore }}</text>
      </view>
      <view class="btn-back-battle" @tap="confirmQuit"><LIcon name="x" size="40rpx" color="#FFFFFF" /></view>
    </view>

    <view class="battle-toolbar">
      <text class="battle-round">第 {{ battleIndex + 1 }} / 10 题</text>
      <BattleTimer :active="timerActive" :duration="10" @timeout="onTimeout" />
    </view>

    <view class="battle-question">
      <text class="battle-prompt">{{ currentQ.word.word }} 的意思是？</text>
    </view>

    <view class="battle-options">
      <button
        v-for="(opt, i) in currentQ.options" :key="i"
        :class="['battle-opt', answered ? (i === currentQ.correctIndex ? 'correct' : (i === selectedIdx ? 'wrong' : 'disabled')) : '']"
        :disabled="answered"
        @tap="answer(i)"
      >{{ opt }}</button>
    </view>

    <view class="ai-thinking-area">
      <AiThinking :visible="showAiThinking" :opponentAvatar="opponent.avatar" :resolved="aiResolved" :correct="lastAiCorrect" />
    </view>

    <scroll-view scroll-y class="battle-log">
      <view v-for="(log, i) in logs.slice(-2)" :key="i">
        <text :class="log.cls">{{ log.text }}</text>
      </view>
    </scroll-view>

    <WordToast :visible="showToastFlag" :isCorrect="toastCorrect" :customText="toastText" />
    <ComboIndicator :visible="showCombo" :combo="combo" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { wordsDB } from '@/utils/words'
import { AI_OPPONENTS, simulateAiAnswer } from '@/utils/helpers'
import { saveBattleResult } from '@/utils/storage'
import WordToast from '@/components/WordToast.vue'
import ComboIndicator from '@/components/ComboIndicator.vue'
import AiThinking from '@/components/AiThinking.vue'
import BattleTimer from '@/components/BattleTimer.vue'
import LIcon from '@/components/LIcon.vue'

const grade = ref(uni.getStorageSync('currentGrade') || 3)
const allWords = wordsDB[grade.value] || []
const seed = Date.now()

const opponentId = ref('')
const difficulty = ref('medium')
const opponent = ref({ id: 'zhi', name: '小智同学', avatar: { initial: '智', color: '#7C5CBF' }, personality: 'steady' })

const questions = ref([])
const battleIndex = ref(0)
const myScore = ref(0)
const oppScore = ref(0)
const answered = ref(false)
const selectedIdx = ref(-1)
const logs = ref([])
const combo = ref(0)
const maxCombo = ref(0)
const questionReplay = ref([])

const timerActive = ref(false)
const showAiThinking = ref(false)
const aiResolved = ref(false)
const lastAiCorrect = ref(true)
const showToastFlag = ref(false)
const toastCorrect = ref(true)
const toastText = ref('')
const showCombo = ref(false)

const currentQ = computed(() => questions.value[battleIndex.value] || { word: { word: '' }, options: [], correctIndex: -1 })

onLoad((query) => {
  opponentId.value = query.opponentId || 'zhi'
  difficulty.value = query.difficulty || 'medium'
  const found = AI_OPPONENTS.find(o => o.id === opponentId.value)
  if (found) opponent.value = found
  generateQuestions()
  timerActive.value = true
})

function generateQuestions() {
  const shuffled = seededShuffleArr([...allWords], seed)
  questions.value = shuffled.slice(0, 10).map((w, i) => {
    const others = allWords.filter(x => x.word !== w.word)
    const distractors = seededShuffleArr([...others], seed + i + 500).slice(0, 3)
    const options = seededShuffleArr([w, ...distractors], seed + i + 600)
    return { word: w, correctIndex: options.indexOf(w), options: options.map(o => o.meaning) }
  })
}

function seededShuffleArr(arr, s) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const x = Math.sin(s + i) * 10000
    const j = Math.floor((x - Math.floor(x)) * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function flashToast(correct, text) {
  toastCorrect.value = correct; toastText.value = text; showToastFlag.value = false
  setTimeout(() => { showToastFlag.value = true }, 30)
  setTimeout(() => { showToastFlag.value = false }, 1100)
}

function flashCombo() {
  if (combo.value < 2) return
  showCombo.value = false
  setTimeout(() => { showCombo.value = true }, 30)
  setTimeout(() => { showCombo.value = false }, 1300)
}

function onTimeout() { if (!answered.value) answer(-1) }

function confirmQuit() {
  if (battleIndex.value > 0 || myScore.value > 0 || oppScore.value > 0) {
    uni.showModal({
      title: '提示',
      content: '确定要退出对战吗？当前进度不会保存。',
      success: (res) => {
        if (res.confirm) {
          uni.redirectTo({ url: '/pages/home/home' })
        }
      }
    })
  } else {
    uni.redirectTo({ url: '/pages/home/home' })
  }
}

function answer(index) {
  if (answered.value) return
  answered.value = true; selectedIdx.value = index; timerActive.value = false
  const q = questions.value[battleIndex.value]; const startTime = Date.now()
  const iCorrect = index === q.correctIndex
  if (iCorrect) {
    myScore.value++; combo.value++
    if (combo.value > maxCombo.value) maxCombo.value = combo.value
    flashToast(true, ''); flashCombo()
  } else {
    combo.value = 0; flashToast(false, '没关系，再接再厉！')
  }

  const aiResult = simulateAiAnswer(battleIndex.value, 10, combo.value, opponentId.value, difficulty.value)
  showAiThinking.value = true; aiResolved.value = false

  setTimeout(() => {
    aiResolved.value = true; lastAiCorrect.value = aiResult.correct
    if (aiResult.correct) oppScore.value++
    const myMsg = iCorrect ? '✔ 你答对了！' : '✘ 你答错了'
    const oppMsg = aiResult.correct ? `✔ ${opponent.value.name}答对了` : `✘ ${opponent.value.name}答错了`
    logs.value.push({ text: `${myMsg} | ${oppMsg}`, cls: iCorrect ? 'log-correct' : 'log-wrong' })
    questionReplay.value.push({
      word: q.word.word, myAnswer: index >= 0 ? q.options[index] : '超时',
      myCorrect: iCorrect, myTime: Date.now() - startTime,
      oppCorrect: aiResult.correct, oppTime: aiResult.thinkMs,
    })
    setTimeout(() => {
      showAiThinking.value = false; battleIndex.value++
      answered.value = false; selectedIdx.value = -1
      if (battleIndex.value >= 10) { finishBattle() } else { timerActive.value = true }
    }, 800)
  }, aiResult.thinkMs)
}

function finishBattle() {
  const won = myScore.value > oppScore.value
  saveBattleResult({
    timestamp: Date.now(), opponentId: opponentId.value, difficulty: difficulty.value,
    grade: grade.value, myScore: myScore.value, oppScore: oppScore.value,
    won, combo: maxCombo.value, questions: questionReplay.value,
  })
  const params = encodeURIComponent(JSON.stringify({
    myScore: myScore.value, oppScore: oppScore.value,
    oppName: opponent.value.name, oppAvatar: opponent.value.avatar,
    opponentId: opponentId.value, difficulty: difficulty.value,
    won, combo: maxCombo.value, questions: questionReplay.value,
  }))
  uni.redirectTo({ url: `/pages/battle-result/battle-result?data=${params}` })
}
</script>

<style scoped>
.page { min-height: 100vh; background: #F7F5F0; }
.battle-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 36rpx 32rpx; background: #E8573A;
}
.battle-player { display: flex; flex-direction: column; align-items: center; gap: 12rpx; flex: 1; }
.battle-avatar {
  width: 104rpx; height: 104rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.25);
}
.me-avatar { background: rgba(255,255,255,0.25); }
.avatar-letter { font-size: 40rpx; font-weight: 700; color: #FFFFFF; }
.white { color: #FFFFFF; }
.battle-name { font-size: 26rpx; font-weight: 600; }
.hp-bar {
  width: 100%; max-width: 220rpx; height: 16rpx;
  background: rgba(255,255,255,0.25); border-radius: 8rpx; overflow: hidden;
}
.hp-fill { height: 100%; border-radius: 8rpx; transition: width 0.5s; }
.me-fill { background: #2B9E8F; }
.opp-fill { background: #D94848; }
.battle-score { color: #FFFFFF; font-size: 48rpx; font-weight: 900; }
.battle-vs { color: #FFFFFF; font-size: 40rpx; font-weight: 900; }
.btn-back-battle {
  position: absolute; right: 32rpx; top: 36rpx;
  width: 64rpx; height: 64rpx; border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
}

.battle-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 40rpx; }
.battle-round { font-size: 26rpx; color: #6B7280; font-weight: 600; }

.battle-question {
  margin: 16rpx 40rpx; padding: 40rpx; background: #FFFFFF; border-radius: 28rpx;
  box-shadow: 0 8rpx 32rpx rgba(26,26,46,0.08); text-align: center;
}
.battle-prompt { font-size: 44rpx; font-weight: 700; color: #1A1A2E; }

.battle-options { display: flex; flex-direction: column; gap: 20rpx; padding: 0 40rpx; }
.battle-opt {
  padding: 32rpx 36rpx; background: #FFFFFF; border: 3rpx solid #E8E5DF;
  border-radius: 20rpx; font-size: 34rpx; font-weight: 500; color: #1A1A2E;
  text-align: left; transition: all 0.25s;
}
.battle-opt:active { background: rgba(124,92,191,0.08); transform: scale(0.98); }
.battle-opt.correct { border-color: #2B9E8F; background: rgba(43,158,143,0.08); }
.battle-opt.wrong { border-color: #D94848; background: rgba(217,72,72,0.08); }
.battle-opt.disabled { opacity: 0.5; }

.ai-thinking-area { display: flex; justify-content: flex-end; padding: 16rpx 40rpx 0; }

.battle-log {
  margin: 24rpx 40rpx; padding: 20rpx 28rpx; background: #FFFFFF;
  border-radius: 20rpx; max-height: 120rpx; font-size: 26rpx;
  box-shadow: 0 2rpx 8rpx rgba(26,26,46,0.04);
}
.log-correct { color: #2B9E8F; }
.log-wrong { color: #D94848; }
</style>
