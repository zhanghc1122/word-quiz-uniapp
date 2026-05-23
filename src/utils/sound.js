// Sound utility using Web Audio API + pre-recorded encouragement audio

let audioContext = null

function getContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

// Play a tone with frequency, duration, and type
function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  try {
    const ctx = getContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch (e) {
    // Silently fail if audio not supported
  }
}

// Musical note frequencies
const NOTE = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
  G5: 783.99, A5: 880.00,
}

// Predefined sounds
export function playCorrect() {
  // Rising arpeggio - happy sound
  playTone(NOTE.C4, 0.1, 'sine', 0.25)
  setTimeout(() => playTone(NOTE.E4, 0.1, 'sine', 0.25), 60)
  setTimeout(() => playTone(NOTE.G4, 0.15, 'sine', 0.3), 120)
}

export function playWrong() {
  // Gentle descending - encouraging
  playTone(NOTE.E4, 0.15, 'sine', 0.2)
  setTimeout(() => playTone(NOTE.D4, 0.2, 'sine', 0.2), 100)
}

export function playWin() {
  // Triumphant fanfare
  playTone(NOTE.C4, 0.15, 'sine', 0.3)
  setTimeout(() => playTone(NOTE.E4, 0.15, 'sine', 0.3), 100)
  setTimeout(() => playTone(NOTE.G4, 0.15, 'sine', 0.3), 200)
  setTimeout(() => playTone(NOTE.C5, 0.3, 'sine', 0.35), 300)
}

export function playLose() {
  // Soft gentle tone
  playTone(NOTE.A3, 0.2, 'sine', 0.2)
  setTimeout(() => playTone(NOTE.G3, 0.25, 'sine', 0.2), 150)
}

export function playCombo() {
  // Exciting rapid arpeggio
  playTone(NOTE.G5, 0.08, 'sine', 0.25)
  setTimeout(() => playTone(NOTE.E5, 0.08, 'sine', 0.25), 50)
  setTimeout(() => playTone(NOTE.C5, 0.1, 'sine', 0.3), 100)
}

export function playClick() {
  // Short click
  playTone(800, 0.05, 'sine', 0.15)
}

export function playTimeout() {
  // Gentle warning
  playTone(300, 0.2, 'square', 0.15)
  setTimeout(() => playTone(NOTE.D4, 0.15, 'square', 0.1), 150)
}

export function playBattleWin() {
  // Epic victory
  playTone(NOTE.C4, 0.12, 'sine', 0.3)
  setTimeout(() => playTone(NOTE.G4, 0.12, 'sine', 0.3), 80)
  setTimeout(() => playTone(NOTE.C5, 0.12, 'sine', 0.3), 160)
  setTimeout(() => playTone(NOTE.G5, 0.25, 'sine', 0.35), 240)
}

export function playBattleLose() {
  // Sympathetic
  playTone(NOTE.E4, 0.15, 'sine', 0.2)
  setTimeout(() => playTone(NOTE.C4, 0.2, 'sine', 0.2), 120)
}

// Pre-recorded encouragement audio
import good from '@/assets/audio/encouragements/good.mp3'
import nice from '@/assets/audio/encouragements/nice.mp3'
import got_it from '@/assets/audio/encouragements/got_it.mp3'
import great from '@/assets/audio/encouragements/great.mp3'
import awesome from '@/assets/audio/encouragements/awesome.mp3'
import amazing from '@/assets/audio/encouragements/amazing.mp3'
import fantastic from '@/assets/audio/encouragements/fantastic.mp3'
import super_audio from '@/assets/audio/encouragements/super.mp3'
import incredible from '@/assets/audio/encouragements/incredible.mp3'
import perfect from '@/assets/audio/encouragements/perfect.mp3'
import you_rock from '@/assets/audio/encouragements/you_rock.mp3'
import brilliant from '@/assets/audio/encouragements/brilliant.mp3'
import victory from '@/assets/audio/encouragements/victory.mp3'
import you_won from '@/assets/audio/encouragements/you_won.mp3'
import champion from '@/assets/audio/encouragements/champion.mp3'
import try_again from '@/assets/audio/encouragements/try_again.mp3'
import keep_going from '@/assets/audio/encouragements/keep_going.mp3'
import dont_give_up from '@/assets/audio/encouragements/dont_give_up.mp3'
import almost from '@/assets/audio/encouragements/almost.mp3'
import nice_try from '@/assets/audio/encouragements/nice_try.mp3'
import keep_it_up from '@/assets/audio/encouragements/keep_it_up.mp3'

const audioMap = {
  good, nice, got_it, great, awesome, amazing, fantastic,
  super: super_audio, incredible, perfect, you_rock, brilliant,
  victory, you_won, champion, try_again, keep_going, dont_give_up,
  almost, nice_try, keep_it_up,
}

function playAudio(src) {
  if (isMuted()) return
  try {
    const audio = new Audio(src)
    audio.play()
  } catch (e) {
    // Silently fail if audio not supported
  }
}

export function isMuted() {
  return uni.getStorageSync('soundMuted') === true
}

export function setMuted(muted) {
  uni.setStorageSync('soundMuted', muted)
}

const ENCOURAGEMENTS = {
  correct: ['good', 'nice', 'got_it'],
  great: ['great', 'awesome', 'amazing'],
  fantastic: ['fantastic', 'super', 'incredible'],
  perfect: ['perfect', 'you_rock', 'brilliant'],
  battleWin: ['victory', 'you_won', 'champion'],
  wrong: ['try_again', 'keep_going', 'dont_give_up'],
  almost: ['almost', 'nice_try', 'keep_it_up'],
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function speakCorrect(combo = 1) {
  const key = combo >= 5 ? randomPick(ENCOURAGEMENTS.fantastic)
    : combo >= 2 ? randomPick(ENCOURAGEMENTS.great)
    : randomPick(ENCOURAGEMENTS.correct)
  playAudio(audioMap[key])
}

export function speakWrong() {
  playAudio(audioMap[randomPick(ENCOURAGEMENTS.wrong)])
}

export function speakPerfect() {
  playAudio(audioMap[randomPick(ENCOURAGEMENTS.perfect)])
}

export function speakBattleWin() {
  playAudio(audioMap[randomPick(ENCOURAGEMENTS.battleWin)])
}

export function speakAlmost() {
  playAudio(audioMap[randomPick(ENCOURAGEMENTS.almost)])
}