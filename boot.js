// Keep an immediately visible, non-interactive preview when scripts or WebGL are unavailable.
const stage = document.getElementById('stage');
const preview = document.getElementById('fallback-render');
const previewImage = document.getElementById('fallback-image');
const status = document.getElementById('loading');
const views = [...document.querySelectorAll('[data-view]')];
const state = window.JAZZ_STATE = { active3D: false, mode: 'static', reason: 'initial-preview' };
const previewSources = { side: previewImage.src, three: previewImage.dataset.three };
window.JAZZ_SHOW_STATIC = (message, reason = 'startup-failure') => {
  state.active3D = false; state.mode = 'static'; state.reason = reason;
  stage.classList.add('unsupported');
  stage.setAttribute('aria-label', '同じ3Dモデルから作成した確認用の静止画を表示しています');
  preview.hidden = false; status.hidden = false;
  status.textContent = message;
  document.getElementById('view-label').textContent = 'STATIC PREVIEW / 静止画';
  document.getElementById('interaction-hint').textContent = '現在は静止画表示です';
  document.querySelectorAll('[data-requires-3d]').forEach(el => el.disabled = true);
  views.forEach(el => el.disabled = !previewSources[el.dataset.view]);
  const canvas = stage.querySelector('canvas');
  if (canvas) canvas.hidden = true;
};
window.JAZZ_READY = () => {
  state.active3D = true; state.mode = '3d'; state.reason = null;
  document.getElementById('interaction-hint').textContent = 'ドラッグで回転 · スクロールでズーム';
  stage.classList.remove('unsupported');
  stage.setAttribute('aria-label', 'JAZZの3Dモデル。ドラッグで回転、スクロールで拡大縮小');
  preview.hidden = true; status.hidden = true;
  document.querySelectorAll('[data-requires-3d]').forEach(el => el.disabled = false);
  views.forEach(el => el.disabled = false);
};
views.forEach(button => button.addEventListener('click', () => {
  if (state.active3D || !previewSources[button.dataset.view]) return;
  previewImage.src = previewSources[button.dataset.view];
  views.forEach(el => el.classList.toggle('active', el === button));
}));
function reportStartupError(error) {
  console.warn('JAZZ 3D could not start:', error?.message || 'Unknown error');
  window.JAZZ_SHOW_STATIC('3Dを起動できなかったため、静止画を表示しています。回転・タイヤ調整には JavaScript と WebGL が使えるブラウザが必要です。', 'module-or-startup-error');
}
window.addEventListener('unhandledrejection', event => {
  if (!state.active3D) reportStartupError(event.reason);
});
// The first animation frame paints the image before model construction starts.
requestAnimationFrame(() => {
  status.textContent = '3Dを起動しています。表示中の画像は確認用の静止画です。';
  const watchdog = setTimeout(() => {
    if (!state.active3D) status.textContent = '確認用の静止画です。3Dが起動しない場合、この画面のまま待ち続ける必要はありません。ブラウザのWebGL対応をご確認ください。';
  }, 12000);
  import('./app.js?v=0.4.0').catch(reportStartupError).finally(() => clearTimeout(watchdog));
});
