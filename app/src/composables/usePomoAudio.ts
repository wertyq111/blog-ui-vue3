import { ref } from "vue";

export interface NoiseTrack {
  id: string;
  label: string;
  src: string;
}

// 音频文件放在 public/audio/（用户后补）；缺失时 play() 静默失败，不报错
export const NOISE_TRACKS: NoiseTrack[] = [
  { id: "rain", label: "🌧️ 雨声", src: "/audio/rain.mp3" },
  { id: "forest", label: "🌲 森林", src: "/audio/forest.mp3" },
  { id: "wave", label: "🌊 海浪", src: "/audio/wave.mp3" },
];

// 模块级单例：整个页面共用一个白噪音播放器
let noiseEl: HTMLAudioElement | null = null;
const currentTrack = ref<string | null>(null);

export function usePomoAudio() {
  function playWhiteNoise(id: string, volume = 0.6) {
    const track = NOISE_TRACKS.find((t) => t.id === id);
    if (!track) return;
    if (!noiseEl) {
      noiseEl = new Audio();
      noiseEl.loop = true;
    }
    if (currentTrack.value !== id) noiseEl.src = track.src;
    noiseEl.volume = volume;
    currentTrack.value = id;
    noiseEl.play().catch(() => {
      /* 文件缺失或尚未用户交互，静默忽略 */
    });
  }

  function stopWhiteNoise() {
    noiseEl?.pause();
    currentTrack.value = null;
  }

  function setVolume(v: number) {
    if (noiseEl) noiseEl.volume = v;
  }

  function ding() {
    const a = new Audio("/audio/ding.mp3");
    a.volume = 0.8;
    a.play().catch(() => {
      /* 缺音效文件则静默 */
    });
  }

  return { tracks: NOISE_TRACKS, currentTrack, playWhiteNoise, stopWhiteNoise, setVolume, ding };
}
