/**
 * Procedural Web Audio API sound synthesizer for JetBot robot simulation
 * Zero external audio files (0 404 dependencies)
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private motorOsc1: OscillatorNode | null = null;
  private motorOsc2: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;
  private lidarOsc: OscillatorNode | null = null;
  private lidarGain: GainNode | null = null;
  private isInitialized = false;
  private isMuted = false;

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch {
      // AudioContext not supported or restricted
    }
  }

  public enable() {
    this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.isInitialized) {
      this.setupContinuousNodes();
      this.isInitialized = true;
    }
    this.isMuted = false;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.motorGain && this.ctx) {
      this.motorGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    if (this.lidarGain && this.ctx) {
      this.lidarGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  private setupContinuousNodes() {
    if (!this.ctx) return;

    // 1. DC Gear Motor Whine (PWM harmonic tone)
    this.motorOsc1 = this.ctx.createOscillator();
    this.motorOsc2 = this.ctx.createOscillator();
    this.motorGain = this.ctx.createGain();

    this.motorOsc1.type = 'sawtooth';
    this.motorOsc1.frequency.setValueAtTime(90, this.ctx.currentTime);

    this.motorOsc2.type = 'triangle';
    this.motorOsc2.frequency.setValueAtTime(180, this.ctx.currentTime);

    const motorFilter = this.ctx.createBiquadFilter();
    motorFilter.type = 'lowpass';
    motorFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

    this.motorGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.motorOsc1.connect(motorFilter);
    this.motorOsc2.connect(motorFilter);
    motorFilter.connect(this.motorGain);
    this.motorGain.connect(this.ctx.destination);

    this.motorOsc1.start();
    this.motorOsc2.start();

    // 2. RPLiDAR Spinning Turret Hum
    this.lidarOsc = this.ctx.createOscillator();
    this.lidarGain = this.ctx.createGain();

    this.lidarOsc.type = 'sine';
    this.lidarOsc.frequency.setValueAtTime(220, this.ctx.currentTime); // ~10-15Hz rotor spin harmonics

    this.lidarGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.lidarOsc.connect(this.lidarGain);
    this.lidarGain.connect(this.ctx.destination);

    this.lidarOsc.start();
  }

  public updateMotorAudio(leftSpeed: number, rightSpeed: number) {
    if (!this.ctx || !this.isInitialized || this.isMuted || !this.motorGain) return;

    const absL = Math.abs(leftSpeed);
    const absR = Math.abs(rightSpeed);
    const avgSpeed = (absL + absR) * 0.5;

    const targetGain = avgSpeed > 0.02 ? Math.min(0.12, 0.02 + avgSpeed * 0.08) : 0;
    const targetFreq1 = 80 + avgSpeed * 180;
    const targetFreq2 = targetFreq1 * 2;

    const now = this.ctx.currentTime;
    this.motorGain.gain.setTargetAtTime(targetGain, now, 0.05);

    if (this.motorOsc1 && this.motorOsc2) {
      this.motorOsc1.frequency.setTargetAtTime(targetFreq1, now, 0.05);
      this.motorOsc2.frequency.setTargetAtTime(targetFreq2, now, 0.05);
    }
  }

  public updateLidarAudio(spinning: boolean) {
    if (!this.ctx || !this.isInitialized || this.isMuted || !this.lidarGain) return;
    const targetGain = spinning ? 0.025 : 0;
    this.lidarGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
  }

  public playButtonClick() {
    if (!this.ctx || this.isMuted) return;
    this.enable();
    const now = this.ctx.currentTime;

    // High tactile snap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playCollisionSound(impactSpeed: number) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const vol = Math.min(0.25, Math.max(0.05, impactSpeed * 0.3));

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }
}

export const soundSynth = new SoundSynthesizer();
