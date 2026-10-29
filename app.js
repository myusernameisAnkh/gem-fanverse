/* GEMVERSE — vanilla JavaScript; no build tools or third-party runtime required. */
(() => {
  "use strict";
  const D = window.GEM_DATA;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escape = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const external = (url, label, cls = "source-link") => `<a class="${cls}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
  const KEY = "gemverse.v1";
  const validSongIds = new Set(D.songs.map(song => song.id));
  const defaults = () => ({favorites:[],messages:[],cheers:0,checkins:[],best:0,theme:"light",outfit:"rock-star"});
  let storageWarned = false;
  let toastTimer;
  function toast(message) {
    $("#toast").textContent = message;
    $("#toast").classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3300);
  }
  function normalizeState(raw) {
    const state = defaults();
    if (!raw || typeof raw !== "object") return state;
    state.favorites = Array.isArray(raw.favorites) ? [...new Set(raw.favorites)].filter(id => validSongIds.has(id)) : [];
    state.cheers = Number.isSafeInteger(raw.cheers) ? Math.max(0,Math.min(raw.cheers,999999)) : 0;
    state.checkins = Array.isArray(raw.checkins) ? [...new Set(raw.checkins.filter(day => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day)))].slice(-3660) : [];
    state.best = Number.isInteger(raw.best) ? Math.max(0,Math.min(raw.best,D.quiz.length)) : 0;
    state.theme = raw.theme === "dark" ? "dark" : "light";
    state.outfit = ["rock-star","silver-stage","guitar-dream"].includes(raw.outfit) ? raw.outfit : "rock-star";
    if (Array.isArray(raw.messages)) state.messages = raw.messages.filter(item => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.body === "string" && Number.isFinite(Date.parse(item.created))).slice(0,100).map(item => ({
      id:item.id.slice(0,80),name:item.name.trim().slice(0,16),body:item.body.trim().slice(0,200),
      color:["lavender","peach","mint"].includes(item.color) ? item.color : "lavender",created:item.created
    })).filter(item => item.name && item.body.length >= 2);
    return state;
  }
  function readState() {
    try { return normalizeState(JSON.parse(localStorage.getItem(KEY))); }
    catch { return defaults(); }
  }
  let state = readState();
  function save() {
    try { localStorage.setItem(KEY,JSON.stringify(state));return true; }
    catch {
      if (!storageWarned) { toast("浏览器暂时无法保存记录；当前操作仍有效，关闭页面前可导出留言。");storageWarned = true; }
      return false;
    }
  }
  function dateKey() {
    const parts = new Intl.DateTimeFormat("en",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(part => [part.type,part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }
  function formatDate(value) {
    return new Intl.DateTimeFormat("zh-CN",{timeZone:"Asia/Shanghai",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(value));
  }
  function applyTheme() {
    document.body.dataset.theme = state.theme;
    $("#themeToggle").textContent = state.theme === "dark" ? "☀" : "☾";
    $("#themeToggle").setAttribute("aria-label",`切换${state.theme === "dark" ? "浅色" : "深色"}主题`);
    const frame = $(".giscus-frame");
    frame?.contentWindow?.postMessage({giscus:{setConfig:{theme:state.theme === "dark" ? "dark" : "light"}}},"https://giscus.app");
  }
  $("#themeToggle").addEventListener("click",() => {state.theme = state.theme === "dark" ? "light" : "dark";applyTheme();save();});
  applyTheme();

  // Navigation, scroll progress and reduced-motion-aware feedback.
  $("#navToggle").addEventListener("click",() => {
    const open = $("#mainNav").classList.toggle("open");
    $("#navToggle").setAttribute("aria-expanded",String(open));
    $("#navToggle").setAttribute("aria-label",open ? "收起导航" : "展开导航");
  });
  $$(".nav a").forEach(link => link.addEventListener("click",() => {
    $("#mainNav").classList.remove("open");$("#navToggle").setAttribute("aria-expanded","false");$("#navToggle").setAttribute("aria-label","展开导航");
  }));
  function updateProgress() {
    const extent = document.documentElement.scrollHeight - window.innerHeight;
    $("#readingProgress").style.width = `${extent > 0 ? Math.min(100,window.scrollY/extent*100) : 0}%`;
    const sections = ["home","music","journey","stage","fanlab","wall"];
    let active = "home";
    sections.forEach(id => {if ($(`#${id}`).getBoundingClientRect().top < 180) active = id;});
    $$(".nav a").forEach(link => {
      const selected = link.getAttribute("href") === `#${active}`;
      link.classList.toggle("active",selected);
      if (selected) link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");
    });
  }
  let scrollPending = false;
  window.addEventListener("scroll",() => {if (!scrollPending) {scrollPending = true;requestAnimationFrame(() => {updateProgress();scrollPending = false;});}},{passive:true});
  window.addEventListener("resize",updateProgress);
  window.addEventListener("load",updateProgress);

  // Native dialogs preserve focus and support Escape without custom focus traps.
  function showDialog(dialog) {
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("dialog-open");
  }
  $$("dialog").forEach(dialog => {
    $("[data-close]",dialog).addEventListener("click",() => dialog.close());
    dialog.addEventListener("click",event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener("close",() => {
      if (!$$("dialog[open]").length) document.body.classList.remove("dialog-open");
      if (dialog.id === "songDialog") $$("iframe",dialog).forEach(frame => frame.remove());
    });
  });

  // Music library. All dynamic strings are escaped; visitor content uses text nodes.
  let currentMood = "all", query = "", favoritesOnly = false;
  function renderSongs() {
    const songs = D.songs.filter(song => (currentMood === "all" || song.mood === currentMood) && (!favoritesOnly || state.favorites.includes(song.id)) && `${song.title} ${song.album} ${song.english} ${song.year}`.toLocaleLowerCase().includes(query));
    $("#musicGrid").innerHTML = songs.map(song => {
      const favorite = state.favorites.includes(song.id);
      return `<article class="music-card"><div class="cover-wrap"><button class="cover-open" data-song="${escape(song.id)}" aria-label="查看《${escape(song.title)}》作品详情"><img src="assets/covers/${escape(song.cover)}.jpg" alt="《${escape(song.album)}》封面" width="600" height="600" loading="lazy"></button><span class="cover-year">${song.year}</span><span class="cover-play" aria-hidden="true">↗</span></div><div class="music-card-heading"><button class="song-title" data-song="${escape(song.id)}">${escape(song.title)}</button><button class="favorite ${favorite ? "selected" : ""}" data-favorite="${escape(song.id)}" aria-label="${favorite ? "取消收藏" : "收藏"}《${escape(song.title)}》" aria-pressed="${favorite}">${favorite ? "♥" : "♡"}</button></div><p class="song-album">${escape(song.album)}</p><span class="song-mood">${escape(song.mood)}</span></article>`;
    }).join("");
    $("#musicCount").textContent = `${songs.length} 首${favoritesOnly ? "收藏" : "精选"}作品`;
    $("#favoriteCount").textContent = String(state.favorites.length);
    $("#musicEmpty").hidden = songs.length > 0;
  }
  $("#musicGrid").addEventListener("click",event => {
    const favorite = event.target.closest("[data-favorite]");
    if (favorite) {
      const id = favorite.dataset.favorite;
      if (state.favorites.includes(id)) state.favorites = state.favorites.filter(item => item !== id);
      else state.favorites.push(id);
      const saved = save();renderSongs();
      if (saved) toast(state.favorites.includes(id) ? "已经放进你的音乐收藏 ♡" : "已从收藏中移除");
      return;
    }
    const song = event.target.closest("[data-song]");if (song) openSong(song.dataset.song);
  });
  $("#moodFilters").addEventListener("click",event => {
    const button = event.target.closest("[data-mood]");if (!button) return;
    currentMood = button.dataset.mood;
    $$("[data-mood]",$("#moodFilters")).forEach(item => {const active = item === button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active));});
    renderSongs();
  });
  $("#musicSearch").addEventListener("input",event => {query = event.target.value.trim().toLocaleLowerCase();renderSongs();});
  $("#favoritesOnly").addEventListener("click",() => {
    favoritesOnly = !favoritesOnly;$("#favoritesOnly").setAttribute("aria-pressed",String(favoritesOnly));renderSongs();
  });
  function openSong(id) {
    const song = D.songs.find(item => item.id === id);if (!song) return;
    $("#songDetail").innerHTML = `<div class="song-detail-head"><img src="assets/covers/${escape(song.cover)}.jpg" alt="《${escape(song.album)}》封面"><div><p class="eyebrow">${song.year} / ${escape(song.mood)}</p><h2>${escape(song.title)}</h2><p class="song-album">${escape(song.album)}</p><p class="tiny">G.E.M. 邓紫棋</p></div></div><div class="song-detail-copy"><h3>给此刻的你</h3><p>${escape(song.note)}</p><p class="tiny">以上为本站编辑推荐语。</p></div><div class="song-actions">${external(song.listen,"官方聆听 ↗","button primary")}${song.video ? `<button class="button secondary" id="loadVideo">在此加载官方 MV ▷</button>` : ""}</div><div id="videoSlot"></div><p class="song-detail-source">资料出处：${external(song.source,"查看作品信息 ↗","")}<br>完整音视频由对应官方平台提供；播放受平台、网络与地区限制。</p>`;
    if (song.video) $("#loadVideo").addEventListener("click",event => {
      const container = document.createElement("div");container.className = "song-video";
      const frame = document.createElement("iframe");frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(song.video)}`;
      frame.title = `${song.title} — G.E.M. 官方音乐视频`;frame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share";frame.allowFullscreen = true;frame.referrerPolicy = "strict-origin-when-cross-origin";
      container.append(frame);$("#videoSlot").replaceChildren(container);
      const note = document.createElement("p");note.className = "tiny video-note";note.textContent = "如果播放器不可用，请通过「官方聆听」或官方视频页面打开。";$("#videoSlot").append(note);
      const link = document.createElement("a");link.href = `https://www.youtube.com/watch?v=${song.video}`;link.target = "_blank";link.rel = "noopener noreferrer";link.className = "source-link";link.textContent = "前往官方视频页面 ↗";$("#videoSlot").append(link);
      event.target.disabled = true;event.target.textContent = "官方播放器已加载";
    });
    showDialog($("#songDialog"));
  }
  $$("[data-recommend]").forEach(button => button.addEventListener("click",() => {
    const options = D.songs.filter(song => song.mood === button.dataset.recommend);
    openSong(options[Math.floor(Math.random()*options.length)].id);
  }));
  renderSongs();

  let quoteIndex = 0;
  function renderQuote() {
    const quote = D.quotes[quoteIndex];
    $("#quoteText").textContent = quote.text;$("#quoteSong").textContent = `—— G.E.M. 邓紫棋《${quote.song}》`;
    $("#quoteReflection").textContent = quote.reflection;$("#quoteSource").href = quote.source;
    $("#quoteIndex").textContent = `${String(quoteIndex+1).padStart(2,"0")} / ${String(D.quotes.length).padStart(2,"0")}`;
  }
  $("#quotePrev").addEventListener("click",() => {quoteIndex = (quoteIndex+D.quotes.length-1)%D.quotes.length;renderQuote();});
  $("#quoteNext").addEventListener("click",() => {quoteIndex = (quoteIndex+1)%D.quotes.length;renderQuote();});renderQuote();

  function renderTimeline(era = "all") {
    $("#timeline").innerHTML = D.timeline.filter(item => era === "all" || item.era === era).map(item => `<article class="timeline-item ${item.highlight ? "highlight" : ""}"><span class="timeline-year">${escape(item.year)}</span><h3>${escape(item.title)}</h3><p>${escape(item.body)}</p>${external(item.source,"资料出处 ↗")}${item.extraSource ? " · "+external(item.extraSource,"专辑资料 ↗") : ""}</article>`).join("");
  }
  $("#eraFilters").addEventListener("click",event => {
    const button = event.target.closest("[data-era]");if (!button) return;
    $$("[data-era]").forEach(item => {const active = item === button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active));});
    renderTimeline(button.dataset.era);
  });renderTimeline();

  let photoIndex = 0;
  $("#photoGrid").innerHTML = D.photos.map((photo,index) => `<button class="photo-card" data-photo="${index}" aria-label="放大查看：${escape(photo.title)}"><div class="photo-image"><img src="${escape(photo.file.replace(".jpg",".webp"))}" alt="${escape(photo.alt)}" width="600" height="600" loading="lazy"><span class="photo-expand" aria-hidden="true">↗</span></div><div class="photo-info"><strong>${escape(photo.title)}</strong><span>${escape(photo.city)} / ${escape(photo.date.slice(0,4))}</span></div><p class="photo-credit-mini">${escape(photo.credit)} · ${escape(photo.license)}</p></button>`).join("");
  function openPhoto(index) {
    photoIndex = (index+D.photos.length)%D.photos.length;const photo = D.photos[photoIndex];
    $("#photoFull").src = photo.file;$("#photoFull").alt = photo.alt;
    $("#photoCaption").innerHTML = `<strong>${escape(photo.title)}</strong> · ${escape(photo.tour)}<br>${escape(photo.city)} / ${escape(photo.date)} · 摄影：${escape(photo.credit)}<br>${external(photo.source,"原图与作者","")} · ${external(photo.licenseUrl,photo.license,"")} · 网页缩放、转为WebP并适配裁切；原始照片保留。`;
    $("#photoIndex").textContent = `${String(photoIndex+1).padStart(2,"0")} / ${String(D.photos.length).padStart(2,"0")}`;
    showDialog($("#photoDialog"));
  }
  $("#photoGrid").addEventListener("click",event => {const button = event.target.closest("[data-photo]");if (button) openPhoto(Number(button.dataset.photo));});
  $("#photoPrev").addEventListener("click",() => openPhoto(photoIndex-1));$("#photoNext").addEventListener("click",() => openPhoto(photoIndex+1));
  $("#photoDialog").addEventListener("keydown",event => {if (event.key === "ArrowLeft") {event.preventDefault();openPhoto(photoIndex-1);}if (event.key === "ArrowRight") {event.preventDefault();openPhoto(photoIndex+1);}});

  // Cheering is explicitly local; no invented global fan counts.
  function renderCheer() {
    $("#cheerCount").textContent = state.cheers.toLocaleString("zh-CN");
    const checked = state.checkins.includes(dateKey());
    $("#checkinButton").disabled = checked;$("#checkinButton").textContent = checked ? "✓ 今天已经为热爱打卡" : "✦ 今日打卡";
    $("#checkinInfo").textContent = `本机已打卡 ${state.checkins.length} 天 · 按北京时间计算`;
    $("#quizBest").textContent = state.best > 0 ? `本机最佳成绩 ${state.best} / ${D.quiz.length} · 随时重玩` : "随时重玩 · 认识她多一点";
  }
  function particles(event) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = $("#cheerButton").getBoundingClientRect();
    for (let index=0;index<7;index++) {
      const star = document.createElement("span");star.className = "cheer-particle";star.textContent = index%2 ? "♡" : "✦";
      star.style.left = `${event.clientX || rect.left+rect.width/2}px`;star.style.top = `${event.clientY || rect.top+40}px`;
      star.style.setProperty("--px",`${(Math.random()-.5)*180}px`);star.style.setProperty("--py",`${-50-Math.random()*110}px`);
      document.body.append(star);star.addEventListener("animationend",() => star.remove(),{once:true});
    }
  }
  $("#cheerButton").addEventListener("click",event => {
    state.cheers = Math.min(999999,state.cheers+1);save();renderCheer();particles(event);
    $("#cheerButton").classList.add("lit");setTimeout(() => $("#cheerButton").classList.remove("lit"),140);
  });
  $("#checkinButton").addEventListener("click",() => {
    if (state.checkins.includes(dateKey())) return;
    state.checkins.push(dateKey());const saved = save();renderCheer();if (saved) toast("今日应援已打卡 ✦ 愿你自己也闪闪发光。");
  });renderCheer();
  // Re-evaluate the calendar day when returning after midnight or leaving a tab open.
  document.addEventListener("visibilitychange",() => {if (!document.hidden) renderCheer();});
  setInterval(renderCheer,60000);

  // Downloadable artwork: same-origin assets only, no private data or external fonts.
  const outfitLabels = {"rock-star":"摇滚红披肩","silver-stage":"银色舞台光","guitar-dream":"吉他小宇宙"};
  function renderOutfits() {$$("[data-outfit]").forEach(button => {const active = button.dataset.outfit === state.outfit;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active));});}
  $("#outfitPicker").addEventListener("click",event => {const button = event.target.closest("[data-outfit]");if (!button) return;state.outfit = button.dataset.outfit;save();renderOutfits();});renderOutfits();
  function loadImage(url) {return new Promise((resolve,reject) => {const image = new Image();image.onload = () => resolve(image);image.onerror = () => reject(new Error("图片暂时未能加载"));image.src = url;});}
  function downloadBlob(blob,filename) {
    const link = document.createElement("a");const url = URL.createObjectURL(blob);link.href = url;link.download = filename;document.body.append(link);link.click();link.remove();setTimeout(() => URL.revokeObjectURL(url),30000);
  }
  function canvasBlob(canvas) {return new Promise((resolve,reject) => {try {canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("导出失败")),"image/png");}catch(error) {reject(error);}});}
  function star(ctx,x,y,size,color) {
    ctx.save();ctx.fillStyle = color;ctx.beginPath();ctx.moveTo(x,y-size);ctx.lineTo(x+size*.27,y-size*.27);ctx.lineTo(x+size,y);ctx.lineTo(x+size*.27,y+size*.27);ctx.lineTo(x,y+size);ctx.lineTo(x-size*.27,y+size*.27);ctx.lineTo(x-size,y);ctx.lineTo(x-size*.27,y-size*.27);ctx.closePath();ctx.fill();ctx.restore();
  }
  function fitText(ctx,text,maxWidth,startSize,family,weight = 700) {
    let size = startSize;ctx.font = `${weight} ${size}px ${family}`;
    while (ctx.measureText(text).width > maxWidth && size > 14) {size--;ctx.font = `${weight} ${size}px ${family}`;}
  }
  $("#downloadCard").addEventListener("click",async () => {
    const button = $("#downloadCard");button.disabled = true;const original = button.innerHTML;button.textContent = "正在绘制你的应援卡……";
    try {
      const name = $("#fanName").value.trim().slice(0,12) || "紫色小星星";
      const image = await loadImage(`assets/art/${state.outfit}.png`);
      const canvas = document.createElement("canvas");canvas.width = 1080;canvas.height = 1350;const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#eee7f5";ctx.fillRect(0,0,1080,1350);ctx.strokeStyle = "#c5b6d6";ctx.lineWidth = 2;ctx.strokeRect(38,38,1004,1274);
      ctx.fillStyle = "#ded0ed";ctx.beginPath();ctx.ellipse(540,715,407,450,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle = "#5c389e";ctx.font = "800 47px Arial,sans-serif";ctx.fillText("GEMVERSE",80,115);ctx.font = "18px Arial,sans-serif";ctx.fillText("FAN PASS / 棋遇宇宙",80,151);
      star(ctx,951,111,37,"#7653ba");ctx.fillStyle = "#30253d";ctx.font = "700 64px 'Microsoft YaHei',sans-serif";ctx.fillText("把热爱，唱成光。",80,253);
      star(ctx,142,620,34,"#7653ba");star(ctx,920,434,26,"#7653ba");star(ctx,890,993,34,"#7653ba");star(ctx,184,1009,16,"#7653ba");
      const height = 830,width = height*image.width/image.height;ctx.drawImage(image,(1080-width)/2,292,width,height);
      ctx.fillStyle = "#fffdf8";ctx.fillRect(39,1131,1002,180);ctx.textAlign = "center";ctx.fillStyle = "#4a325e";fitText(ctx,`${name} 的应援通行证`,920,38,"'Microsoft YaHei',sans-serif");ctx.fillText(`${name} 的应援通行证`,540,1192);
      ctx.fillStyle = "#7a6a87";ctx.font = "18px 'Microsoft YaHei',sans-serif";ctx.fillText(`G.E.M. 邓紫棋 / ${outfitLabels[state.outfit]} / ${dateKey()}`,540,1232);
      ctx.font = "15px 'Microsoft YaHei',sans-serif";ctx.fillText("非官方 AI 同人创作 · 造型参考摄影：茂木木 · CC BY-SA 4.0",540,1271);
      downloadBlob(await canvasBlob(canvas),`GEMVERSE-fan-pass-${state.outfit}.png`);toast("应援卡已生成，带着热爱出发吧 ♡");
    } catch(error) {
      toast(location.protocol === "file:" ? "请在 GitHub Pages 或本地预览服务中打开页面后下载应援卡。" : "应援卡生成失败，请刷新后重试。");
    } finally {button.disabled = false;button.innerHTML = original;}
  });

  // Five-question quiz with explanations, repeat protection and downloadable badge.
  let quizIndex = 0, quizScore = 0, answered = false;
  function renderQuiz() {
    answered = false;const quiz = D.quiz[quizIndex];
    $("#quizContent").innerHTML = `<span class="quiz-label">GEMVERSE / 棋妙小挑战</span><div class="quiz-progress"><span style="width:${quizIndex/D.quiz.length*100}%"></span></div><p class="tiny">第 ${quizIndex+1} / ${D.quiz.length} 题</p><h2>${escape(quiz.question)}</h2><div class="quiz-options">${quiz.options.map((option,index) => `<button class="quiz-option" data-answer="${index}">${String.fromCharCode(65+index)}. ${escape(option)}</button>`).join("")}</div><div id="quizFeedback" aria-live="polite"></div>`;
    $$("[data-answer]",$("#quizContent")).forEach(button => button.addEventListener("click",() => {
      if (answered) return;answered = true;const answer = Number(button.dataset.answer),correct = answer === quiz.answer;if (correct) quizScore++;
      $$("[data-answer]",$("#quizContent")).forEach(item => {item.disabled = true;if (Number(item.dataset.answer) === quiz.answer) item.classList.add("correct");});
      if (!correct) button.classList.add("wrong");
      $("#quizFeedback").innerHTML = `<div class="quiz-explanation"><strong>${correct ? "答对了 ✦" : "又认识她多一点"}</strong><p>${escape(quiz.explanation)}</p>${external(quiz.source,"查看资料依据 ↗","")}</div><button class="button primary quiz-next" id="quizNext">${quizIndex === D.quiz.length-1 ? "查看我的徽章" : "下一题"} →</button>`;
      $("#quizNext").addEventListener("click",() => {quizIndex++;if (quizIndex < D.quiz.length) renderQuiz();else finishQuiz();});
      $("#quizNext").focus({preventScroll:true});
    }));
  }
  function startQuiz() {quizIndex = 0;quizScore = 0;renderQuiz();showDialog($("#quizDialog"));}
  function finishQuiz() {
    state.best = Math.max(state.best,quizScore);save();renderCheer();
    const title = quizScore === D.quiz.length ? "宇宙级棋妙知音" : quizScore >= 3 ? "闪闪发光的音乐同行者" : "刚刚启程的小星星";
    $("#quizContent").innerHTML = `<div class="quiz-result"><span class="quiz-medal">✦</span><p class="eyebrow" style="justify-content:center">YOUR LITTLE ACHIEVEMENT</p><h2>${escape(title)}</h2><p>本次答对 <strong>${quizScore} / ${D.quiz.length}</strong> 题。<br>喜欢音乐，没有入场门槛。每一次了解都是新的相遇。</p><button class="button primary" id="downloadBadge">下载电子徽章 ↓</button><button class="button secondary" id="restartQuiz">再挑战一次 ↗</button></div>`;
    $("#restartQuiz").addEventListener("click",startQuiz);
    $("#downloadBadge").addEventListener("click",async () => {
      try {
        const canvas = document.createElement("canvas");canvas.width = 1080;canvas.height = 1080;const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#efe8f6";ctx.fillRect(0,0,1080,1080);ctx.strokeStyle = "#b7a0d2";ctx.lineWidth = 3;ctx.strokeRect(45,45,990,990);ctx.textAlign = "center";
        ctx.fillStyle = "#7653ba";ctx.font = "800 48px Arial,sans-serif";ctx.fillText("GEMVERSE",540,155);ctx.font = "20px Arial,sans-serif";ctx.fillText("MUSIC EXPLORER / 棋妙小挑战",540,203);
        ctx.fillStyle = "#d9c8eb";ctx.beginPath();ctx.arc(540,485,210,0,Math.PI*2);ctx.fill();star(ctx,540,485,150,"#7653ba");star(ctx,820,342,24,"#7653ba");star(ctx,252,632,25,"#7653ba");
        ctx.fillStyle = "#302438";ctx.font = "700 78px Arial,sans-serif";ctx.fillText(`${quizScore} / ${D.quiz.length}`,540,790);fitText(ctx,title,900,40,"'Microsoft YaHei',sans-serif");ctx.fillText(title,540,865);
        ctx.font = "21px 'Microsoft YaHei',sans-serif";ctx.fillStyle = "#7b6c87";ctx.fillText("非官方粉丝互动纪念 · "+dateKey(),540,963);
        downloadBlob(await canvasBlob(canvas),"GEMVERSE-music-explorer.png");toast("电子徽章已生成 ✦");
      } catch {toast("徽章下载失败，请稍后重试。");}
    });
  }
  $("#openQuiz").addEventListener("click",startQuiz);

  // Local guestbook — textContent prevents submitted HTML from executing.
  function renderMessages() {
    const cards = [...state.messages,...D.sampleMessages];const grid = $("#messageGrid");grid.replaceChildren();
    cards.forEach(message => {
      const article = document.createElement("article");article.className = `message-card ${message.color}`;
      const heading = document.createElement("div");heading.className = "message-head";const name = document.createElement("strong");name.textContent = message.name;heading.append(name);
      if (message.demo) {const badge = document.createElement("span");badge.className = "demo-badge";badge.textContent = "示例";heading.append(badge);}
      const body = document.createElement("p");body.textContent = message.body;
      const date = document.createElement("span");date.className = "message-date";date.textContent = message.demo ? "设计演示内容" : `${formatDate(message.created)} · 仅本机`;
      article.append(heading,body,date);
      if (!message.demo) {const button = document.createElement("button");button.className = "message-delete";button.textContent = "删除这条留言";button.addEventListener("click",() => {if (!confirm("删除这条本机留言？")) return;state.messages = state.messages.filter(item => item.id !== message.id);save();renderMessages();});article.append(button);}
      grid.append(article);
    });
    $("#messageCount").textContent = `${state.messages.length} 条本机留言 · 3 条示例`;
  }
  $("#messageBody").addEventListener("input",event => {$("#messageLength").textContent = String(event.target.value.length);});
  $("#messageForm").addEventListener("submit",event => {
    event.preventDefault();const name = $("#messageName").value.trim(),body = $("#messageBody").value.trim();
    if (!name || name.length > 16 || body.length < 2 || body.length > 200) {toast("请填写1—16字昵称和2—200字的留言。");return;}
    if (state.messages.length >= 100) {toast("本机已保存100条留言，请先导出备份并删除部分记录。");return;}
    state.messages.unshift({id:globalThis.crypto?.randomUUID ? crypto.randomUUID() : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,name,body,color:$("#messageColor").value,created:new Date().toISOString()});
    const saved = save();renderMessages();$("#messageBody").value = "";$("#messageLength").textContent = "0";
    if (saved) toast("你的星星已留在本机星河 ✦");
  });
  $("#exportMessages").addEventListener("click",() => {
    if (!state.messages.length) {toast("先留下一条自己的应援，再导出吧。");return;}
    const content = {project:"GEMVERSE",scope:"本机留言备份，不包含示例留言",exportedAt:new Date().toISOString(),messages:state.messages};
    downloadBlob(new Blob([JSON.stringify(content,null,2)],{type:"application/json;charset=utf-8"}),`GEMVERSE-messages-${dateKey()}.json`);toast("留言备份已导出");
  });
  $("#clearMessages").addEventListener("click",() => {
    if (!state.messages.length) {toast("本机还没有个人留言。");return;}
    if (!confirm("清空此浏览器中的所有个人留言？此操作不会删除示例或 GitHub 共享留言。建议先导出备份。")) return;
    state.messages = [];save();renderMessages();toast("本机个人留言已清空");
  });renderMessages();
  window.addEventListener("storage",event => {if (event.key === KEY || event.key === null) {state = readState();applyTheme();renderSongs();renderCheer();renderMessages();renderOutfits();}});

  // Optional public GitHub Discussions comments. No secret or account token is used.
  function initSharedComments() {
    const config = window.GEM_CONFIG?.giscus;
    if (!config?.enabled) return;
    if (!/^[\w.-]+\/[\w.-]+$/.test(config.repo || "") || !config.repoId || !config.categoryId || !config.category) {
      $("#giscusStatus").textContent = "共享留言配置尚未填写完整。请参考项目中的设置指南。";return;
    }
    if (location.protocol === "file:") {$("#giscusStatus").textContent = "共享留言需在 GitHub Pages 的 HTTPS 页面或本地预览服务中打开。";return;}
    const script = document.createElement("script");script.src = "https://giscus.app/client.js";script.async = true;script.crossOrigin = "anonymous";
    const attributes = {"data-repo":config.repo,"data-repo-id":config.repoId,"data-category":config.category,"data-category-id":config.categoryId,"data-mapping":"specific","data-term":"gemverse-guestbook-v1","data-strict":"1","data-reactions-enabled":"1","data-emit-metadata":"0","data-input-position":"top","data-theme":state.theme === "dark" ? "dark" : "light","data-lang":"zh-CN","data-loading":"lazy"};
    Object.entries(attributes).forEach(([key,value]) => script.setAttribute(key,String(value)));
    script.onerror = () => {$("#giscusStatus").textContent = "共享留言加载失败，请检查网络或直接前往 GitHub Discussions。";};
    $("#giscusStatus").textContent = "共享留言保存在公开的 GitHub Discussions；发表评论需要登录 GitHub。本机留言不会自动上传。";
    $("#giscusContainer").className = "giscus";$("#giscusContainer").append(script);$("#sharedWall").classList.add("loaded");
    const link = $("#giscusSetupLink");link.href = `https://github.com/${config.repo}/discussions`;link.textContent = "前往 GitHub 留言与查看讨论 ↗";link.target = "_blank";link.rel = "noopener noreferrer";
  }initSharedComments();

  // Sources are part of the product: direct links remain useful after the class.
  $("#openSources").addEventListener("click",() => {
    const uniqueSources = D.timeline;
    $("#infoContent").innerHTML = `<p class="eyebrow">THE FOOTNOTES MATTER</p><h2>资料、影像与创作说明</h2><p>核验日期：2026年10月29日。页面采用选编的历史节点，不宣称收录完整生涯或全部作品。作品按原始版本标记年份，平台重上架或重录版的日期可能不同。</p><h3>生涯与作品资料</h3><ol>${uniqueSources.map(item => `<li>${external(item.source,`${item.year} · ${item.title}`,"")}${item.extraSource ? " / "+external(item.extraSource,"补充资料","") : ""}</li>`).join("")}</ol><p>各作品详情与歌词卡片还附有对应出处。短摘以简体字展示；本站感想、心情标签、推荐文案均为独立编辑内容，不是艺人原话。</p><h3>六帧舞台照片</h3>${D.photos.map(photo => `<div class="credits-photo"><img src="${escape(photo.file)}" alt="" loading="lazy"><p><strong>${escape(photo.city)} · ${escape(photo.date)} · ${escape(photo.title)}</strong><br>摄影：${escape(photo.credit)} / ${external(photo.licenseUrl,photo.license,"")}<br>${external(photo.source,"Wikimedia Commons 原始文件页","")}<br>原图保留；展示副本缩放并转为WebP，页面以CSS适配裁切。</p></div>`).join("")}<h3>封面与 AI 同人插画</h3><p>作品封面来自艺人官网、唱片公司或 Apple Music 公开页面，版权属于对应权利人；详细地址见项目 assets/cover-credits.json。三款卡通插画由图像生成工具参考茂木木公开许可的演出照片生成，属于本站非官方 AI 同人创作，按 CC BY-SA 4.0 提供。相关参考照片与提示词见 docs/artwork-prompts.md。</p><p>音乐视频通过官方频道链接或平台播放器提供。本站未打包歌曲音频、完整歌词或音乐视频文件。</p>`;
    showDialog($("#infoDialog"));
  });
  $("#openAbout").addEventListener("click",() => {
    $("#infoContent").innerHTML = `<p class="eyebrow">A LITTLE UNIVERSE, MADE WITH LOVE</p><h2>关于棋遇宇宙</h2><p>GEMVERSE 是以邓紫棋的音乐为主题的非官方课堂项目。我们把作品发现、音乐故事、影像档案与粉丝互动放在一个小宇宙里，希望每次点击都能多认识她一点，也多表达自己一点。</p><h3>可以在这里做什么？</h3><ul><li>搜索12首精选作品，按心情筛选与收藏，通过官方渠道聆听。</li><li>浏览歌词短摘、14个生涯节点与6帧可放大的真实舞台影像。</li><li>点亮本机荧光棒、按北京时间每日打卡、生成PNG应援卡。</li><li>完成5道知识挑战、查看有出处的答案并下载电子徽章。</li><li>写下本机留言并导出；站长可选配 GitHub Discussions 实现跨设备共享。</li></ul><h3>关于记录与隐私</h3><p>默认不向服务器上传你的昵称、收藏、应援或留言；这些记录保存在当前浏览器的 localStorage。清除浏览器数据会删除记录，隐私模式或浏览器限制可能影响保存。主动加载官方 MV 或共享留言时，会连接对应第三方平台。共享留言公开可见，并由 GitHub 管理。</p><h3>一点约定</h3><p>文明表达，不填写电话、住址等私密信息。网站不代表艺人或官方粉丝组织。素材各自保留原许可和署名，详细清单已随项目附上。</p>`;
    showDialog($("#infoDialog"));
  });
})();
