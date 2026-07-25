let alarmIntervalId: any = null
let audioCtx: AudioContext | null = null

export const playTaskChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    audioCtx = new AudioContextClass()

    const osc1 = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
    osc1.frequency.setValueAtTime(739.99, audioCtx.currentTime + 0.15) // F#5

    gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6)

    osc1.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    osc1.start()
    osc1.stop(audioCtx.currentTime + 0.6)
  } catch (err) {
    console.warn('Audio Synthesis blocked or unsupported:', err)
  }
}

export const startTaskAlarm = () => {
  if (alarmIntervalId) return
  playTaskChime()
  alarmIntervalId = setInterval(() => {
    playTaskChime()
  }, 1200)
}

export const stopTaskAlarm = () => {
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId)
    alarmIntervalId = null
  }
  if (audioCtx) {
    audioCtx.close().catch(() => {})
    audioCtx = null
  }
}
