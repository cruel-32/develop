import type { PageRender } from "../../router";
import { mountHtmlCssPlayground } from "../../htmlCssPlayground";
import { codeBlock } from "../../pageHelpers";

const NATIVE_CONTROLS = `
<!-- controls 속성 하나로 재생/일시정지/탐색바/볼륨까지 브라우저가 그려준다 -->
<video src="movie.webm" controls poster="thumbnail.jpg" preload="metadata"></video>
<audio src="song.mp3" controls></audio>
`;

const MEDIA_API = `
const video = document.querySelector("video");

video.play();            // Promise를 반환한다 - 자동재생 정책 때문에 실패할 수 있다
video.pause();
video.currentTime = 30;  // 30초 지점으로 이동(탐색)
video.volume = 0.5;      // 0~1
video.playbackRate = 1.5; // 1.5배속

video.addEventListener("timeupdate", () => {
  console.log(video.currentTime, "/", video.duration);
});
video.addEventListener("ended", () => console.log("재생 끝"));
`;

const PLAYGROUND_HTML = `
<video id="video" width="100%" preload="metadata">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" type="video/webm">
</video>

<div class="controls">
  <button id="play-pause">▶ 재생</button>
  <input id="seek" type="range" min="0" max="100" value="0" step="0.1">
  <span id="time">0:00 / 0:00</span>
  <input id="volume" type="range" min="0" max="1" value="1" step="0.01">
</div>
`;

const PLAYGROUND_CSS = `
video { display: block; border-radius: 8px; background: #000; }

.controls {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.6rem;
}

#play-pause {
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  border: 1px solid #94a3b8;
  background: white;
  cursor: pointer;
}

#seek { flex: 1; }
#volume { width: 5rem; }

#time {
  font-variant-numeric: tabular-nums;
  font-size: 0.8rem;
  color: #475569;
  white-space: nowrap;
}
`;

const PLAYGROUND_SCRIPT = `
const video = document.getElementById("video");
const playPause = document.getElementById("play-pause");
const seek = document.getElementById("seek");
const volume = document.getElementById("volume");
const time = document.getElementById("time");

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return m + ":" + s;
}

playPause.addEventListener("click", () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
});

video.addEventListener("play", () => (playPause.textContent = "⏸ 일시정지"));
video.addEventListener("pause", () => (playPause.textContent = "▶ 재생"));

video.addEventListener("loadedmetadata", () => {
  seek.max = String(video.duration);
});

// timeupdate: 재생 중 currentTime이 바뀔 때마다(대략 초당 4~66회) 발생 - 탐색바/시간 표시를 여기서 갱신한다
video.addEventListener("timeupdate", () => {
  seek.value = String(video.currentTime);
  time.textContent = formatTime(video.currentTime) + " / " + formatTime(video.duration);
});

// 사용자가 탐색바를 직접 움직이면 video.currentTime에 대입하는 것만으로 그 지점으로 이동(seek)한다
seek.addEventListener("input", () => {
  video.currentTime = Number(seek.value);
});

volume.addEventListener("input", () => {
  video.volume = Number(volume.value);
});
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>&lt;video&gt;/&lt;audio&gt; + HTMLMediaElement API</h1>
      <p>
        Flash나 별도 플러그인 없이, <code>&lt;video&gt;</code>/<code>&lt;audio&gt;</code>
        태그와 <code>controls</code> 속성만으로 재생/일시정지/탐색/볼륨 UI가 전부 갖춰진
        미디어 플레이어가 완성됩니다.
      </p>
      ${codeBlock(NATIVE_CONTROLS, "네이티브 controls")}

      <h2 id="api">HTMLMediaElement API로 직접 제어하기</h2>
      <p>
        네이티브 <code>controls</code>를 끄고 <code>&lt;video&gt;</code>/<code>&lt;audio&gt;</code>
        엘리먼트가 공통으로 상속하는 <code>HTMLMediaElement</code> 인터페이스를 직접 다루면,
        디자인에 맞는 커스텀 플레이어를 만들 수 있습니다. <code>play()</code>는
        <strong>Promise를 반환</strong>합니다 — 브라우저의 자동재생 정책 때문에 사용자
        상호작용 없이 호출하면 거부(reject)될 수 있어서입니다.
      </p>
      ${codeBlock(MEDIA_API, "재생/탐색/볼륨을 코드로 제어")}
      <p>
        탐색바(seek bar)는 두 방향으로 동기화해야 합니다: 재생 중에는
        <code>timeupdate</code> 이벤트로 <code>currentTime</code>이 바뀔 때마다 탐색바
        값을 갱신하고, 반대로 사용자가 탐색바를 드래그하면 그 값을
        <code>video.currentTime</code>에 대입해 그 지점으로 이동시킵니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        재생 버튼을 눌러보고, 탐색바를 드래그해 원하는 지점으로 이동해보세요. 볼륨
        슬라이더도 <code>video.volume</code>에 실시간으로 반영됩니다. (영상은 MDN이
        예제용으로 제공하는 CC0 라이선스 클립입니다.)
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountHtmlCssPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    html: `${PLAYGROUND_HTML}\n<script>${PLAYGROUND_SCRIPT}</script>`,
    css: PLAYGROUND_CSS,
  });
};
