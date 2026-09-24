<!DOCTYPE html>
<html lang="en" class="light">

<head>
    <script>(function(){try{var t=localStorage.getItem("ra-theme");var f=null;try{f=localStorage.getItem("FinappDarkmode");}catch(x){}var mode=(t==="light"||t==="dark")?t:(f==="1"?"dark":f==="0"?"light":"light");if(mode==="light"){document.documentElement.classList.remove("dark");document.documentElement.classList.add("light");}else{document.documentElement.classList.add("dark");document.documentElement.classList.remove("light");}}catch(e){document.documentElement.classList.add("light");}})();</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Robinhood Alliance — Sign In</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800;900&amp;family=Space+Mono:wght@400;700&amp;display=swap" rel="stylesheet">
<link rel="apple-touch-icon" sizes="180x180" href="assets/images/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/images/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="512x512" href="assets/images/favicon-512x512.html">
    <link rel="icon" type="image/png" sizes="192x192" href="assets/images/favicon-192x192.html">
    <link rel="manifest" href="assets/images/site.webmanifest">
    <link rel="icon" favicon href="assets/images/favicon.ico">
<style>
  :root{
    --gold:#B8860B;
    --gold-bright:#D4A017;
    --green-deep:#064e3b;
    --green-mint:#059669;
    --ink:#e8f5f0;
    --panel:linear-gradient(155deg, rgba(16,185,129,0.22) 0%, rgba(255,255,255,0.48) 42%, rgba(236,253,245,0.55) 100%);
    --panel-solid:rgba(236,253,245,0.52);
    --panel-border:rgba(5,150,105,0.38);
    --red-alert:#dc2626;
  }

  *{box-sizing:border-box;margin:0;padding:0;}

  html,body{
    height:100%;
    background:linear-gradient(165deg,#f4fbf8 0%,#e6f4ef 45%,#eef8f4 100%) !important;
    color:var(--green-deep);
    font-family:'Space Mono',monospace;
    overflow:hidden;
    -webkit-tap-highlight-color:transparent;
  }
  html.light, html.light body{
    background:linear-gradient(165deg,#f4fbf8 0%,#e6f4ef 45%,#eef8f4 100%) !important;
  }

  /* ---- canvas layers ---- */
  #rain{position:fixed;inset:0;z-index:0;display:block;}
  #burst{position:fixed;inset:0;z-index:1;pointer-events:none;}
  #vignette{
    position:fixed;inset:0;z-index:2;pointer-events:none;
    background:radial-gradient(ellipse at center,
      rgba(232,245,240,0.05) 0%,
      rgba(230,244,239,0.35) 55%,
      rgba(210,235,225,0.65) 100%);
  }

  /* ---- scroll wrapper ---- */
  #scroll-wrap{
    position:fixed;inset:0;z-index:10;
    overflow-y:auto;
    overflow-x:hidden;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:safe center;
    padding:max(2vh,env(safe-area-inset-top,0px)) 1.1rem calc(3.5vh + env(safe-area-inset-bottom,0px));
    scroll-behavior:smooth;
    -webkit-overflow-scrolling:touch;
  }
  /* thin gold scrollbar */
  #scroll-wrap::-webkit-scrollbar{width:3px;}
  #scroll-wrap::-webkit-scrollbar-track{background:transparent;}
  #scroll-wrap::-webkit-scrollbar-thumb{background:var(--gold);border-radius:2px;}

  /* ---- top brand strip ---- */
  .brand-strip{
    display:flex;
    flex-direction:column;
    align-items:center;
    margin-bottom:2.4rem;
  }
  .brand-wordmark{
    font-family:'Orbitron',sans-serif;
    font-weight:900;
    font-size:clamp(1.55rem,5.5vw,2.8rem);
    letter-spacing:.18em;
    color:var(--gold);
    text-shadow:0 0 30px rgba(212,175,55,.40);
    will-change:transform;
    transition:transform .12s ease-out;
  }
  .brand-sub{
    font-family:'Orbitron',sans-serif;
    font-weight:600;
    font-size:.65rem;
    letter-spacing:.6em;
    color:var(--green-mint);
    margin-top:.45rem;
    text-shadow:0 0 12px rgba(152,255,152,.45);
  }

  /* ---- card ---- */
  .card{
    width:100%;
    max-width:min(480px,100%);
    background:var(--panel-solid);
    background-image:
      linear-gradient(145deg, rgba(16,185,129,0.28) 0%, transparent 45%),
      linear-gradient(225deg, rgba(212,175,55,0.12) 0%, transparent 40%),
      linear-gradient(180deg, rgba(255,255,255,0.55), rgba(236,253,245,0.42));
    border:1px solid var(--panel-border);
    backdrop-filter:blur(28px) saturate(1.55);-webkit-backdrop-filter:blur(28px) saturate(1.55);
    padding:2.6rem 2.2rem 2.4rem;
    padding-bottom:calc(2.4rem + env(safe-area-inset-bottom,0px));
    position:relative;
    border-radius:1.75rem;
    overflow-x:hidden;
    overflow-y:auto;
    -webkit-overflow-scrolling:touch;
    max-height:min(92dvh,920px);
    box-shadow:
      0 20px 50px rgba(15,80,60,0.14),
      0 0 0 1px rgba(16,185,129,0.12),
      0 0 40px rgba(16,185,129,0.12),
      inset 0 1px 0 rgba(255,255,255,0.65),
      inset 0 -1px 0 rgba(5,150,105,0.08);
    will-change:transform;transition:transform .12s ease-out,box-shadow .35s ease,border-color .35s ease;
  }
  /* beat glass-dashboard flat white overrides */
  html.light #login-card,
  html.light .card#login-card,
  html:not(.dark) #login-card,
  html:not(.dark) .card#login-card{
    clip-path:none !important;
    -webkit-clip-path:none !important;
    transform:none !important;
    border-radius:1.75rem !important;
    width:100% !important;
    max-width:min(560px,94vw) !important;
    padding:2.6rem 2.2rem 2.4rem !important;
    background-image:
      linear-gradient(145deg, rgba(16,185,129,0.28) 0%, transparent 45%),
      linear-gradient(225deg, rgba(212,175,55,0.12) 0%, transparent 40%),
      linear-gradient(180deg, rgba(255,255,255,0.55), rgba(236,253,245,0.42)) !important;
    background-color: rgba(236,253,245,0.52) !important;
    border:1px solid rgba(5,150,105,0.38) !important;
    backdrop-filter:blur(28px) saturate(1.55) !important;
    -webkit-backdrop-filter:blur(28px) saturate(1.55) !important;
    box-shadow:
      0 20px 50px rgba(15,80,60,0.14),
      0 0 0 1px rgba(16,185,129,0.12),
      0 0 40px rgba(16,185,129,0.12),
      inset 0 1px 0 rgba(255,255,255,0.65) !important;
    color: var(--green-deep) !important;
    max-height:min(92dvh,920px) !important;
    overflow-y:auto !important;
  }
  /* animated border glow on card */
  .card::before{
    content:'';
    position:absolute;
    inset:-1px;
    background:linear-gradient(135deg,var(--gold),transparent 40%,var(--green-mint) 100%);
    border-radius:1.8rem;pointer-events:none;
    z-index:-1;
    opacity:.25;
    transition:opacity .4s ease;
  }
  .card:hover::before{opacity:.5;}

  .card-header{
    text-align:center;
    margin-bottom:1.8rem;
  }
  .card-eyebrow{
    font-size:.6rem;
    letter-spacing:.5em;
    color:var(--green-mint);
    margin-bottom:.7rem;
    opacity:.7;
  }
  .card-title{
    font-family:'Orbitron',sans-serif;
    font-weight:800;
    font-size:clamp(1.1rem,3vw,1.5rem);
    letter-spacing:.2em;
    color:var(--gold-bright);
  }
  .card-sub{
    font-size:.7rem;
    color:rgba(5,150,105,.75);
    margin-top:.45rem;
    letter-spacing:.12em;
  }

  /* security badge */
  .sec-badge{
    display:flex;
    align-items:center;
    gap:.55rem;
    background:rgba(10,61,42,.35);
    border:1px solid rgba(152,255,152,.2);
    border-radius:0.9rem;padding:.6rem .9rem;
    margin-bottom:1.8rem;
    font-size:.6rem;
    letter-spacing:.2em;
    color:var(--green-mint);
  }
  .sec-badge span.lock{font-size:.85rem;}
  .sec-badge strong{color:var(--green-mint);}

  /* ---- form ---- */
  .field{margin-bottom:1.4rem;}
  .field-label{
    display:block;
    font-size:.65rem;
    letter-spacing:.3em;
    color:rgba(212,175,55,.75);
    margin-bottom:.55rem;
  }
  .field-label .req{color:var(--red-alert);margin-left:.2rem;}

  .input-wrap{position:relative;}
  .input-wrap .field-icon{
    position:absolute;
    left:.85rem;
    top:50%;
    transform:translateY(-50%);
    font-size:.85rem;
    color:rgba(152,255,152,.5);
    pointer-events:none;
    transition:color .3s;
  }

  input[type="email"],
  input[type="password"]{
    width:100%;
    background:rgba(2,4,3,.6);
    border:1px solid rgba(212,175,55,.3);
    color:var(--gold);
    font-family:'Space Mono',monospace;
    font-size:.8rem;
    padding:.85rem .9rem .85rem 2.6rem;
    letter-spacing:.08em;
    outline:none;
    transition:border-color .3s ease, box-shadow .3s ease, background .3s ease;
    /* cut-corner top-right */
    border-radius:0.95rem;
    -webkit-clip-path:none;clip-path:none;
  }
  input::placeholder{color:rgba(212,175,55,.3);letter-spacing:.05em;}
  input:focus{
    border-color:var(--gold);
    background:rgba(10,61,42,.25);
    box-shadow:0 0 20px rgba(212,175,55,.12), inset 0 0 10px rgba(152,255,152,.04);
  }
  input:focus + .field-icon,
  .input-wrap:focus-within .field-icon{color:var(--gold);}

  /* password toggle */
  .eye-btn{
    position:absolute;
    right:.75rem;
    top:50%;
    transform:translateY(-50%);
    background:none;
    border:none;
    cursor:pointer;
    color:rgba(212,175,55,.45);
    font-size:.8rem;
    padding:.2rem;
    transition:color .3s;
    font-family:'Space Mono',monospace;
  }
  .eye-btn:hover{color:var(--green-mint);}

  /* forgot link row */
  .field-meta{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:.55rem;
  }
  .forgot{
    font-size:.6rem;
    letter-spacing:.2em;
    color:rgba(152,255,152,.65);
    text-decoration:none;
    transition:color .3s;
  }
  .forgot:hover{color:var(--green-mint);}

  /* remember row */
  .remember-row{
    display:flex;
    align-items:center;
    gap:.7rem;
    margin-bottom:1.8rem;
  }
  .remember-row input[type="checkbox"]{
    appearance:none;
    -webkit-appearance:none;
    width:16px;height:16px;
    border:1px solid rgba(212,175,55,.4);
    background:rgba(2,4,3,.6);
    cursor:pointer;
    position:relative;
    flex-shrink:0;
    clip-path:none;
    -webkit-clip-path:none;
    padding:0;
  }
  .remember-row input[type="checkbox"]:checked{
    background:var(--gold);
    border-color:var(--gold);
  }
  .remember-row input[type="checkbox"]:checked::after{
    content:'✓';
    position:absolute;
    inset:0;
    display:flex;
    align-items:center;
    justify-content:center;
    color:var(--ink);
    font-size:.65rem;
    font-weight:900;
  }
  .remember-label{
    font-size:.62rem;
    letter-spacing:.15em;
    color:rgba(212,175,55,.6);
    cursor:pointer;
  }

  /* divider */
  .form-divider{
    height:1px;
    background:linear-gradient(90deg,transparent,rgba(212,175,55,.35) 50%,transparent);
    margin:1.6rem 0;
  }

  /* ---- primary btn ---- */
  .btn-primary{
    width:100%;
    padding:1.05rem;
    font-family:'Orbitron',sans-serif;
    font-weight:700;
    font-size:.85rem;
    letter-spacing:.35em;
    text-transform:uppercase;
    border:2px solid var(--gold);
    background:var(--gold);
    color:var(--ink);
    cursor:pointer;
    position:relative;
    overflow:hidden;
    border-radius:1.15rem;clip-path:none;-webkit-clip-path:none;
    transition:background .3s ease, color .3s ease, box-shadow .3s ease;
    will-change:transform;
  }
  .btn-primary::after{
    content:'';
    position:absolute;
    inset:0;
    background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.15) 50%,transparent 70%);
    transform:translateX(-100%);
    transition:transform .5s ease;
  }
  .btn-primary:hover::after{transform:translateX(100%);}
  .btn-primary:hover{
    background:var(--green-deep);
    color:var(--green-mint);
    border-color:var(--green-mint);
    box-shadow:0 8px 28px rgba(212,175,55,.3), 0 0 40px rgba(152,255,152,.2);
  }
  .btn-primary:active{transform:scale(.98);}

  /* loading state */
  .btn-primary.loading{
    pointer-events:none;
    opacity:.75;
  }
  .btn-primary.loading::before{
    content:'';
    display:inline-block;
    width:12px;height:12px;
    border:2px solid currentColor;
    border-top-color:transparent;
    border-radius:50%;
    animation:spin .7s linear infinite;
    margin-right:.6rem;
    vertical-align:middle;
  }
  @keyframes spin{to{transform:rotate(360deg);}}

  /* error message */
  .err-msg{
    display:none;
    background:rgba(255,76,76,.12);
    border:1px solid rgba(255,76,76,.4);
    color:#FF6B6B;
    font-size:.65rem;
    letter-spacing:.15em;
    padding:.6rem .8rem;
    margin-bottom:1.2rem;
    animation:shake .35s ease;
  }
  .err-msg.show{display:block;}
  @keyframes shake{
    0%,100%{transform:translateX(0);}
    25%{transform:translateX(-5px);}
    75%{transform:translateX(5px);}
  }

  /* ---- signup nudge ---- */
  .signup-nudge{
    text-align:center;
    margin-top:1.8rem;
    font-size:.62rem;
    letter-spacing:.2em;
    color:rgba(212,175,55,.5);
  }
  .signup-nudge a{
    color:var(--green-mint);
    text-decoration:none;
    font-weight:700;
    transition:text-shadow .3s;
  }
  .signup-nudge a:hover{text-shadow:0 0 10px rgba(152,255,152,.6);}

  /* ---- footer ---- */
  .page-footer{
    margin-top:2rem;
    font-size:.55rem;
    letter-spacing:.3em;
    color:rgba(152,255,152,.35);
    text-align:center;
  }

  /* ---- intro overlay ---- */
  #overlay{
    position:fixed;inset:0;z-index:80;
    background:#e8f5f0;
    display:flex;align-items:center;justify-content:center;
    transition:opacity 1.2s ease, visibility 1.2s ease;
  }
  #overlay.hide{opacity:0;visibility:hidden;pointer-events:none;}
  .glitch-logo{
    font-family:'Orbitron',sans-serif;
    font-weight:900;
    font-size:clamp(1.4rem,5vw,2.6rem);
    letter-spacing:.35em;
    color:var(--gold-bright);
    text-shadow:0 0 18px rgba(212,175,55,.6);
    animation:flicker 2.6s infinite;
    text-align:center;
  }
  .glitch-sub{
    margin-top:.9rem;
    text-align:center;
    letter-spacing:.45em;
    font-size:.65rem;
    color:var(--green-mint);
    opacity:.8;
  }
  @keyframes flicker{
    0%,19%,21%,23%,80%,100%{opacity:1;}
    20%,22%,79%{opacity:.3;}
  }

  /* SVG icons inline */
  .icon-mail::before{content:'✉';}
  .icon-lock::before{content:'🔒';}
  .icon-eye-off::before{content:'◉';}

  @media (max-width:520px){
    .card{
      padding:1.7rem 1.15rem calc(2rem + env(safe-area-inset-bottom,0px));
      max-height:min(90dvh,920px);
      border-radius:1.35rem;
    }
    .brand-strip{margin-bottom:1.5rem;}
    .brand-wordmark{font-size:clamp(1.35rem,6vw,2.2rem);}
    .card-title{font-size:clamp(1rem,4vw,1.3rem);}
  }
  @media (prefers-reduced-motion:reduce){
    .glitch-logo,.btn-primary::after,#overlay{animation:none;transition:none;}
  }

  
  /* ---- DARK = original robinhood-alliance.web.app matrix / cut-glass auth ---- */
  html.dark{
    --gold:#D4AF37;
    --gold-bright:#F4D874;
    --green-deep:#0A3D2A;
    --green-mint:#98FF98;
    --ink:#020403;
    --panel:rgba(10,20,14,0.72);
    --panel-solid:#0a140f;
    --panel-border:rgba(212,175,55,0.28);
    --red-alert:#FF4C4C;
  }
  html.dark, html.dark body{
    background:#020403 !important;
    background-image:none !important;
    color:#D4AF37 !important;
    font-family:'Space Mono',monospace !important;
  }
  html.dark body.glass-ui{
    background:#020403 !important;
    background-image:none !important;
    color:#D4AF37 !important;
    font-family:'Space Mono',monospace !important;
  }
  html.dark body.glass-ui::before{ display:none !important; content:none !important; }
  html.dark #vignette{
    background:radial-gradient(ellipse at center,
      rgba(2,4,3,0.10) 0%,
      rgba(2,4,3,0.60) 55%,
      rgba(2,4,3,0.93) 100%) !important;
  }
  html.dark #overlay{ background:#020403 !important; }
  html.dark .glitch-logo{ color:#F4D874 !important; text-shadow:0 0 18px rgba(212,175,55,.6) !important; }
  html.dark .glitch-sub{ color:#98FF98 !important; }
  html.dark .brand-wordmark{ color:#D4AF37 !important; text-shadow:0 0 30px rgba(212,175,55,.40) !important; }
  html.dark .brand-sub{ color:#98FF98 !important; text-shadow:0 0 12px rgba(152,255,152,.45) !important; }
  html.dark .card,
  html.dark #login-card,
  html.dark #reg-card,
  html.dark .card#login-card,
  html.dark .card#reg-card,
  html.dark body.glass-ui #login-card,
  html.dark body.glass-ui #reg-card,
  html.dark body.glass-ui .card#login-card,
  html.dark body.glass-ui .card#reg-card{
    background:#0a140f !important;
    background-image:none !important;
    border:1px solid rgba(212,175,55,0.28) !important;
    color:#D4AF37 !important;
    border-radius:0 !important;
    box-shadow:none !important;
    backdrop-filter:none !important;-webkit-backdrop-filter:none !important;
    clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,18px 100%,0 calc(100% - 18px)) !important;
    -webkit-clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,18px 100%,0 calc(100% - 18px)) !important;
  }
  html.dark .card::before{
    border-radius:0 !important;
    clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,18px 100%,0 calc(100% - 18px)) !important;
    -webkit-clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,18px 100%,0 calc(100% - 18px)) !important;
    opacity:.25 !important;
  }
  html.dark .card-eyebrow,
  html.dark .sec-badge{ color:#98FF98 !important; }
  html.dark .sec-badge{
    background:rgba(10,61,42,.35) !important;
    border:1px solid rgba(152,255,152,.2) !important;
    border-radius:0 !important;
  }
  html.dark .card-title{ color:#F4D874 !important; }
  html.dark .card-sub{ color:rgba(152,255,152,.6) !important; }
  html.dark .field-label{ color:rgba(212,175,55,.75) !important; }
  html.dark .card input,
  html.dark .card select,
  html.dark #login-card input,
  html.dark #login-card select,
  html.dark #reg-card input,
  html.dark #reg-card select,
  html.dark body.glass-ui .card .input-wrap input,
  html.dark body.glass-ui .card .input-wrap select{
    background:rgba(2,4,3,.6) !important;
    border:1px solid rgba(212,175,55,.3) !important;
    color:#D4AF37 !important;
    border-radius:0 !important;
    clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%) !important;
    -webkit-clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%) !important;
  }
  html.dark .card input::placeholder,
  html.dark #login-card input::placeholder,
  html.dark #reg-card input::placeholder{ color:rgba(212,175,55,.3) !important; }
  html.dark .card input:focus,
  html.dark #login-card input:focus,
  html.dark #reg-card input:focus{
    border-color:#D4AF37 !important;
    background:rgba(10,61,42,.25) !important;
    box-shadow:0 0 20px rgba(212,175,55,.12), inset 0 0 10px rgba(152,255,152,.04) !important;
  }
  html.dark .field-icon{ color:rgba(152,255,152,.5) !important; }
  html.dark .eye-btn{ color:rgba(212,175,55,.45) !important; }
  html.dark .forgot{ color:rgba(152,255,152,.65) !important; }
  html.dark .remember-label{ color:rgba(212,175,55,.7) !important; }
  html.dark .btn-primary,
  html.dark body.glass-ui .card .btn-primary{
    background:#D4AF37 !important;
    color:#020403 !important;
    border:2px solid #D4AF37 !important;
    border-radius:0 !important;
    clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%) !important;
    -webkit-clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%) !important;
    box-shadow:none !important;
  }
  html.dark .btn-primary:hover{
    background:#0A3D2A !important;
    color:#98FF98 !important;
    border-color:#98FF98 !important;
  }
  html.dark .form-divider{
    background:linear-gradient(90deg,transparent,rgba(212,175,55,.35) 50%,transparent) !important;
  }
  html.dark .signup-nudge{ color:rgba(152,255,152,.55) !important; }
  html.dark .signup-nudge a{ color:#D4AF37 !important; }
  html.dark .page-footer{ color:rgba(152,255,152,.35) !important; }
  html.dark .err-msg{
    background:rgba(255,76,76,.12) !important;
    border-color:rgba(255,76,76,.35) !important;
    color:#FF4C4C !important;
  }
  html.dark .ra-theme-fab,
  html.dark #raThemeToggle.ra-theme-fab{
    background:rgba(8,18,20,0.7) !important;
    border-color:rgba(212,175,55,0.35) !important;
    color:#F4D874 !important;
  }


  html.light #raThemeToggle.ra-theme-fab {
    background: rgba(236,253,245,0.85) !important;
    border-color: rgba(5,150,105,0.45) !important;
    color: #064e3b !important;
    box-shadow: 0 4px 14px rgba(5,80,60,0.18) !important;
  }

</style>
<script src="/static/js/ra-api.js?v=1790304800"></script>
    <link rel="stylesheet" href="static/css/ra-auth.css?v=1790304800">
</head>
<body>
<button type="button" id="raThemeToggle" class="headerButton ra-theme-toggle ra-theme-fab" aria-label="Switch theme" title="Theme" style="position:fixed;top:max(12px,env(safe-area-inset-top));right:12px;z-index:10001;width:42px;height:42px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(212,175,55,0.45);background:rgba(2,4,3,0.92);color:#F4D874;cursor:pointer;pointer-events:auto;box-shadow:0 4px 16px rgba(0,0,0,0.55);font-size:20px;line-height:1;">
  <span class="ra-theme-emoji" aria-hidden="true">☀</span>
</button>


<!-- matrix rain -->
<canvas id="rain"></canvas>
<!-- burst canvas -->
<canvas id="burst"></canvas>
<!-- vignette -->
<div id="vignette"></div>

<!-- intro overlay -->
<div id="overlay">
  <div>
    <div class="glitch-logo">ANONYMOUS LEGION</div>
    <div class="glitch-sub">// establishing secure channel //</div>
  </div>
</div>

<!-- main scroll content -->
<div id="scroll-wrap">

  <!-- brand -->
  <div class="brand-strip">
    <a href="index.html" style="text-decoration:none;">
      <div class="brand-wordmark" id="wordmark">ROBINHOOD</div>
    </a>
    <div class="brand-sub">ALLIANCE</div>
  </div>

  <!-- card -->
  <div class="card" id="login-card">

    <div class="card-header">
      <div class="card-eyebrow">SECURE ACCESS PORTAL</div>
      <div class="card-title">SIGN-IN</div>
      <div class="card-sub">// authenticate your identity //</div>
    </div>

    <!-- security notice -->

    <!-- error banner -->
    <div class="err-msg" id="err-msg">⚠ Invalid credentials. Access denied.</div>

    <!-- form -->
    <form id="login-form" novalidate>

      <!-- email -->
      <div class="field">
        <label class="field-label" for="email">EMAIL ADDRESS <span class="req">*</span></label>
        <div class="input-wrap">
          <span class="field-icon icon-mail"></span>
          <input type="email" id="email" name="email" placeholder="operative@domain.net" autocomplete="email" required>
        </div>
      </div>

      <!-- password -->
      <div class="field">
        <div class="field-meta">
          <label class="field-label" for="password-input" style="margin-bottom:0;">PASSWORD <span class="req">*</span></label>
          <a href="password/reset.html" class="forgot">FORGOT?</a>
        </div>
        <div class="input-wrap">
          <span class="field-icon icon-lock"></span>
          <input type="password" id="password-input" name="password" placeholder="••••••••••••" autocomplete="current-password" required>
          <button type="button" class="eye-btn" id="eye-btn" aria-label="Toggle password">◉</button>
        </div>
      </div>

      <!-- remember -->
      <div class="remember-row">
        <input type="checkbox" id="remember" name="remember">
        <label class="remember-label" for="remember">KEEP ME AUTHENTICATED</label>
      </div>

      <!-- submit -->
      <button type="submit" class="btn-primary" id="loginBtn">LOG IN</button>

    </form>

    <div class="form-divider"></div>

    <div class="signup-nudge">
      NO ACCOUNT? &nbsp;<a href="/register">SIGN-UP →</a>
    </div>

  </div><!-- /card -->

  <div class="page-footer">© 2026 ROBINHOOD ALLIANCE // ALL RIGHTS RESERVED</div>

</div><!-- /scroll-wrap -->



<script>
/* ============ MATRIX RAIN ============ */
const rainCanvas = document.getElementById('rain');
const rctx = rainCanvas.getContext('2d');
let cols, drops, fontSize = 16;

function sizeRain(){
  rainCanvas.width  = window.innerWidth;
  rainCanvas.height = window.innerHeight;
  cols  = Math.floor(rainCanvas.width / fontSize);
  drops = new Array(cols).fill(0).map(() => Math.random() * -100);
}
sizeRain();
window.addEventListener('resize', sizeRain);

/* Theme-aware matrix trail */
function rainTrail(){
  var dark = document.documentElement.classList.contains('dark');
  return dark ? 'rgba(2,4,3,0.12)' : 'rgba(232, 245, 240, 0.14)';
}
function rainGlyph(){
  var dark = document.documentElement.classList.contains('dark');
  if (dark) return Math.random() < 0.05 ? '#F4D874' : 'rgba(152,255,152,0.75)';
  return Math.random() < 0.05 ? '#B8860B' : 'rgba(5,150,105,0.45)';
}


function drawRain(){
  rctx.fillStyle = rainTrail();
  rctx.fillRect(0, 0, rainCanvas.width, rainCanvas.height);
  rctx.font = fontSize + 'px monospace';
  for(let i = 0; i < cols; i++){
    const char = Math.random() < 0.5 ? '0' : '1';
    const x = i * fontSize, y = drops[i] * fontSize;
    rctx.fillStyle = rainGlyph();
    rctx.fillText(char, x, y);
    if(y > rainCanvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
  requestAnimationFrame(drawRain);
}
requestAnimationFrame(drawRain);

/* ============ BURST ============ */
const burstCanvas = document.getElementById('burst');
const bctx = burstCanvas.getContext('2d');
function sizeBurst(){
  burstCanvas.width  = window.innerWidth;
  burstCanvas.height = window.innerHeight;
}
sizeBurst();
window.addEventListener('resize', sizeBurst);

let particles = [];
function spawnBurst(x, y){
  for(let i = 0; i < 14; i++){
    const angle = (Math.PI * 2 * i / 14) + Math.random() * 0.4;
    const speed = 1.5 + Math.random() * 3;
    particles.push({ x, y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 1, char: Math.random() < 0.5 ? '0' : '1',
      size: fontSize + Math.random() * 10
    });
  }
}
function drawBurst(){
  bctx.clearRect(0, 0, burstCanvas.width, burstCanvas.height);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.life -= 0.018;
    bctx.globalAlpha = Math.max(p.life, 0);
    bctx.fillStyle = '#D4AF37';
    bctx.shadowColor = '#98FF98'; bctx.shadowBlur = 12;
    bctx.font = p.size + 'px monospace';
    bctx.fillText(p.char, p.x, p.y);
  });
  bctx.globalAlpha = 1;
  particles = particles.filter(p => p.life > 0);
  requestAnimationFrame(drawBurst);
}
requestAnimationFrame(drawBurst);

window.addEventListener('pointerdown', e => {
  if(!e.target.closest('input, button, a, .remember-row')) spawnBurst(e.clientX, e.clientY);
});

/* ============ 3D TILT ============ */
const wordmark  = document.getElementById('wordmark');
const loginCard = document.getElementById('login-card');

function applyTilt(el,x,y,str){
  if(document.documentElement.classList.contains('light')||!document.documentElement.classList.contains('dark')){if(el&&el.style)el.style.transform='';return;}
  const r=el.getBoundingClientRect();
  const rx=(x-r.left)/r.width-0.5;const ry=(y-r.top)/r.height-0.5;
  el.style.transform = `rotateX(${(-ry * str).toFixed(2)}deg) rotateY(${(rx * str).toFixed(2)}deg) translateZ(6px)`;
}
function resetTilt(el){ el.style.transform = ''; }

window.addEventListener('pointermove', e => {
  applyTilt(wordmark,  e.clientX, e.clientY, 12);
  applyTilt(loginCard, e.clientX, e.clientY, 4);
});
window.addEventListener('pointerleave', () => {
  resetTilt(wordmark); resetTilt(loginCard);
});

/* ============ PASSWORD TOGGLE ============ */
const pwInput = document.getElementById('password-input');
const eyeBtn  = document.getElementById('eye-btn');
if (eyeBtn && pwInput) {
  eyeBtn.addEventListener('click', () => {
    const show = pwInput.type === 'password';
    pwInput.type = show ? 'text' : 'password';
    eyeBtn.textContent = show ? '◎' : '◉';
  });
}

/* ============ LOGIN LOGIC ============ */
const API_BASE = (window.RA && RA.API_BASE) || ((location.hostname==='localhost'||location.hostname==='127.0.0.1') ? 'http://127.0.0.1:5987' : 'https://web-production-8f747.up.railway.app');

// Redirect if already logged in
(function() {
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = 'dashboard.html';
  }
})();

const loginForm = document.getElementById('login-form');
const loginBtn  = document.getElementById('loginBtn');
const errMsg    = document.getElementById('err-msg');

if (loginForm) loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (errMsg) errMsg.classList.remove('show');

  const emailEl = document.getElementById('email');
  const email = emailEl ? emailEl.value.trim() : '';
  const password = pwInput ? pwInput.value : '';

  if (!email || !password) {
    if (errMsg) { errMsg.textContent = '⚠ All fields are required.'; errMsg.classList.add('show'); }
    return;
  }

  if (loginBtn) { loginBtn.classList.add('loading'); loginBtn.textContent = 'AUTHENTICATING...'; }

  try {
    const __api = (window.RA && RA.API_BASE) || ((location.hostname==='localhost'||location.hostname==='127.0.0.1') ? 'http://127.0.0.1:5987' : 'https://web-production-8f747.up.railway.app');
    const res = await fetch(`${__api}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Invalid credentials.');
    }

    // Save token and user info
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // Redirect to dashboard
    window.location.href = 'dashboard.html';
  } catch (err) {
    if (errMsg) { errMsg.textContent = '⚠ ' + (err && err.message ? err.message : 'Login failed'); errMsg.classList.add('show'); }
    if (loginBtn) { loginBtn.classList.remove('loading'); loginBtn.textContent = 'LOG IN'; }
  }
});

/* ============ INTRO OVERLAY ============ */
(function hideOverlaySoon(){
  function hide(){
    var ov = document.getElementById('overlay');
    if (!ov) return;
    ov.classList.add('hide');
    ov.style.pointerEvents = 'none';
  }
  // Hide sooner so theme toggle / form never stay blocked
  if (document.readyState === 'complete') setTimeout(hide, 600);
  else window.addEventListener('load', function(){ setTimeout(hide, 600); });
  // Safety: always clear after 2.5s even if load hangs
  setTimeout(hide, 2500);
})();
</script>
<script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
<script>
window.addEventListener('ra-theme-change', function(){ try{ ['login-card','reg-card','logout-card','wordmark'].forEach(function(id){ var el=document.getElementById(id); if(el) el.style.transform=''; }); }catch(e){} });
</script>
<script src="/static/js/ra-theme.js?v=1790304800"></script>
</body>

</html>
