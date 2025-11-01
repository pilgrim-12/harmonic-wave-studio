/**
 * Audio synthesizer using Web Audio API
 */

// Extend Window interface for Safari compatibility
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export class SignalAudioSynthesizer {
  private audioContext: AudioContext | null = null;
  private oscillatorNode: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  constructor() {
    // AudioContext will be created on first play (user interaction required)
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  private initAudioContext(): void {
    if (!this.audioContext) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.3; // Default volume
    }
  }

  /**
   * Play signal as audio
   * @param signalData - Array of Y-coordinates
   * @param frequency - Base frequency in Hz (e.g., 440 for A4)
   * @param duration - Duration in seconds
   */
  play(
    signalData: number[],
    frequency: number = 440,
    duration: number = 2
  ): void {
    if (this.isPlaying) {
      this.stop();
    }

    this.initAudioContext();

    if (!this.audioContext || !this.gainNode) {
      console.error("Audio context not initialized");
      return;
    }

    // Create periodic wave from signal data
    const real = new Float32Array(signalData.length);
    const imag = new Float32Array(signalData.length);

    // Copy signal data to real part (simplified approach)
    for (let i = 0; i < Math.min(signalData.length, 2048); i++) {
      real[i] = signalData[i];
    }

    const periodicWave = this.audioContext.createPeriodicWave(real, imag);

    // Create oscillator
    this.oscillatorNode = this.audioContext.createOscillator();
    this.oscillatorNode.setPeriodicWave(periodicWave);
    this.oscillatorNode.frequency.value = frequency;
    this.oscillatorNode.connect(this.gainNode);

    // Play
    this.oscillatorNode.start();
    this.isPlaying = true;

    // Auto-stop after duration
    if (duration > 0) {
      setTimeout(() => this.stop(), duration * 1000);
    }
  }

  /**
   * Stop playing audio
   */
  stop(): void {
    if (this.oscillatorNode && this.isPlaying) {
      this.oscillatorNode.stop();
      this.oscillatorNode.disconnect();
      this.oscillatorNode = null;
      this.isPlaying = false;
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Check if audio is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
