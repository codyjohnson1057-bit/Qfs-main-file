<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Robinhood Alliance</title>
<link rel="apple-touch-icon" sizes="180x180" href="assets/images/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/images/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="512x512" href="assets/images/favicon-512x512.png">
    <link rel="icon" type="image/png" sizes="192x192" href="assets/images/favicon-192x192.png">
    <link rel="manifest" href="assets/images/site.webmanifest">
    <link rel="icon" favicon href="assets/images/favicon.ico">
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root{
    --gold:#D4AF37;
    --gold-bright:#F4D874;
    --green-deep:#0A3D2A;
    --green-mint:#98FF98;
    --ink:#020403;
    --panel:rgba(10,20,14,0.55);
  }

  *{box-sizing:border-box;}
  html,body{
    margin:0;
    height:100%;
    background:var(--ink);
    color:var(--gold);
    font-family:'Space Mono',monospace;
    overflow:hidden;
    -webkit-tap-highlight-color:transparent;
    touch-action:none;
  }

  /* ---------- matrix rain canvas ---------- */
  #rain{
    position:fixed;
    inset:0;
    z-index:0;
    display:block;
  }

  /* click/touch burst layer sits above rain, below content */
  #burst{
    position:fixed;
    inset:0;
    z-index:1;
    pointer-events:none;
  }

  /* vignette to keep center readable */
  #vignette{
    position:fixed;
    inset:0;
    z-index:2;
    pointer-events:none;
    background:radial-gradient(ellipse at center, rgba(2,4,3,0.15) 0%, rgba(2,4,3,0.65) 55%, rgba(2,4,3,0.92) 100%);
  }

  /* ---------- intro overlay ---------- */
  #overlay{
    position:fixed;
    inset:0;
    z-index:50;
    background:var(--ink);
    display:flex;
    align-items:center;
    justify-content:center;
    transition:opacity 1.4s ease, visibility 1.4s ease;
  }
  #overlay.hide{
    opacity:0;
    visibility:hidden;
  }
  .glitch-logo{
    font-family:'Orbitron',sans-serif;font-weight:900;
    font-size:clamp(1.3rem,5vw,2.5rem);
    letter-spacing:.35em;color:var(--gold-bright);
    text-shadow:0 0 18px rgba(212,175,55,.6);
    animation:flicker 2.6s infinite;text-align:center;
  }
  .glitch-sub{
    margin-top:.9rem;text-align:center;
    letter-spacing:.45em;font-size:.62rem;
    color:var(--green-mint);opacity:.8;
  }
  @keyframes flicker{
    0%,19%,21%,23%,80%,100%{opacity:1;}
    20%,22%,79%{opacity:.35;}
  }

  /* ---------- main stage ---------- */
  #stage{
    position:relative;
    z-index:10;
    min-height:100%;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    text-align:center;
    padding:6vh 1.5rem;
    perspective:1200px;
  }

  .eyebrow{
    font-size:.7rem;
    letter-spacing:.5em;
    color:var(--green-mint);
    margin-bottom:1.1rem;
    opacity:.8;
  }

  #wordmark{
    font-family:'Orbitron',sans-serif;
    font-weight:900;
    font-size:clamp(2.6rem,10vw,6rem);
    letter-spacing:.12em;
    line-height:1;
    color:var(--gold);
    transform-style:preserve-3d;
    will-change:transform;
    transition:transform .12s ease-out;
    text-shadow:
      0 1px 0 var(--green-deep),
      0 2px 0 var(--green-deep),
      0 3px 0 var(--green-deep),
      0 8px 24px rgba(0,0,0,.6),
      0 0 40px rgba(212,175,55,.25);
  }

  #tagline{
    font-family:'Orbitron',sans-serif;
    font-weight:600;
    font-size:clamp(.75rem,2vw,1rem);
    letter-spacing:.6em;
    color:var(--green-mint);
    margin-top:1.4rem;
    text-shadow:0 0 18px rgba(152,255,152,.5);
  }

  .divider{
    width:min(60vw,320px);
    height:1px;
    margin:2.6rem 0 2.4rem;
    background:linear-gradient(90deg, transparent, var(--gold) 50%, transparent);
    opacity:.6;
  }

  /* ---------- buttons ---------- */
  .btn-row{
    display:flex;
    gap:1.25rem;
    flex-wrap:wrap;
    justify-content:center;
    perspective:800px;
  }

  .btn{
    position:relative;
    display:inline-block;
    padding:1.15rem 3rem;
    font-family:'Orbitron',sans-serif;
    font-weight:700;
    font-size:1rem;
    letter-spacing:.25em;
    text-decoration:none;
    border:2px solid var(--gold);
    color:var(--gold);
    background:rgba(10,61,42,.15);
    transform-style:preserve-3d;
    will-change:transform;
    transition:transform .15s ease-out, background .3s ease, color .3s ease, box-shadow .3s ease;
    backdrop-filter:blur(2px);
  }
  .btn::before{
    content:'';
    position:absolute;
    inset:0;
    border:1px solid var(--green-mint);
    opacity:0;
    transform:translateZ(-8px);
    transition:opacity .3s ease;
  }
  .btn:hover{
    color:var(--ink);
    background:var(--gold);
    box-shadow:0 10px 30px rgba(212,175,55,.35), 0 0 40px rgba(152,255,152,.25);
  }
  .btn:hover::before{opacity:1;}
  .btn.primary{
    background:var(--gold);
    color:var(--ink);
  }
  .btn.primary:hover{
    background:var(--green-deep);
    color:var(--green-mint);
    border-color:var(--green-mint);
  }

  .welcome{
    margin-top:3.2rem;
    font-family:'Orbitron',sans-serif;
    font-weight:800;
    font-size:clamp(1.1rem,3.4vw,1.8rem);
    letter-spacing:.35em;
    color:var(--gold-bright);
    text-shadow:0 0 24px rgba(212,175,55,.5);
    animation:pulse 3.4s ease-in-out infinite;
  }
  @keyframes pulse{
    0%,100%{opacity:.85;}
    50%{opacity:1;text-shadow:0 0 34px rgba(152,255,152,.55);}
  }

  .hint{
    position:fixed;
    bottom:1.4rem;
    left:50%;
    transform:translateX(-50%);
    z-index:10;
    font-size:.65rem;
    letter-spacing:.3em;
    color:var(--green-mint);
    opacity:.5;
  }

   @media(prefers-reduced-motion:reduce){
    .glitch-logo,.btn-primary::after,#overlay{animation:none;transition:none;}
  }
</style>
</head>
<body>

<canvas id="rain"></canvas>
<canvas id="burst"></canvas>
<div id="vignette"></div>

<div id="overlay">
  <div class="text-center">
    <div class="glitch-logo">ANONYMOUS LEGION</div>
    <div class="glitch-sub">// establishing secure channel //</div>
  </div>
</div>

<div id="stage">
  <div class="eyebrow">FOR THOSE WHO TAKE BACK WHAT'S THEIRS</div>
  <h1 id="wordmark">ROBINHOOD</h1>
  <div id="tagline">ALLIANCE</div>

  <div class="divider"></div>

  <div class="btn-row">
    <a href="login.html" class="btn">SIGN IN</a>
    <a href="register.html" class="btn primary">SIGN UP</a>
  </div>

  <div class="welcome">WELCOME, DEAR ANON</div>
</div>

<div class="hint">// TAP ANYWHERE // </div>

<script>
/* ============ MATRIX RAIN ============ */
const rainCanvas = document.getElementById('rain');
const rctx = rainCanvas.getContext('2d');
let cols, drops, fontSize = 16;

function sizeRain(){
  rainCanvas.width = window.innerWidth;
  rainCanvas.height = window.innerHeight;
  cols = Math.floor(rainCanvas.width / fontSize);
  drops = new Array(cols).fill(0).map(()=> Math.random() * -100);
}
sizeRain();
window.addEventListener('resize', sizeRain);

const glyphs = '01';

function drawRain(){
  rctx.fillStyle = 'rgba(2,4,3,0.12)';
  rctx.fillRect(0,0,rainCanvas.width, rainCanvas.height);
  rctx.font = fontSize + 'px monospace';

  for(let i=0;i<cols;i++){
    const char = glyphs[Math.floor(Math.random()*glyphs.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;

    // leading character brighter
    rctx.fillStyle = Math.random() < 0.05 ? '#F4D874' : 'rgba(152,255,152,0.75)';
    rctx.fillText(char, x, y);

    if(y > rainCanvas.height && Math.random() > 0.975){
      drops[i] = 0;
    }
    drops[i]++;
  }
  requestAnimationFrame(drawRain);
}
requestAnimationFrame(drawRain);

/* ============ TOUCH / CLICK BURST ============ */
const burstCanvas = document.getElementById('burst');
const bctx = burstCanvas.getContext('2d');
function sizeBurst(){
  burstCanvas.width = window.innerWidth;
  burstCanvas.height = window.innerHeight;
}
sizeBurst();
window.addEventListener('resize', sizeBurst);

let particles = [];

function spawnBurst(x, y){
  const count = 14;
  for(let i=0;i<count;i++){
    const angle = (Math.PI*2*i)/count + Math.random()*0.4;
    const speed = 1.5 + Math.random()*3;
    particles.push({
      x, y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed,
      life: 1,
      char: Math.random() < 0.5 ? '0' : '1',
      size: fontSize + Math.random()*10
    });
  }
}

function drawBurst(){
  bctx.clearRect(0,0,burstCanvas.width, burstCanvas.height);
  particles.forEach(p=>{
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.018;
    bctx.globalAlpha = Math.max(p.life,0);
    bctx.fillStyle = '#D4AF37';
    bctx.shadowColor = '#98FF98';
    bctx.shadowBlur = 12;
    bctx.font = p.size + 'px monospace';
    bctx.fillText(p.char, p.x, p.y);
  });
  bctx.globalAlpha = 1;
  particles = particles.filter(p => p.life > 0);
  requestAnimationFrame(drawBurst);
}
requestAnimationFrame(drawBurst);

function pointFromEvent(e){
  if(e.touches && e.touches.length){
    return {x:e.touches[0].clientX, y:e.touches[0].clientY};
  }
  return {x:e.clientX, y:e.clientY};
}

window.addEventListener('pointerdown', e => {
  const {x,y} = pointFromEvent(e);
  spawnBurst(x,y);
});
window.addEventListener('touchstart', e => {
  const {x,y} = pointFromEvent(e);
  spawnBurst(x,y);
}, {passive:true});

/* ============ 3D TILT (mouse + touch) ============ */
const wordmark = document.getElementById('wordmark');
const buttons = document.querySelectorAll('.btn');

function applyTilt(el, x, y, strength){
  const rect = el.getBoundingClientRect();
  const relX = (x - rect.left) / rect.width - 0.5;
  const relY = (y - rect.top) / rect.height - 0.5;
  el.style.transform = `rotateX(${(-relY*strength).toFixed(2)}deg) rotateY(${(relX*strength).toFixed(2)}deg) translateZ(10px)`;
}

function resetTilt(el){
  el.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
}

function handleMove(e){
  const {x,y} = pointFromEvent(e);
  applyTilt(wordmark, x, y, 10);
  buttons.forEach(b => applyTilt(b, x, y, 14));
}

window.addEventListener('pointermove', handleMove);
window.addEventListener('touchmove', e => { handleMove(e); }, {passive:true});
window.addEventListener('pointerleave', () => {
  resetTilt(wordmark);
  buttons.forEach(resetTilt);
});

/* ============ INTRO OVERLAY ============ */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('overlay').classList.add('hide');
  }, 1600);
});
</script>
</body>
</html>
