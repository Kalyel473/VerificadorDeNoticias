const modal = document.getElementById("modalOverlay");
const modalIcon = document.getElementById("modalIcon");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const verifyBtn = document.getElementById("verifyBtn");
const linkInput = document.getElementById("linkInput");

// -------------------------------
// URL BAR EDITÁVEL
// -------------------------------
const urlTextInput = document.getElementById("urlText");
if (urlTextInput) {
  urlTextInput.addEventListener("focus", function() {
    window._tiltPaused = true;
    const range = document.createRange();
    range.selectNodeContents(this);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  });
  urlTextInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") { e.preventDefault(); this.blur(); }
  });
  urlTextInput.addEventListener("input", function() {
    if (this.innerText.length > 30) {
      this.innerText = this.innerText.slice(0, 30);
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(this);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });
  urlTextInput.addEventListener("blur", function() {
    window._tiltPaused = false;
    if (!this.innerText.trim()) this.innerText = "LinkSeguro.com";
  });
}

// -------------------------------
// COLAR LINK
// -------------------------------
async function colarLink() {
  try {
    const text = await navigator.clipboard.readText();
    if (text && text.trim() !== "") {
      linkInput.value = text.trim();
      linkInput.focus();
      const box = document.getElementById("verifyBox");
      box.style.borderColor = "rgba(0,200,150,.9)";
      box.style.boxShadow = "0 0 30px rgba(0,200,150,.25)";
      setTimeout(() => { box.style.borderColor = ""; box.style.boxShadow = ""; }, 600);
    } else {
      linkInput.focus();
    }
  } catch {
    linkInput.focus();
    try { document.execCommand("paste"); } catch {}
  }
}

// -------------------------------
// ÍCONES DO MODAL
// -------------------------------
function getModalIcon(type) {
  if (type === "safe") return `<svg viewBox="0 0 36 36" width="56" height="56"><path d="M18 3L6 8v9c0 7.88 5.14 15.27 12 17 6.86-1.73 12-9.12 12-17V8L18 3z" fill="#00c896" opacity=".18"/><path d="M18 3L6 8v9c0 7.88 5.14 15.27 12 17 6.86-1.73 12-9.12 12-17V8L18 3z" fill="none" stroke="#00c896" stroke-width="2"/><path d="M13 18l3.5 3.5L23 14" stroke="#00c896" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  if (type === "warning") return `<svg viewBox="0 0 80 80" width="56" height="56"><polygon points="40,8 74,68 6,68" fill="rgba(255,204,0,.18)" stroke="#ffcc00" stroke-width="3"/><line x1="40" y1="28" x2="40" y2="50" stroke="#ffcc00" stroke-width="5" stroke-linecap="round"/><circle cx="40" cy="60" r="4" fill="#ffcc00"/></svg>`;
  return `<svg viewBox="0 0 36 36" width="56" height="56"><path d="M18 3L6 8v9c0 7.88 5.14 15.27 12 17 6.86-1.73 12-9.12 12-17V8L18 3z" fill="red" opacity=".18"/><path d="M18 3L6 8v9c0 7.88 5.14 15.27 12 17 6.86-1.73 12-9.12 12-17V8L18 3z" fill="none" stroke="red" stroke-width="2"/><line x1="18" y1="12" x2="18" y2="21" stroke="red" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="26" r="2" fill="red"/></svg>`;
}

// -------------------------------
// MODAL
// -------------------------------
function abrirModalComDetalhes(tipo, titulo, motivosArray, cor) {
  if (!modal || !modalIcon || !modalTitle || !modalText) return;
  modalIcon.innerHTML = getModalIcon(tipo);
  modalTitle.innerText = titulo;
  modalTitle.style.color = cor;
  modalIcon.classList.remove('modal-icon--safe', 'modal-icon--warning', 'modal-icon--danger');
  modalIcon.classList.add(tipo === "safe" ? 'modal-icon--safe' : tipo === "warning" ? 'modal-icon--warning' : 'modal-icon--danger');
  const bgClass = tipo === "safe" ? "modal-message-list--safe" : tipo === "warning" ? "modal-message-list--warning" : "modal-message-list--danger";
  modalText.innerHTML = motivosArray && motivosArray.length > 0
    ? `<div class="modal-message-list ${bgClass}"><ul>${motivosArray.map(m => `<li>${m}</li>`).join('')}</ul></div>`
    : `<div class="modal-message-list ${bgClass}"><p>Nenhum detalhe adicional.</p></div>`;
  modal.classList.add("active");
  setTimeout(initSwipeToClose, 50);
}

function fecharModal() {
  modal.classList.remove("active");
  if (modalBoxElement) { modalBoxElement.style.transform = ''; modalBoxElement.classList.remove('swiping'); }
  modal.style.background = '';
  isSwiping = false; touchStartY = 0; touchCurrentY = 0;
}

modal.addEventListener("click", e => { if (e.target === modal) fecharModal(); });

// -------------------------------
// EXTRAÇÃO DE TEXTO DO HTML
// -------------------------------
function extrairTextoHTML(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, "")
    .replace(/<[^>]+>/g, " ");
  return tmp.textContent.replace(/\s+/g, " ").trim().slice(0, 8000);
}

// -------------------------------
// ANÁLISE DE TEXTO
// -------------------------------
function analisarTextoCompleto(texto) {
  const t = texto.toLowerCase();
  const palavras = t.split(/\s+/).filter(Boolean);
  const total = palavras.length;
  const fatores = [];

  const maiusculas = (texto.match(/[A-ZÁÉÍÓÚÀÃÕÂÊÔ]{4,}/g) || []).length;
  if (maiusculas >= 5) fatores.push({ peso: -3, texto: `Excesso de letras maiúsculas (${maiusculas} ocorrências)` });
  else if (maiusculas >= 2) fatores.push({ peso: -1, texto: "Uso de maiúsculas em bloco detectado" });

  const exclamacoes = (texto.match(/!/g) || []).length;
  if (exclamacoes >= 4) fatores.push({ peso: -2, texto: `Pontuação excessiva: ${exclamacoes} exclamações` });
  else if (exclamacoes >= 2) fatores.push({ peso: -1, texto: "Múltiplas exclamações detectadas" });
  if ((texto.match(/\?/g) || []).length >= 4) fatores.push({ peso: -1, texto: "Muitas perguntas retóricas" });

  const sensacional = ["urgente","imperdível","chocante","inacreditável","bomba","revelado","vazado","censurado","milagre","exclusivo","segredo","espalhe","compartilhe agora","antes que apaguem","governo esconde","médicos odeiam","eles não querem que você saiba","viralizou","nunca antes visto","assustador","confirmado agora","proibido","ninguém acredita","isso mudou tudo","chocou o brasil"];
  const sensEnc = sensacional.filter(p => t.includes(p));
  if (sensEnc.length >= 3) fatores.push({ peso: -3, texto: `Linguagem fortemente sensacionalista: "${sensEnc.slice(0, 3).join('", "')}"` });
  else if (sensEnc.length >= 1) fatores.push({ peso: -2, texto: `Termos sensacionalistas: "${sensEnc.join('", "')}"` });

  const fontesPadroes = ["segundo","de acordo com","conforme","afirmou","declarou","disse","informou","relatou","apurou","publicou","divulgou","noticiou","pesquisa","estudo","levantamento","ministério","secretaria","especialistas afirmam","cientistas"];
  const fontesEnc = fontesPadroes.filter(p => t.includes(p)).length;
  if (fontesEnc === 0 && total > 80) fatores.push({ peso: -3, texto: "Nenhuma fonte citada" });
  else if (fontesEnc >= 3) fatores.push({ peso: 2, texto: `Múltiplas fontes citadas (${fontesEnc} referências)` });
  else if (fontesEnc >= 1) fatores.push({ peso: 1, texto: "Ao menos uma fonte é citada no texto" });

  const apelMedo = ["cuidado","perigo","atenção","alerta","grave","sérios riscos","todos serão afetados","isso vai te matar","pode matar","risco de morte","acorde","estão te enganando","não deixe seus filhos","o fim","apocalipse","colapso","golpe","ditadura","invasão"];
  const medoEnc = apelMedo.filter(p => t.includes(p));
  if (medoEnc.length >= 3) fatores.push({ peso: -3, texto: `Forte apelo ao medo: "${medoEnc.slice(0, 3).join('", "')}"` });
  else if (medoEnc.length >= 1) fatores.push({ peso: -1, texto: `Apelo emocional ao medo: "${medoEnc[0]}"` });

  const temData = /\b(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|\d{1,2}\/\d{1,2}\/\d{2,4}|20\d\d|ontem|hoje|esta semana|este mês)\b/i.test(texto);
  if (!temData && total > 100) fatores.push({ peso: -2, texto: "Ausência de datas ou contexto temporal" });
  else if (temData) fatores.push({ peso: 1, texto: "Referência temporal presente no texto" });

  const temAutor = /\b(redação|por |repórter|jornalista|editor|equipe|staff|correspondent)\b/i.test(texto);
  if (!temAutor && total > 80) fatores.push({ peso: -1, texto: "Autoria não identificada no conteúdo" });
  else if (temAutor) fatores.push({ peso: 1, texto: "Autoria ou veículo identificado" });

  const absolutos = ["todo mundo sabe","todos concordam","é fato que","ninguém pode negar","ficou provado","já está comprovado","100%","absolutamente certo","definitivamente","sem sombra de dúvida","é mentira que","não existe"];
  const absEnc = absolutos.filter(p => t.includes(p));
  if (absEnc.length >= 2) fatores.push({ peso: -2, texto: `Generalizações absolutas: "${absEnc.slice(0, 2).join('", "')}"` });
  else if (absEnc.length === 1) fatores.push({ peso: -1, texto: `Afirmação absoluta sem evidência: "${absEnc[0]}"` });

  const share = ["compartilhe","repasse","manda pra todo mundo","passa pra frente","mostre para","avise seus amigos","salva esse post","não deixa sumir","antes que deletem","copia e cola"];
  const shareEnc = share.filter(p => t.includes(p));
  if (shareEnc.length >= 1) fatores.push({ peso: -3, texto: `Pedido de compartilhamento urgente: "${shareEnc[0]}"` });

  const conspiracao = ["élite","illuminati","deep state","estado profundo","nova ordem mundial","agenda oculta","querem te calar","supressão da verdade","grande reset","chip","implante","controle mental","5g mata","vacina mata","veneno na água","chemtrail"];
  const conspEnc = conspiracao.filter(p => t.includes(p));
  if (conspEnc.length >= 2) fatores.push({ peso: -4, texto: `Elementos de teoria da conspiração: "${conspEnc.slice(0, 2).join('", "')}"` });
  else if (conspEnc.length === 1) fatores.push({ peso: -2, texto: `Referência a narrativa conspiratória: "${conspEnc[0]}"` });

  const saudeFalsa = ["cura definitiva","cura o câncer","elimina o vírus","médicos estão escondendo","faz emagrecer","basta tomar","receita caseira","remédio natural","farmacêuticas não querem","proibido pela anvisa","proibido nos eua","funciona mesmo"];
  const saudeEnc = saudeFalsa.filter(p => t.includes(p));
  if (saudeEnc.length >= 1) fatores.push({ peso: -4, texto: `Alegação de saúde suspeita: "${saudeEnc[0]}"` });

  const factcheck = ["agência lupa","aos fatos","boatos.org","e-farsas","snopes","politifact","fact.check","verificado por","fato ou fake","checamos","checagem"];
  if (factcheck.filter(p => t.includes(p)).length >= 1) fatores.push({ peso: 2, texto: "Referência a agência de fact-checking detectada" });

  const unicos = new Set(palavras).size;
  const diversidade = total > 0 ? unicos / total : 0;
  if (total > 100 && diversidade < 0.35) fatores.push({ peso: -1, texto: `Baixa diversidade vocabular (${Math.round(diversidade * 100)}%)` });
  else if (total > 100 && diversidade > 0.6) fatores.push({ peso: 1, texto: `Boa diversidade vocabular (${Math.round(diversidade * 100)}%)` });

  if (total < 60) fatores.push({ peso: -1, texto: "Texto muito curto" });
  else if (total > 300) fatores.push({ peso: 1, texto: "Texto extenso" });

  const polarizacao = ["comunista","fascista","nazista","esquerdista","direitista","lula ladrão","bolsominion","petralha","golpista","milícia","bandido vermelho","coxinha","mortadela"];
  const polEnc = polarizacao.filter(p => t.includes(p));
  if (polEnc.length >= 2) fatores.push({ peso: -2, texto: `Linguagem política polarizada: "${polEnc.slice(0, 2).join('", "')}"` });

  return { score: fatores.reduce((s, f) => s + f.peso, 0), fatores, totalPalavras: total };
}

// -------------------------------
// ANÁLISE DE DOMÍNIO
// -------------------------------
function analisarDominio(url) {
  const dominio = url.hostname.toLowerCase();
  const partes = dominio.split(".");
  let score = 0, fatores = [];

  const confiaveis = ["g1.globo.com","uol.com.br","bbc.com","bbc.co.uk","cnn.com","reuters.com","apnews.com","gov.br","folha.uol.com.br","estadao.com.br","oglobo.globo.com","correiobraziliense.com.br","agenciabrasil.ebc.com.br","ibge.gov.br","portal.fiocruz.br","veja.abril.com.br","exame.com","valor.com.br","gazetadopovo.com.br","terra.com.br"];
  const tldSuspeitos = [".xyz",".top",".click",".tk",".ml",".ga",".cf",".pw",".gq",".icu",".buzz",".cc",".ws",".monster",".cyou",".cfd",".bond"];
  const encurtadores = ["bit.ly","tinyurl.com","cutt.ly","ow.ly","t.co","goo.gl","rb.gy","linktr.ee"];

  if (url.protocol === "https:") { score += 1; }
  else { score -= 1; fatores.push({ peso: -1, texto: "Site sem HTTPS" }); }

  if (confiaveis.some(s => dominio === s || dominio.endsWith("." + s))) {
    score += 4; fatores.push({ peso: 4, texto: `Domínio reconhecido como confiável: ${dominio}` });
  }
  if (encurtadores.some(s => dominio === s)) {
    score -= 2; fatores.push({ peso: -2, texto: "Link encurtado" });
  }
  if (tldSuspeitos.some(t => dominio.endsWith(t))) {
    score -= 2; fatores.push({ peso: -2, texto: `Extensão de domínio de alto risco: .${partes[partes.length - 1]}` });
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(dominio)) {
    score -= 3; fatores.push({ peso: -3, texto: "Endereço IP direto em vez de domínio" });
  }
  if (partes.length > 4) {
    score -= 1; fatores.push({ peso: -1, texto: `Subdomínios excessivos (${partes.length} níveis)` });
  }

  return { score, fatores };
}

// -------------------------------
// VEREDICTO
// -------------------------------
function calcVeredicto(score) {
  if (score >= 5) return { tipo: "safe",    titulo: "Provavelmente Confiável", cor: "#00c896" };
  if (score >= 2) return { tipo: "warning", titulo: "Requer Atenção",         cor: "#ffcc00" };
  if (score >= -2) return { tipo: "warning", titulo: "Conteúdo Suspeito",     cor: "#ff8c00" };
  return             { tipo: "danger",  titulo: "Alto Risco de Fake News",    cor: "#ff3b3b" };
}

// -------------------------------
// VERIFICAÇÃO
// -------------------------------
async function verificarLink() {
  let valor = linkInput.value.trim();
  if (valor === "") { abrirModalComDetalhes("warning", "Campo vazio", ["Cole um link antes de verificar."], "#ffcc00"); return; }

  verifyBtn.classList.add("loading");
  verifyBtn.textContent = "Analisando...";

  if (!/^https?:\/\//i.test(valor)) valor = "https://" + valor;

  let url;
  try { url = new URL(valor); } catch {
    verifyBtn.classList.remove("loading");
    verifyBtn.textContent = "VERIFICAR";
    abrirModalComDetalhes("warning", "Link inválido", ["O endereço não parece válido.", "Verifique se está completo."], "#ffcc00");
    return;
  }

  let textoExtraido = "";
  const _msgs = ["Verificando domínio…", "Analisando conteúdo…", "Quase lá…"];
  let _msgIdx = 0;
  const _msgTimer = setInterval(() => {
    if (++_msgIdx < _msgs.length) verifyBtn.textContent = _msgs[_msgIdx];
  }, 1500);

  try {
    const controller = new AbortController();
    const _timeoutId = setTimeout(() => controller.abort(), 5000);
    const proxy = "https://api.allorigins.win/get?url=" + encodeURIComponent(valor);
    const resp = await fetch(proxy, { signal: controller.signal });
    clearTimeout(_timeoutId);
    const json = await resp.json();
    textoExtraido = extrairTextoHTML(json.contents || "");
  } catch (e) {
    console.warn("Falha ao buscar conteúdo:", e);
  } finally {
    clearInterval(_msgTimer);
  }

  const domRes = analisarDominio(url);
  let scoreTotal = domRes.score;
  let fatoresCombinados = [...domRes.fatores];
  let totalPalavras = 0;

  if (textoExtraido.length > 200) {
    const textoRes = analisarTextoCompleto(textoExtraido);
    scoreTotal += textoRes.score;
    fatoresCombinados = [...fatoresCombinados, ...textoRes.fatores];
    totalPalavras = textoRes.totalPalavras;
  } else {
    fatoresCombinados.push({ peso: 0, texto: "Conteúdo não extraído — análise baseada no domínio" });
  }

  const veredicto = calcVeredicto(scoreTotal);

  const negativos = fatoresCombinados.filter(f => f.peso < 0).map(f => f.texto);
  const positivos = fatoresCombinados.filter(f => f.peso > 0).map(f => `${f.texto}`);
  const neutros   = fatoresCombinados.filter(f => f.peso === 0).map(f => f.texto);
  const motivosArray = [
    `Domínio: ${url.hostname}`,
    totalPalavras ? `Palavras analisadas: ${totalPalavras}` : null,
    ...negativos,
    ...positivos,
    ...neutros
  ].filter(Boolean);

  verifyBtn.classList.remove("loading");
  verifyBtn.textContent = "VERIFICAR";

  abrirModalComDetalhes(veredicto.tipo, veredicto.titulo, motivosArray, veredicto.cor);
}

if (linkInput) linkInput.addEventListener("keypress", e => { if (e.key === "Enter") verificarLink(); });
if (verifyBtn) verifyBtn.addEventListener("click", verificarLink);

// -------------------------------
// ANIMAÇÃO DOS CARDS
// -------------------------------
const cards = document.querySelectorAll(".info-card");
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("show"); });
}, { threshold: 0.15 });

cards.forEach(card => {
  observer.observe(card);
  card.addEventListener("touchstart", () => card.classList.add("touched"), { passive: true });
  card.addEventListener("touchend", () => setTimeout(() => card.classList.remove("touched"), 300));
  card.addEventListener("mousemove", e => {
    const r = card.getBoundingClientRect();
    card.style.transform = `perspective(1000px) rotateX(${(e.clientY - r.top - r.height/2)/18}deg) rotateY(${(r.width/2-(e.clientX-r.left))/18}deg) translateY(-8px) scale(1.02)`;
  });
  card.addEventListener("mouseleave", () => { card.style.transform = ""; });
});

// -------------------------------
// TILT 3D FLUIDO NO BROWSER CARD
// -------------------------------
const browserCard = document.querySelector('.browser-card');
const visual = document.querySelector('.visual');

if (browserCard && visual) {
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  const startTime = performance.now();

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick(now) {
    currentX = lerp(currentX, targetX, 0.055);
    currentY = lerp(currentY, targetY, 0.055);
    browserCard.style.transform = `perspective(1000px) rotateY(${12+currentX}deg) rotateX(${4+currentY}deg) translateY(${Math.sin((now-startTime)/900)*7}px)`;
    requestAnimationFrame(tick);
  }

  visual.addEventListener('mousemove', e => {
    if (window._tiltPaused) return;
    const r = browserCard.getBoundingClientRect();
    targetX = ((e.clientX - r.left - r.width/2) / r.width) * 16;
    targetY = -((e.clientY - r.top - r.height/2) / r.height) * 12;
  });

  visual.addEventListener('mouseleave', () => {
    if (window._tiltPaused) return;
    targetX = 0; targetY = 0;
  });

  setTimeout(() => {
    browserCard.style.willChange = 'transform';
    browserCard.style.animation = 'none';
    requestAnimationFrame(tick);
  }, 1000);
}

// -------------------------------
// EFEITO DOTS
// -------------------------------
document.querySelectorAll(".dot").forEach(dot => {
  dot.addEventListener("click", () => {
    dot.style.transform = "scale(1.25)";
    setTimeout(() => { dot.style.transform = "scale(1)"; }, 180);
  });
});

// -------------------------------
// SWIPE TO CLOSE (MOBILE)
// -------------------------------
let touchStartY = 0, touchCurrentY = 0, isSwiping = false, modalBoxElement = null;

function initSwipeToClose() {
  modalBoxElement = document.querySelector('.modal-box');
  if (!modalBoxElement) return;
  if (!document.querySelector('.modal-swipe-indicator') && window.innerWidth <= 480) {
    const ind = document.createElement('div');
    ind.className = 'modal-swipe-indicator';
    modalBoxElement.insertBefore(ind, modalBoxElement.firstChild);
  }
  modalBoxElement.removeEventListener('touchstart', handleTouchStart);
  modalBoxElement.removeEventListener('touchmove', handleTouchMove);
  modalBoxElement.removeEventListener('touchend', handleTouchEnd);
  modalBoxElement.addEventListener('touchstart', handleTouchStart, { passive: false });
  modalBoxElement.addEventListener('touchmove', handleTouchMove, { passive: false });
  modalBoxElement.addEventListener('touchend', handleTouchEnd);
}

function handleTouchStart(e) {
  if (!modal.classList.contains('active')) return;
  touchStartY = e.touches[0].clientY;
  isSwiping = true;
  if (modalBoxElement) modalBoxElement.classList.add('swiping');
}

function handleTouchMove(e) {
  if (!isSwiping || !modal.classList.contains('active')) return;
  touchCurrentY = e.touches[0].clientY;
  const diffY = touchCurrentY - touchStartY;
  if (diffY > 0) {
    e.preventDefault();
    if (modalBoxElement) modalBoxElement.style.transform = `translateY(${Math.min(diffY, 200)}px)`;
    modal.style.background = `rgba(0,0,0,${Math.max(0, 0.85 - diffY/800)})`;
  }
}

function handleTouchEnd() {
  if (!isSwiping || !modal.classList.contains('active')) { isSwiping = false; return; }
  if (touchCurrentY - touchStartY > 80) fecharModal();
  if (modalBoxElement) { modalBoxElement.style.transform = ''; modalBoxElement.classList.remove('swiping'); }
  modal.style.background = '';
  isSwiping = false; touchStartY = 0; touchCurrentY = 0;
}

document.addEventListener('DOMContentLoaded', initSwipeToClose);

if (window.innerWidth <= 768) {
  document.querySelectorAll('.feature-item').forEach(item => {
    if (item.textContent.includes('Analisa domínios')) {
      item.childNodes.forEach(node => {
        if (node.nodeType === 3 && node.textContent.trim() === 'Analisa domínios') {
          node.textContent = '';
          const span = document.createElement('span');
          span.innerHTML = 'Analisa<br>domínios';
          item.appendChild(span);
        }
      });
    }
  });
}