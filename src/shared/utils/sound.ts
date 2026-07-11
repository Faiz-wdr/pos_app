/**
 * Plays a premium, dual-tone "pop" notification chime
 * using the browser's Web Audio API.
 */
export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    
    // First tone (lower pitch, short)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.08);
    
    // Second tone (higher pitch, slightly delayed for a "ping" effect)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.04); // G5 note
    gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04 + 0.15);
    
    osc2.start(ctx.currentTime + 0.04);
    osc2.stop(ctx.currentTime + 0.04 + 0.15);
  } catch (e) {
    console.warn('Failed to play notification sound:', e);
  }
};

/**
 * Plays an ascending, pleasant success chime
 */
export const playSuccessSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (ascending major triad)
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.07);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + index * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.07 + 0.12);
      
      osc.start(ctx.currentTime + index * 0.07);
      osc.stop(ctx.currentTime + index * 0.07 + 0.12);
    });
  } catch (e) {
    console.warn('Failed to play success sound:', e);
  }
};
