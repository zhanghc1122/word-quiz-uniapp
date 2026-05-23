export const GRADE_NAMES = ['', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级']

export const EDITION_IDS = { pep: 'pep', shanghai: 'shanghai' }
export const EDITION_NAMES = { pep: '人教版', shanghai: '沪教版' }
export const DEFAULT_EDITION = 'pep'

export function getEditionLabel(edition) {
  return EDITION_NAMES[edition] || edition || DEFAULT_EDITION
}

export const XP_LEVELS = [
  { level: 1,  name: '小芽苗',   icon: 'sprout',        minXP: 0,    color: '#8BC34A' },
  { level: 2,  name: '小学徒',   icon: 'book-open',     minXP: 30,   color: '#4CAF50' },
  { level: 3,  name: '勤学者',   icon: 'pencil',        minXP: 80,   color: '#2B9E8F' },
  { level: 4,  name: '小达人',   icon: 'target',        minXP: 160,  color: '#3B82C4' },
  { level: 5,  name: '词汇星',   icon: 'star',          minXP: 280,  color: '#F5A623' },
  { level: 6,  name: '单词王',   icon: 'crown',         minXP: 450,  color: '#E8573A' },
  { level: 7,  name: '英语星',   icon: 'sparkles',      minXP: 700,  color: '#A855C7' },
  { level: 8,  name: '超级学霸', icon: 'graduation-cap', minXP: 1000, color: '#E91E63' },
  { level: 9,  name: '词汇大师', icon: 'trophy',        minXP: 1400, color: '#FF6F00' },
  { level: 10, name: '传奇状元', icon: 'gem',           minXP: 2000, color: '#9C27B0' },
]

export function getLevelFromXP(totalXP) {
  let current = XP_LEVELS[0]
  for (const lv of XP_LEVELS) {
    if (totalXP >= lv.minXP) current = lv
  }
  return current
}

export function getNextLevel(totalXP) {
  const current = getLevelFromXP(totalXP)
  const idx = XP_LEVELS.findIndex(lv => lv.level === current.level)
  if (idx >= XP_LEVELS.length - 1) return null
  return XP_LEVELS[idx + 1]
}

export function getXPProgress(totalXP) {
  const current = getLevelFromXP(totalXP)
  const next = getNextLevel(totalXP)
  if (!next) return { percent: 100, currentXP: totalXP - current.minXP, neededXP: 0 }
  const rangeXP = next.minXP - current.minXP
  const progressXP = totalXP - current.minXP
  return { percent: Math.min(100, Math.round((progressXP / rangeXP) * 100)), currentXP: progressXP, neededXP: rangeXP }
}

export const TOAST_CORRECT = [
  { text: '答对啦！' },
  { text: '太棒了！' },
  { text: '真厉害！' },
  { text: '满分！' },
  { text: '完美！' },
]

export const AI_DIFFICULTY = {
  easy:   { label: '简单', color: '#2B9E8F', accuracy: 0.45, thinkTime: [2000, 4000] },
  medium: { label: '中等', color: '#F5A623', accuracy: 0.60, thinkTime: [1200, 2500] },
  hard:   { label: '困难', color: '#E8573A', accuracy: 0.78, thinkTime: [600, 1500] },
}

export const AI_STRATEGY = {
  aggressive: {
    label: '猛攻型',
    desc: '答题快，准确率较高',
    speedBonus: -300,
    accuracyBonus: 0.05,
    streakThreshold: 3,
    icon: 'zap',
  },
  steady: {
    label: '稳健型',
    desc: '稳定发挥，节奏均匀',
    speedBonus: 0,
    accuracyBonus: 0,
    streakThreshold: 5,
    icon: 'circle-dot',
  },
  tricky: {
    label: '狡猾型',
    desc: '偶尔装错再反超',
    speedBonus: 200,
    accuracyBonus: -0.03,
    earlyFailCount: 2,
    lateAccuracyBoost: 0.15,
    icon: 'move-horizontal',
  },
}

export const AI_OPPONENTS = [
  { id: 'zhi', name: '小智同学', avatar: { initial: '智', color: '#A855C7' }, personality: 'steady', difficultyLevels: ['easy', 'medium', 'hard'] },
  { id: 'hua', name: '学霸小花', avatar: { initial: '花', color: '#E8573A' }, personality: 'aggressive', difficultyLevels: ['medium', 'hard'] },
  { id: 'hou', name: '快乐小猴', avatar: { initial: '猴', color: '#F5A623' }, personality: 'tricky', difficultyLevels: ['easy', 'medium'] },
  { id: 'tu', name: '勇敢小兔', avatar: { initial: '兔', color: '#2B9E8F' }, personality: 'aggressive', difficultyLevels: ['easy', 'medium', 'hard'] },
  { id: 'xiong', name: '聪明小熊', avatar: { initial: '熊', color: '#3B82C4' }, personality: 'steady', difficultyLevels: ['easy', 'medium', 'hard'] },
]

export const RANK_TIERS = [
  { id: 'bronze',   name: '青铜', icon: '◆', minWins: 0,  color: '#CD7F32' },
  { id: 'silver',   name: '白银', icon: '◆', minWins: 3,  color: '#A8A8A8' },
  { id: 'gold',     name: '黄金', icon: '★', minWins: 8,  color: '#F5A623' },
  { id: 'platinum', name: '铂金', icon: '★', minWins: 15, color: '#2B9E8F' },
  { id: 'diamond',  name: '钻石', icon: '✦', minWins: 25, color: '#A855C7' },
]

export function getRankFromWins(wins) {
  let rank = RANK_TIERS[0]
  for (const tier of RANK_TIERS) {
    if (wins >= tier.minWins) rank = tier
  }
  return rank
}

export function getDateString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getYesterdayString() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getTodayKey(grade, edition = DEFAULT_EDITION) {
  return `${getDateString()}_g${grade}_${edition}`
}

export function getDaySeed() {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

export function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function seededShuffle(arr, seed) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function simulateAiAnswer(questionIndex, totalQuestions, currentStreak, opponentId, difficulty) {
  const opp = AI_OPPONENTS.find(o => o.id === opponentId)
  const diff = AI_DIFFICULTY[difficulty]
  const strat = AI_STRATEGY[opp.personality]

  let accuracy = diff.accuracy + strat.accuracyBonus

  if (strat.earlyFailCount && questionIndex < strat.earlyFailCount) {
    accuracy = Math.max(0.1, accuracy - 0.4)
  }
  if (strat.lateAccuracyBoost && questionIndex >= totalQuestions - 3) {
    accuracy = Math.min(0.95, accuracy + strat.lateAccuracyBoost)
  }
  if (strat.streakThreshold && currentStreak >= strat.streakThreshold) {
    accuracy = Math.min(0.95, accuracy + 0.08)
  }

  accuracy = Math.max(0.2, Math.min(0.95, accuracy))

  const [minMs, maxMs] = diff.thinkTime
  let thinkMs = minMs + Math.random() * (maxMs - minMs) + strat.speedBonus
  thinkMs = Math.max(500, Math.round(thinkMs))

  return {
    correct: Math.random() < accuracy,
    thinkMs,
  }
}
