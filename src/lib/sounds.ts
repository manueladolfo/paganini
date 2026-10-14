// Motor de efectos de sonido Web Audio API (100% nativo sin dependencias externas)

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("tribo-muted", muted ? "true" : "false");
    }
  }

  public getMuted(): boolean {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tribo-muted") === "true";
    }
    return this.isMuted;
  }

  // Sonido de clic de teclado mecánico táctil (Cherry MX Blue / Brown click)
  public playMechanicalClick() {
    if (this.getMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Ruido blanco filtrado transitorio (el "clic" mecánico agudo)
      const bufferSize = ctx.sampleRate * 0.015; // 15ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(3200, now);
      filter.Q.setValueAtTime(3.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);

      // 2. Resonancia grave de la tecla ("thock" acústico del teclado)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.025);

      oscGain.gain.setValueAtTime(0.22, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (_) {}
  }

  // Sonido alegre de campana para tareas completadas o aprobadas (Éxito)
  public playSuccessChime() {
    if (this.getMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // Do5, Mi5, Sol5, Do6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch (_) {}
  }

  // Fanfarria festiva para el canje de recompensas y trofeos
  public playFanfare() {
    if (this.getMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Arpegio triunfal con brillo
      const chords = [
        { f: 523.25, t: 0 },
        { f: 659.25, t: 0.1 },
        { f: 783.99, t: 0.2 },
        { f: 1046.5, t: 0.32 },
        { f: 1318.51, t: 0.44 },
      ];

      chords.forEach(({ f, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.25, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + 0.7);
      });
    } catch (_) {}
  }

  // Campanita brillante para notificaciones
  public playNotificationBell() {
    if (this.getMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(987.77, now); // Si5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // Mi6

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.65);
    } catch (_) {}
  }

  // Tono de penalización o resta
  public playPenaltyTone() {
    if (this.getMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.25);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (_) {}
  }

  // Llanto cómico de caricatura (hombre llorando/quejándose desconsolado "¡Buaaah-wawawa!")
  public playCartoonCry() {
    if (this.getMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Sollozos cómicos sucesivos
      const sobs = [
        { start: 0.0, dur: 0.35, fStart: 210, fPeak: 280, fEnd: 190, vol: 0.22, wahFreq: 1100 },
        { start: 0.32, dur: 0.42, fStart: 230, fPeak: 320, fEnd: 175, vol: 0.28, wahFreq: 1300 },
        { start: 0.72, dur: 0.65, fStart: 260, fPeak: 290, fEnd: 130, vol: 0.32, wahFreq: 950 },
      ];

      sobs.forEach((sob) => {
        const t0 = now + sob.start;
        const tEnd = t0 + sob.dur;

        // 1. Oscilador principal (cuerdas vocales caricaturescas)
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";

        // Curva de tono de llanto: sube con sollozo y cae con tristeza
        osc.frequency.setValueAtTime(sob.fStart, t0);
        osc.frequency.linearRampToValueAtTime(sob.fPeak, t0 + sob.dur * 0.25);
        osc.frequency.exponentialRampToValueAtTime(sob.fEnd, tEnd);

        // 2. LFO de vibrato (temblor cómico de la voz llorosa)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(8.5, t0); // 8.5 Hz de trémolo rápido
        lfoGain.gain.setValueAtTime(14, t0); // Variación de +/- 14Hz
        lfo.connect(osc.frequency);

        // 3. Filtro formante vocal (efecto "wah-wah / buaah" de boca abriéndose)
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.Q.setValueAtTime(3.2, t0);
        filter.frequency.setValueAtTime(450, t0);
        filter.frequency.linearRampToValueAtTime(sob.wahFreq, t0 + sob.dur * 0.3);
        filter.frequency.exponentialRampToValueAtTime(400, tEnd);

        // 4. Ganancia y envolvente de volumen
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.linearRampToValueAtTime(sob.vol, t0 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, tEnd);

        // Conexiones
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        // Iniciar
        osc.start(t0);
        lfo.start(t0);
        osc.stop(tEnd + 0.02);
        lfo.stop(tEnd + 0.02);
      });
    } catch (_) {}
  }
}

export const sounds = new SoundEngine();
