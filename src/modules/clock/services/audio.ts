let alarmIntervalId: any = null
let audioCtx: AudioContext | null = null

export const playBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    audioCtx = new AudioContextClass()
    
    const osc1 = audioCtx.createOscillator()
    const osc2 = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime) // Tone 1 (A5)
    
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(440, audioCtx.currentTime) // Tone 2 (A4)

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35)

    osc1.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    osc1.start()
    osc2.start()
    
    osc1.stop(audioCtx.currentTime + 0.35)
    osc2.stop(audioCtx.currentTime + 0.35)
  } catch (err) {
    console.warn('Audio Synthesis blocked or unsupported:', err)
  }
}

export const startAlarm = () => {
  if (alarmIntervalId) return
  
  playBeep()
  alarmIntervalId = setInterval(() => {
    playBeep()
  }, 800)
}

export const stopAlarm = () => {
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId)
    alarmIntervalId = null
  }
  if (audioCtx) {
    audioCtx.close().catch(() => {})
    audioCtx = null
  }
}
