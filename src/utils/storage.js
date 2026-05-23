import { getTodayKey, getRankFromWins, getDateString, getYesterdayString, DEFAULT_EDITION } from './helpers'
import { getEdition } from './edition'

export { getEdition }
export { setEdition } from './edition'

export function getGradeKey(grade, edition) {
  return `g${grade}_${edition || getEdition()}`
}

export function getWrongKey(grade, edition) {
  return `wrong_g${grade}_${edition || getEdition()}`
}

export function migrateToEditionScope() {
  const stats = loadStats()
  if (stats._editionMigrated) return
  for (let g = 1; g <= 6; g++) {
    const oldKey = `g${g}`
    const newKey = `g${g}_pep`
    if (stats[oldKey] && !stats[newKey]) stats[newKey] = stats[oldKey]
    const oldWrong = `wrong_g${g}`
    const newWrong = `wrong_g${g}_pep`
    if (stats[oldWrong] && !stats[newWrong]) stats[newWrong] = stats[oldWrong]
    const oldCheckin = `checkin_g${g}`
    const newCheckin = `checkin_g${g}_pep`
    if (stats[oldCheckin] && !stats[newCheckin]) stats[newCheckin] = stats[oldCheckin]
  }
  stats._editionMigrated = true
  saveStats(stats)
}

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

export function saveLearnProgress(grade, word, edition) {
  const stats = loadStats()
  const ed = edition || getEdition()
  const todayKey = getTodayKey(grade, ed)
  if (!stats[todayKey]) stats[todayKey] = []
  if (!stats[todayKey].includes(word)) {
    stats[todayKey].push(word)
    stats.totalXP = (stats.totalXP || 0) + 3
  }
  const gradeKey = getGradeKey(grade, ed)
  if (!stats[gradeKey]) stats[gradeKey] = { learned: 0, mastered: 0, wins: 0 }
  saveStats(stats)
}

export function saveQuizResult(grade, correct, wrongList, edition) {
  const stats = loadStats()
  const ed = edition || getEdition()
  const gradeKey = getGradeKey(grade, ed)
  if (!stats[gradeKey]) stats[gradeKey] = { learned: 0, mastered: 0, wins: 0 }
  stats[gradeKey].mastered = (stats[gradeKey].mastered || 0) + correct

  if (wrongList.length > 0) {
    const wrongKey = getWrongKey(grade, ed)
    if (!stats[wrongKey]) stats[wrongKey] = []
    wrongList.forEach(w => {
      if (!stats[wrongKey].includes(w.word)) stats[wrongKey].push(w.word)
    })
  }

  const todayKey = getTodayKey(grade, ed)
  stats[`quiz_done_${todayKey}`] = true
  stats[gradeKey].learned = (stats[gradeKey].learned || 0) + 1
  stats.totalXP = (stats.totalXP || 0) + correct * 5
  saveStats(stats)
}

export function saveBattleWin(grade, edition) {
  const stats = loadStats()
  const gradeKey = getGradeKey(grade, edition || getEdition())
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

  // Update grade learning stats
  const stats = loadStats()
  const edition = matchData.edition || getEdition()
  const gradeKey = getGradeKey(matchData.grade || 3, edition)
  if (!stats[gradeKey]) stats[gradeKey] = { learned: 0, mastered: 0, wins: 0 }
  stats[gradeKey].learned = (stats[gradeKey].learned || 0) + 1
  stats[gradeKey].mastered = (stats[gradeKey].mastered || 0) + (matchData.myScore || 0)
  if (matchData.won) stats[gradeKey].wins = (stats[gradeKey].wins || 0) + 1

  // Save wrong words to review book
  if (matchData.questions && matchData.questions.length > 0) {
    const wrongKey = getWrongKey(matchData.grade || 3, edition)
    if (!stats[wrongKey]) stats[wrongKey] = []
    matchData.questions.forEach(q => {
      if (!q.myCorrect && q.word && !stats[wrongKey].includes(q.word)) {
        stats[wrongKey].push(q.word)
      }
    })
  }

  const battleXP = matchData.won ? 30 : (matchData.myScore === matchData.oppScore ? 15 : 10)
  stats.totalXP = (stats.totalXP || 0) + battleXP
  saveStats(stats)
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

// ========== Check-in System ==========

export function getCheckinData(grade, edition) {
  const stats = loadStats()
  return stats[`checkin_g${grade}_${edition || getEdition()}`] || { lastDate: null, streak: 0, maxStreak: 0 }
}

export function isCheckinDoneToday(grade, edition) {
  const stats = loadStats()
  const todayKey = getTodayKey(grade, edition || getEdition())
  return !!stats[`checkin_done_${todayKey}`]
}

export function saveCheckin(grade, edition) {
  const stats = loadStats()
  const ed = edition || getEdition()
  const todayKey = getTodayKey(grade, ed)
  if (stats[`checkin_done_${todayKey}`]) return { streak: 0 }

  const key = `checkin_g${grade}_${ed}`
  const data = stats[key] || { lastDate: null, streak: 0, maxStreak: 0 }
  const today = getDateString()
  const yesterday = getYesterdayString()

  if (data.lastDate === yesterday) {
    data.streak++
  } else {
    data.streak = 1
  }
  if (data.streak > data.maxStreak) data.maxStreak = data.streak
  data.lastDate = today

  stats[key] = data
  stats[`checkin_done_${todayKey}`] = true

  let bonus = 10
  if (data.streak % 7 === 0) bonus += 20
  stats.totalXP = (stats.totalXP || 0) + bonus

  saveStats(stats)
  return { streak: data.streak }
}

// ========== XP System ==========

export function getTotalXP() {
  const stats = loadStats()
  return stats.totalXP || 0
}

export function saveReviewComplete(grade, count, edition) {
  const stats = loadStats()
  const ed = edition || getEdition()
  const gradeKey = getGradeKey(grade, ed)
  if (!stats[gradeKey]) stats[gradeKey] = { learned: 0, mastered: 0, wins: 0 }
  stats.totalXP = (stats.totalXP || 0) + count * 2
  saveStats(stats)
}

export function removeWrongWord(grade, word, edition) {
  const stats = loadStats()
  const ed = edition || getEdition()
  const wrongKey = getWrongKey(grade, ed)
  if (stats[wrongKey]) {
    stats[wrongKey] = stats[wrongKey].filter(w => w !== word)
    saveStats(stats)
  }
}

export function migrateXP() {
  const stats = loadStats()
  if (!stats._editionMigrated) {
    migrateToEditionScope()
  }
  if (stats._xpMigrated) return

  let xp = stats.totalXP || 0
  for (let g = 1; g <= 6; g++) {
    const gradeData = stats[`g${g}_pep`]
    if (gradeData) xp += (gradeData.mastered || 0) * 5
  }

  stats.totalXP = xp
  stats._xpMigrated = true
  saveStats(stats)
}

// ========== User Profile ==========

export function getUserProfile() {
  const stats = loadStats()
  return stats.userProfile || { name: '小学习者', avatar: 'user' }
}

export function saveUserProfile(profile) {
  const stats = loadStats()
  stats.userProfile = profile
  saveStats(stats)
}
