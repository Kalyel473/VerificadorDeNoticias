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
  if (type === "safe") return `<svg viewBox="0 0 48 48" width="56" height="56"><path d="M24 6L10 13v9c0 9.5 6 18.5 14 20 8-1.5 14-10.5 14-20v-9L24 6z" fill="rgba(0,200,150,0.15)" stroke="#00c896" stroke-width="2" stroke-linejoin="round"/><path d="M18 24l4 4 8-8" stroke="#00c896" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  if (type === "warning") return `<svg viewBox="0 0 48 48" width="56" height="56"><polygon points="24,8 44,40 4,40" fill="rgba(255,200,0,0.15)" stroke="#ffc107" stroke-width="2.5" stroke-linejoin="round"/><line x1="24" y1="18" x2="24" y2="30" stroke="#ffc107" stroke-width="3.5" stroke-linecap="round"/><circle cx="24" cy="36" r="2.5" fill="#ffc107"/></svg>`;
  return `<svg viewBox="0 0 48 48" width="56" height="56"><path d="M24 6L6 12v9c0 10.5 7 20 18 22 11-2 18-11.5 18-22v-9L24 6z" fill="rgba(255,60,60,0.15)" stroke="#ff3b3b" stroke-width="2" stroke-linejoin="round"/><line x1="24" y1="18" x2="24" y2="30" stroke="#ff3b3b" stroke-width="3.5" stroke-linecap="round"/><circle cx="24" cy="36" r="2.5" fill="#ff3b3b"/></svg>`;
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
// VERIFICAÇÃO
// -------------------------------
function verificarLink() {
  let valor = linkInput.value.trim();
  if (valor === "") { abrirModalComDetalhes("warning", "Campo vazio", ["Cole um link antes de verificar."], "#ffcc00"); return; }

  verifyBtn.classList.add("loading");

  setTimeout(() => {
    verifyBtn.classList.remove("loading");

    let url, temHttp = false;
    try {
      if (!valor.startsWith("http://") && !valor.startsWith("https://")) { valor = "https://" + valor; }
      else { temHttp = true; }
      url = new URL(valor);
    } catch {
      abrirModalComDetalhes("warning", "Link inválido", ["O endereço não parece válido.", "Verifique se está completo."], "#ffcc00");
      return;
    }

    const dominio = url.hostname.toLowerCase();
    const full = valor.toLowerCase();
    let score = 0, motivos = [];

    if (["g1.globo.com","uol.com.br","bbc.com","gov.br","reuters.com","apnews.com","folha.uol.com.br","estadao.com.br"].some(s => dominio.includes(s))) { score += 4; motivos.push("Fonte reconhecida e respeitada"); }
    if (["bit.ly","tinyurl.com","ow.ly","cutt.ly"].some(s => dominio.includes(s))) { score -= 3; motivos.push("Link encurtado (pode esconder destino)"); }
    if (temHttp && url.protocol === "https:") { score += 1; motivos.push("Conexão segura (HTTPS)"); }
    else if (temHttp) { score -= 1; motivos.push("Sem HTTPS — dados podem ser interceptados"); }
    ["urgente","chocante","compartilhe","milagre","segredo","vazado"].forEach(p => {
      if (full.includes(p)) { score -= 1; motivos.push(`Palavra sensacionalista: "${p}"`); }
    });
    if (dominio.includes("@") || dominio.split(".").length > 4) { score -= 2; motivos.push("Domínio com estrutura estranha ou suspeita"); }

    if (score >= 4) abrirModalComDetalhes("safe", "Fonte Confiável", motivos.length ? motivos : ["Nenhum sinal de perigo encontrado."], "#00c896");
    else if (score >= 1) abrirModalComDetalhes("warning", "Requer Atenção", motivos.length ? motivos : ["Tome cuidado, mas não é claramente falso."], "#ffcc00");
    else abrirModalComDetalhes("danger", "Possível Fake News", motivos.length ? motivos : ["Vários sinais suspeitos detectados."], "#ff3b3b");

  }, 700);
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