// Sound utility using Web Audio API - generates tones without external files

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
  setTimeout(() => playTone(250, 0.15, 'square', 0.1), 150)
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