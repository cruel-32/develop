import type { PageRender } from "../../router";
import { mountHtmlCssPlayground } from "../../htmlCssPlayground";
import { codeBlock } from "../../pageHelpers";

const TRACK_ELEMENT = `
<video controls>
  <source src="movie.webm" type="video/webm">
  <!-- kind: subtitles(번역 자막) · captions(청각장애인용, 효과음 포함)
       descriptions(화면 설명, 시각장애인용) · chapters · metadata -->
  <track kind="captions" src="captions-ko.vtt" srclang="ko" label="한국어" default>
  <track kind="subtitles" src="subtitles-en.vtt" srclang="en" label="English">
</video>
`;

const VTT_FORMAT = `
WEBVTT

00:00:00.000 --> 00:00:03.000
이 자막은 브라우저가 직접 렌더링합니다.

00:00:03.000 --> 00:00:08.000
별도의 자막 렌더러 라이브러리가 필요 없습니다.
`;

const PIP_API = `
const video = document.querySelector("video");

// 지원 여부 확인 - 일부 브라우저/일부 <video>(예: autoplay+muted 없는 경우)는 안 될 수 있다
if (document.pictureInPictureEnabled) {
  await video.requestPictureInPicture();
}

// 이미 PiP 중인 비디오는 document.pictureInPictureElement로 알 수 있다
if (document.pictureInPictureElement) {
  await document.exitPictureInPicture();
}

video.addEventListener("enterpictureinpicture", () => console.log("PiP 시작"));
video.addEventListener("leavepictureinpicture", () => console.log("PiP 종료"));
`;

const PLAYGROUND_HTML = `
<video id="video" width="100%" controls preload="metadata">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" type="video/webm">
  <track id="captions-track" kind="captions" srclang="ko" label="한국어" default>
</video>

<div class="controls">
  <button id="toggle-captions">자막 끄기</button>
  <button id="pip-btn">🖼 PiP로 보기</button>
</div>
`;

const PLAYGROUND_CSS = `
video { display: block; border-radius: 8px; background: #000; }

.controls {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
}

.controls button {
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  border: 1px solid #94a3b8;
  background: white;
  cursor: pointer;
}

.controls button.off {
  opacity: 0.55;
}
`;

const PLAYGROUND_SCRIPT = `
const video = document.getElementById("video");
const track = document.getElementById("captions-track");
const toggleBtn = document.getElementById("toggle-captions");
const pipBtn = document.getElementById("pip-btn");

// 실제 .vtt 파일 대신, 이 실습창 안에서 Blob으로 자막 파일을 즉석에서 만들어 붙인다
const vttText = [
  "WEBVTT",
  "",
  "00:00:00.000 --> 00:00:03.000",
  "이 자막은 브라우저가 직접 렌더링합니다.",
  "",
  "00:00:03.000 --> 00:00:08.000",
  "별도의 자막 렌더러 라이브러리가 필요 없습니다."
].join("\\n");
track.src = URL.createObjectURL(new Blob([vttText], { type: "text/vtt" }));

toggleBtn.addEventListener("click", () => {
  const textTrack = video.textTracks[0];
  const isShowing = textTrack.mode === "showing";
  textTrack.mode = isShowing ? "hidden" : "showing";
  toggleBtn.textContent = isShowing ? "자막 켜기" : "자막 끄기";
  toggleBtn.classList.toggle("off", isShowing);
});

pipBtn.addEventListener("click", async () => {
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      await video.requestPictureInPicture();
    }
  } catch (err) {
    console.warn("PiP를 사용할 수 없습니다:", err);
  }
});
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>&lt;track&gt; 자막/캡션 + Picture-in-Picture API</h1>
      <p>
        자막을 영상 위에 <code>position: absolute</code>로 텍스트를 겹쳐 그리던 시절과
        달리, <code>&lt;track&gt;</code> 엘리먼트는 <strong>WebVTT</strong>라는 표준
        포맷의 자막 파일을 브라우저가 직접 파싱하고 렌더링하게 맡깁니다. 스타일링,
        타이밍, 다국어 전환까지 브라우저 몫입니다.
      </p>
      ${codeBlock(TRACK_ELEMENT, "<track>의 kind별 용도")}

      <h2 id="vtt">WebVTT 포맷</h2>
      <p>
        <code>.vtt</code> 파일은 <code>WEBVTT</code> 헤더로 시작해, "시작시간 --&gt;
        종료시간" 다음 줄에 표시할 텍스트를 적는 아주 단순한 텍스트 포맷입니다.
      </p>
      ${codeBlock(VTT_FORMAT, "captions-ko.vtt")}
      <p>
        자막이 여러 개(<code>kind="captions"</code>/<code>"subtitles"</code> 등)일 때
        어떤 걸 보여줄지는 <code>video.textTracks</code>로 접근해
        <code>track.mode</code>를 <code>"showing"</code>/<code>"hidden"</code>/
        <code>"disabled"</code>로 바꿔 제어합니다.
      </p>

      <h2 id="pip">Picture-in-Picture API</h2>
      <p>
        다른 탭이나 앱으로 옮겨가도 영상이 작은 떠다니는 창으로 계속 재생되게 하려면
        <code>video.requestPictureInPicture()</code>를 호출하면 됩니다. 브라우저가
        OS 레벨의 떠 있는 창을 알아서 만들어주므로, 별도의 창 관리 코드가 필요 없습니다.
      </p>
      ${codeBlock(PIP_API, "Picture-in-Picture API")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        "자막 끄기"를 눌러 <code>track.mode</code>가 바뀌는 걸 확인해보세요(다시 누르면
        켜집니다). "PiP로 보기"를 누르면 이 영상이 브라우저 창 밖으로도 떠다니는 작은
        창으로 분리됩니다 — 이 페이지를 벗어나거나 다른 탭으로 이동해도 재생이
        계속되는지 확인해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountHtmlCssPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    html: `${PLAYGROUND_HTML}\n<script>${PLAYGROUND_SCRIPT}</script>`,
    css: PLAYGROUND_CSS,
  });
};
