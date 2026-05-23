import { getTodayKey, getRankFromWins } from './helpers'

export function loadStats() {
  try {
    return JSON.parse(uni.getStorageSync('wordQuizStats') || '{}')
  } catch {
    return {}
  }
}

export function saveStats(stats) {
  uni.setStorageSync('wordQuizStats', JSON.stringify(stats))
}

export function saveLearnProgress(grade, word) {
  const stats = loadStats()
  const todayKey = getTodayKey(grade)
  if (!stats[todayKey]) stats[todayKey] = []
  if (!stats[todayKey].includes(word)) {
    stats[todayKey].push(word)
  }
  const gradeKey = `g${grade}`
  if (!stats[gradeKey]) stats[gradeKey] = { learned: 0, mastered: 0, wins: 0 }
  saveStats(stats)
}

export function saveQuizResult(grade, correct, wrongList) {
  const stats = loadStats()
  const gradeKey = `g${grade}`
  if (!stats[gradeKey]) stats[gradeKey] = { learned: 0, mastered: 0, wins: 0 }
  stats[gradeKey].mastered = (stats[gradeKey].mastered || 0) + correct

  if (wrongList.length > 0) {
    const wrongKey = `wrong_${gradeKey}`
    if (!stats[wrongKey]) stats[wrongKey] = []
    wrongList.forEach(w => {
      if (!stats[wrongKey].includes(w.word)) stats[wrongKey].push(w.word)
    })
  }

  const todayKey = getTodayKey(grade)
  stats[`quiz_done_${todayKey}`] = true
  stats[gradeKey].learned = (stats[gradeKey].learned || 0) + 1
  saveStats(stats)
}

export function saveBattleWin(grade) {
  const stats = loadStats()
  const gradeKey = `g${grade}`
  if (!stats[gradeKey]) stats[gradeKey] = { learned: 0, mastered: 0, wins: 0 }
  stats[gradeKey].wins = (stats[gradeKey].wins || 0) + 1
  saveStats(stats)
}

// ========== Battle System ==========

function defaultBattleStats() {
  return {
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    currentWinStreak: 0,
    maxWinStreak: 0,
    byDifficulty: { easy: { wins: 0, losses: 0 }, medium: { wins: 0, losses: 0 }, hard: { wins: 0, losses: 0 } },
    byOpponent: {},
  }
}

export function loadBattleStats() {
  try {
    const raw = uni.getStorageSync('battle_stats')
    if (!raw) return defaultBattleStats()
    const parsed = JSON.parse(raw)
    return { ...defaultBattleStats(), ...parsed }
  } catch {
    return defaultBattleStats()
  }
}

export function saveBattleResult(matchData) {
  // Save to battle history
  let history = []
  try {
    history = JSON.parse(uni.getStorageSync('battle_history') || '[]')
  } catch { /* empty */ }
  history.unshift(matchData)
  if (history.length > 50) history = history.slice(0, 50)
  uni.setStorageSync('battle_history', JSON.stringify(history))

  // Update battle stats
  const bs = loadBattleStats()
  if (matchData.won) {
    bs.totalWins++
    bs.currentWinStreak++
    if (bs.currentWinStreak > bs.maxWinStreak) bs.maxWinStreak = bs.currentWinStreak
  } else if (matchData.myScore === matchData.oppScore) {
    bs.totalDraws++
    bs.currentWinStreak = 0
  } else {
    bs.totalLosses++
    bs.currentWinStreak = 0
  }

  if (matchData.difficulty && bs.byDifficulty[matchData.difficulty]) {
    if (matchData.won) bs.byDifficulty[matchData.difficulty].wins++
    else if (matchData.myScore !== matchData.oppScore) bs.byDifficulty[matchData.difficulty].losses++
  }

  if (matchData.opponentId) {
    if (!bs.byOpponent[matchData.opponentId]) bs.byOpponent[matchData.opponentId] = { wins: 0, losses: 0 }
    if (matchData.won) bs.byOpponent[matchData.opponentId].wins++
    else if (matchData.myScore !== matchData.oppScore) bs.byOpponent[matchData.opponentId].losses++
  }

  uni.setStorageSync('battle_stats', JSON.stringify(bs))

  // Also update legacy grade stats
  if (matchData.won) saveBattleWin(matchData.grade || 3)
}

export function loadBattleHistory(limit) {
  try {
    const history = JSON.parse(uni.getStorageSync('battle_history') || '[]')
    return limit ? history.slice(0, limit) : history
  } catch {
    return []
  }
}

export function getPlayerRank() {
  const bs = loadBattleStats()
  return getRankFromWins(bs.totalWins)
}

export function getGrade(grade) {
  return uni.getStorageSync('currentGrade') || grade
}

export function setGrade(grade) {
  uni.setStorageSync('currentGrade', grade)
}
