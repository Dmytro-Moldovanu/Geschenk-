// Für die bereits gebaute React-Version: Titelmotiv aus einzelnen
// beweglichen Elementen einsetzen. Quellcode: src/App.tsx.
(() => {
  const html = '<div class="hero-illustration" aria-hidden="true">\n            <span class="hero-orbit hero-orbit-one" ></span>\n            <span class="hero-orbit hero-orbit-two" ></span>\n            <span class="hero-spark hero-spark-one">✦</span>\n            <span class="hero-spark hero-spark-two">✦</span>\n            <span class="hero-spark hero-spark-three">✦</span>\n            <span class="hero-spark hero-spark-four">★</span>\n            <span class="hero-spark hero-spark-five">★</span>\n            <span class="hero-spark hero-spark-six">✧</span>\n            <img class="hero-gift-image" src="./geschenkbox.png" alt="" />\n            <span class="interest-icon icon-rocket" title="Weltraum">🚀</span>\n            <span class="interest-icon icon-palette" title="Kunst">🎨</span>\n            <span class="interest-icon icon-ball" title="Fußball">⚽</span>\n            <span class="interest-icon icon-headphones" title="Musik">🎧</span>\n            <span class="interest-icon icon-dino" title="Dinosaurier">🦕</span>\n            <span class="interest-icon icon-book" title="Lesen">📖</span>\n            <span class="interest-icon icon-brick" title="Bauen">🧱</span>\n            <span class="interest-icon icon-gamepad" title="Gaming">🎮</span>\n            <span class="interest-icon icon-robot" title="Robotik">🤖</span>\n            <span class="interest-icon icon-puzzle" title="Rätsel">🧩</span>\n            <span class="interest-icon icon-trophy" title="Sport">🏆</span>\n            <span class="interest-icon icon-basketball" title="Basketball">🏀</span>\n            <span class="interest-icon icon-music" title="Musizieren">🎵</span>\n            <span class="interest-icon icon-science" title="Wissenschaft">🔬</span>\n          </div>';
  let done = false;
  function mount() {
    if (done) return true;
    const target = document.querySelector('.hero-illustration');
    if (!target) return false;
    target.innerHTML = html;
    target.dataset.animated = 'true';
    done = true;
    return true;
  }
  if (!mount()) {
    const observer = new MutationObserver(() => { if (mount()) observer.disconnect(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
