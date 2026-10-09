// Web Audio API sound synthesis for futuristic UI feedback

class SoundEffects {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Futuristic tick during item cycle
  public playTick(pitchMultiplier = 1) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      const freq = 480 * pitchMultiplier;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio autoplay policy or unavailable
    }
  }

  // Deceleration lock sound
  public playLock() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {
      // Audio autoplay policy
    }
  }

  // Winner fanfare chords
  public playWinner() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.06 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.65);
      });
    } catch {
      // Audio autoplay policy
    }
  }

  // --- FIFA / PES Style Sounds ---

  // FIFA Pack opening build-up tension riser
  public playFifaRiser(durationSec = 2.5) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Low frequency sub rumble
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "triangle";
      subOsc.frequency.setValueAtTime(55, now);
      subOsc.frequency.exponentialRampToValueAtTime(110, now + durationSec);
      subGain.gain.setValueAtTime(0.01, now);
      subGain.gain.linearRampToValueAtTime(0.08, now + durationSec * 0.85);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + durationSec + 0.05);

      // Sparkle rise
      const highOsc = this.ctx.createOscillator();
      const highGain = this.ctx.createGain();
      highOsc.type = "sawtooth";
      highOsc.frequency.setValueAtTime(220, now);
      highOsc.frequency.exponentialRampToValueAtTime(880, now + durationSec);
      highGain.gain.setValueAtTime(0.005, now);
      highGain.gain.linearRampToValueAtTime(0.03, now + durationSec * 0.9);
      highGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
      highOsc.connect(highGain);
      highGain.connect(this.ctx.destination);
      highOsc.start(now);
      highOsc.stop(now + durationSec + 0.05);
    } catch {
      // Audio autoplay policy
    }
  }

  // FIFA Walkout Gold Reveal Drop (bass boom + gold shimmer)
  public playFifaWalkoutDrop() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Heavy stadium sub drop (85Hz down to 30Hz)
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(90, now);
      bassOsc.frequency.exponentialRampToValueAtTime(28, now + 0.6);
      bassGain.gain.setValueAtTime(0.18, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      bassOsc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.95);

      // Gold Sparkle Arpeggio (Major 9th chord high shimmer)
      const shimmerNotes = [587.33, 739.99, 880.0, 1174.66, 1479.98, 1760.0]; // D5, F#5, A5, D6, F#6, A6
      shimmerNotes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + 0.04 + idx * 0.05);

        gain.gain.setValueAtTime(0.04, now + 0.04 + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04 + idx * 0.05 + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + 0.04 + idx * 0.05);
        osc.stop(now + 0.04 + idx * 0.05 + 0.75);
      });
    } catch {
      // Audio autoplay policy
    }
  }

  // --- WWE Royal Rumble & Elimination Chamber Sounds ---

  // Titantron countdown clock beep (sharp 880Hz arena tone)
  public playWweCountdownBeep(isFinal = false) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      const freq = isFinal ? 1200 : 750;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(isFinal ? 0.09 : 0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.25 : 0.1));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + (isFinal ? 0.26 : 0.12));
    } catch {
      // Audio autoplay policy
    }
  }

  // Iconic Royal Rumble 0-second arena horn buzzer!
  public playWweBuzzer() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Dual sawtooth low-pitch horn (the classic WWE arena horn)
      [146.83, 155.56].forEach((f) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.25);
      });

      // Arena Pyro explosion thud
      const pyroOsc = this.ctx.createOscillator();
      const pyroGain = this.ctx.createGain();
      pyroOsc.type = "sine";
      pyroOsc.frequency.setValueAtTime(120, now + 0.05);
      pyroOsc.frequency.exponentialRampToValueAtTime(25, now + 0.8);
      pyroGain.gain.setValueAtTime(0.16, now + 0.05);
      pyroGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      pyroOsc.connect(pyroGain);
      pyroGain.connect(this.ctx.destination);
      pyroOsc.start(now + 0.05);
      pyroOsc.stop(now + 0.95);
    } catch {
      // Audio autoplay policy
    }
  }

  // Elimination Chamber hydraulic steam jet release
  public playSteamRelease() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Metallic pod unlock clank
      const clank = this.ctx.createOscillator();
      const clankGain = this.ctx.createGain();
      clank.type = "triangle";
      clank.frequency.setValueAtTime(180, now);
      clank.frequency.exponentialRampToValueAtTime(60, now + 0.15);
      clankGain.gain.setValueAtTime(0.12, now);
      clankGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      clank.connect(clankGain);
      clankGain.connect(this.ctx.destination);
      clank.start(now);
      clank.stop(now + 0.25);

      // Noise generator for CO2 steam hiss
      const bufferSize = this.ctx.sampleRate * 0.45;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.4);
      filter.Q.setValueAtTime(2.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.1, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.45);
    } catch {
      // Audio autoplay policy
    }
  }
}

export const sound = new SoundEffects();
