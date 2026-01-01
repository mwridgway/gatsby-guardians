import { Howl, Howler } from 'howler';

/**
 * AudioManager wraps Howler.js for game audio
 * Handles music, SFX, volume control, and mobile audio unlock
 */
export class AudioManager {
  private music: Map<string, Howl>;
  private sfx: Map<string, Howl>;
  private currentMusic: Howl | null = null;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private unlocked: boolean = false;

  constructor() {
    this.music = new Map();
    this.sfx = new Map();

    this.setupMobileAudioUnlock();
  }

  /**
   * Setup mobile audio context unlock
   * iOS Safari requires user interaction before playing audio
   */
  private setupMobileAudioUnlock(): void {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (this.unlocked) return;

      // Play silent sound to unlock audio context
      const silentSound = new Howl({
        src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA=='],
        volume: 0,
      });

      silentSound.play();
      silentSound.on('end', () => {
        silentSound.unload();
      });

      // Resume audio context
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }

      this.unlocked = true;
      console.log('Audio context unlocked');

      // Remove listeners
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('touchend', unlock);
      document.removeEventListener('click', unlock);
    };

    document.addEventListener('touchstart', unlock);
    document.addEventListener('touchend', unlock);
    document.addEventListener('click', unlock);
  }

  /**
   * Load music track
   */
  public loadMusic(key: string, src: string[]): void {
    const howl = new Howl({
      src: src,
      loop: true,
      volume: this.musicVolume,
      html5: true, // Better for streaming music
    });

    this.music.set(key, howl);
  }

  /**
   * Load SFX (can be audio sprite)
   */
  public loadSFX(key: string, src: string[], sprite?: { [key: string]: [number, number] }): void {
    const howl = new Howl({
      src: src,
      volume: this.sfxVolume,
      sprite: sprite,
    });

    this.sfx.set(key, howl);
  }

  /**
   * Play music track
   */
  public playMusic(key: string, fadeIn: boolean = true): void {
    const track = this.music.get(key);
    if (!track) {
      console.warn(`Music track not found: ${key}`);
      return;
    }

    // Stop current music
    if (this.currentMusic && this.currentMusic !== track) {
      this.currentMusic.fade(this.musicVolume, 0, 500);
      this.currentMusic.once('fade', () => {
        this.currentMusic?.stop();
      });
    }

    // Play new music
    this.currentMusic = track;

    if (fadeIn) {
      track.volume(0);
      track.play();
      track.fade(0, this.musicVolume, 1000);
    } else {
      track.volume(this.musicVolume);
      track.play();
    }
  }

  /**
   * Stop current music
   */
  public stopMusic(fadeOut: boolean = true): void {
    if (!this.currentMusic) return;

    if (fadeOut) {
      this.currentMusic.fade(this.musicVolume, 0, 500);
      this.currentMusic.once('fade', () => {
        this.currentMusic?.stop();
        this.currentMusic = null;
      });
    } else {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  /**
   * Play sound effect
   */
  public playSFX(key: string, sprite?: string): void {
    const sound = this.sfx.get(key);
    if (!sound) {
      console.warn(`SFX not found: ${key}`);
      return;
    }

    if (sprite) {
      sound.play(sprite);
    } else {
      sound.play();
    }
  }

  /**
   * Set music volume (0-1)
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);

    // Update all music tracks
    this.music.forEach(track => {
      track.volume(this.musicVolume);
    });
  }

  /**
   * Set SFX volume (0-1)
   */
  public setSFXVolume(volume: number): void {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);

    // Update all SFX tracks
    this.sfx.forEach(sound => {
      sound.volume(this.sfxVolume);
    });
  }

  /**
   * Get current music volume
   */
  public getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * Get current SFX volume
   */
  public getSFXVolume(): number {
    return this.sfxVolume;
  }

  /**
   * Mute all audio
   */
  public muteAll(): void {
    Howler.mute(true);
  }

  /**
   * Unmute all audio
   */
  public unmuteAll(): void {
    Howler.mute(false);
  }

  /**
   * Clean up all audio
   */
  public destroy(): void {
    this.music.forEach(track => track.unload());
    this.sfx.forEach(sound => sound.unload());
    this.music.clear();
    this.sfx.clear();
    this.currentMusic = null;
  }
}
