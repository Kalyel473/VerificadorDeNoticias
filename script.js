const navLinks = document.querySelectorAll("#mainNav a");
const modal = document.getElementById("modalOverlay");
const modalIcon = document.getElementById("modalIcon");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const verifyBtn = document.getElementById("verifyBtn");
const linkInput = document.getElementById("linkInput");
const pasteHint = document.getElementById("pasteHint");

// PEGA O INPUT DA URL (INTERATIVO)
const urlTextInput = document.getElementById("urlText");

// PERMITE EDITAR O TEXTO DA URL
if (urlTextInput) {
  urlTextInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      this.blur();
    }
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
      if (pasteHint) pasteHint.classList.add("hidden");

      const box = document.getElementById("verifyBox");
      box.style.borderColor = "rgba(0,200,150,.9)";
      box.style.boxShadow = "0 0 30px rgba(0,200,150,.25)";
      setTimeout(() => {
        box.style.borderColor = "";
        box.style.boxShadow = "";
      }, 600);
    } else {
      linkInput.focus();
    }
  } catch {
    linkInput.focus();
    try {
      document.execCommand("paste");
    } catch {}
  }
}

if (linkInput) {
  linkInput.addEventListener("input", () => {
    if (linkInput.value.trim() !== "") {
      if (pasteHint) pasteHint.classList.add("hidden");
    } else {
      if (pasteHint) pasteHint.classList.remove("hidden");
    }
  });
}

const sectionsMap = {
  inicio: document.getElementById("inicioSecao"),
  identificar: document.getElementById("identificarSecao"),
  dicas: document.getElementById("dicasSecao")
};

// -------------------------------
// NAVEGAÇÃO SUAVE
// -------------------------------
function setActive(navId) {
  navLinks.forEach(link => {
    link.classList.remove("active");

    if (link.getAttribute("data-nav") === navId) {
      link.classList.add("active");
    }
  });
}

function scrollToSection(sectionId, navId) {
  const target = sectionsMap[sectionId];

  if (!target) return;

  const offset = 70;
  const top =
    target.getBoundingClientRect().top +
    window.pageYOffset -
    offset;

  window.scrollTo({
    top,
    behavior: "smooth"
  });

  setActive(navId);
}

navLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();

    const nav = link.getAttribute("data-nav");

    if (nav === "inicio") scrollToSection("inicio", "inicio");
    if (nav === "identificar") scrollToSection("identificar", "identificar");
    if (nav === "dicas") scrollToSection("dicas", "dicas");
  });
});

// -------------------------------
// MENU ATIVO AO ROLAR
// -------------------------------
function updateActiveOnScroll() {
  const scroll = window.scrollY + 120;

  const inicioTop = sectionsMap.inicio.offsetTop;
  const identificarTop = sectionsMap.identificar.offsetTop;
  const dicasTop = sectionsMap.dicas.offsetTop;

  let current = "inicio";

  if (scroll >= dicasTop) {
    current = "dicas";
  } else if (scroll >= identificarTop) {
    current = "identificar";
  }

  setActive(current);
}

window.addEventListener("scroll", updateActiveOnScroll);
updateActiveOnScroll();

// -------------------------------
// ÍCONES DO MODAL
// -------------------------------
function getModalIcon(type) {
  if (type === "safe") {
    return `<svg viewBox="0 0 48 48" width="56" height="56">
      <path d="M24 6L10 13v9c0 9.5 6 18.5 14 20 8-1.5 14-10.5 14-20v-9L24 6z" fill="rgba(0,200,150,0.15)" stroke="#00c896" stroke-width="2" stroke-linejoin="round"/>
      <path d="M18 24l4 4 8-8" stroke="#00c896" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }
  if (type === "warning") {
    return `<svg viewBox="0 0 48 48" width="56" height="56">
      <polygon points="24,8 44,40 4,40" fill="rgba(255,200,0,0.15)" stroke="#ffc107" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="24" y1="18" x2="24" y2="30" stroke="#ffc107" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="24" cy="36" r="2.5" fill="#ffc107"/>
    </svg>`;
  }
  // danger - vermelho
  return `<svg viewBox="0 0 48 48" width="56" height="56">
    <path d="M24 6L6 12v9c0 10.5 7 20 18 22 11-2 18-11.5 18-22v-9L24 6z" fill="rgba(255,60,60,0.15)" stroke="#ff3b3b" stroke-width="2" stroke-linejoin="round"/>
    <line x1="24" y1="18" x2="24" y2="30" stroke="#ff3b3b" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="24" cy="36" r="2.5" fill="#ff3b3b"/>
  </svg>`;
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
  
  if (tipo === "safe") {
    modalIcon.classList.add('modal-icon--safe');
  } else if (tipo === "warning") {
    modalIcon.classList.add('modal-icon--warning');
  } else {
    modalIcon.classList.add('modal-icon--danger');
  }
  
  let bgClass = "";
  if (tipo === "safe") bgClass = "modal-message-list--safe";
  else if (tipo === "warning") bgClass = "modal-message-list--warning";
  else bgClass = "modal-message-list--danger";
  
  let listaHtml = "";
  if (motivosArray && motivosArray.length > 0) {
    listaHtml = `<div class="modal-message-list ${bgClass}"><ul>${motivosArray.map(m => `<li>${m}</li>`).join('')}</ul></div>`;
  } else {
    listaHtml = `<div class="modal-message-list ${bgClass}"><p>Nenhum detalhe adicional.</p></div>`;
  }
  
  modalText.innerHTML = listaHtml;
  modal.classList.add("active");
  
  setTimeout(() => {
    initSwipeToClose();
  }, 50);
}

function fecharModal() {
  modal.classList.remove("active");
  
  if (modalBoxElement) {
    modalBoxElement.style.transform = '';
    modalBoxElement.classList.remove('swiping');
  }
  
  modal.style.background = '';
  
  isSwiping = false;
  touchStartY = 0;
  touchCurrentY = 0;
}

modal.addEventListener("click", e => {
  if (e.target === modal) fecharModal();
});

// -------------------------------
// VERIFICAÇÃO
// -------------------------------
function verificarLink() {
  let valor = linkInput.value.trim();

  if (valor === "") {
    abrirModalComDetalhes("warning", "Campo vazio", ["Cole um link antes de verificar."], "#ffcc00");
    return;
  }

  let url;
  let temHttp = false;
  
  try {
    if (!valor.startsWith("http://") && !valor.startsWith("https://")) {
      valor = "https://" + valor;
      temHttp = false;
    } else {
      temHttp = true;
    }
    url = new URL(valor);
  } catch {
    abrirModalComDetalhes("warning", "Link inválido", ["O endereço não parece válido.", "Verifique se está completo."], "#ffcc00");
    return;
  }

  const dominio = url.hostname.toLowerCase();
  const full = valor.toLowerCase();
  let score = 0;
  let motivos = [];

  const confiaveis = ["g1.globo.com", "uol.com.br", "bbc.com", "gov.br", "reuters.com", "apnews.com", "folha.uol.com.br", "estadao.com.br"];
  if (confiaveis.some(site => dominio.includes(site))) {
    score += 4;
    motivos.push("Fonte reconhecida e respeitada");
  }

  const encurtadores = ["bit.ly", "tinyurl.com", "ow.ly", "cutt.ly"];
  if (encurtadores.some(site => dominio.includes(site))) {
    score -= 3;
    motivos.push("Link encurtado (pode esconder destino)");
  }

  if (temHttp && url.protocol === "https:") {
    score += 1;
    motivos.push("Conexão segura (HTTPS)");
  } else if (temHttp && url.protocol !== "https:") {
    score -= 1;
    motivos.push("Sem HTTPS — dados podem ser interceptados");
  }

  const suspeitas = ["urgente", "chocante", "compartilhe", "milagre", "segredo", "vazado"];
  suspeitas.forEach(p => {
    if (full.includes(p)) {
      score -= 1;
      motivos.push(`Palavra sensacionalista: "${p}"`);
    }
  });

  if (dominio.includes("@") || dominio.split(".").length > 4) {
    score -= 2;
    motivos.push("Domínio com estrutura estranha ou suspeita");
  }

  if (score >= 4) {
    abrirModalComDetalhes("safe", "Fonte Confiável", motivos.length ? motivos : ["Nenhum sinal de perigo encontrado."], "#00c896");
  } else if (score >= 1) {
    abrirModalComDetalhes("warning", "Requer Atenção", motivos.length ? motivos : ["Tome cuidado, mas não é claramente falso."], "#ffcc00");
  } else {
    abrirModalComDetalhes("danger", "Possível Fake News", motivos.length ? motivos : ["Vários sinais suspeitos detectados."], "#ff3b3b");
  }
}

if (linkInput) {
  linkInput.addEventListener("keypress", e => {
    if (e.key === "Enter") verificarLink();
  });
}

if (verifyBtn) {
  verifyBtn.addEventListener("click", function() {
    verificarLink();
  });
}

// -------------------------------
// ANIMAÇÃO DOS CARDS
// -------------------------------
const cards = document.querySelectorAll(".info-card");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.15 });

cards.forEach(card => observer.observe(card));

// EFEITO TOQUE NOS CARDS (MOBILE)
cards.forEach(card => {
  card.addEventListener("touchstart", () => {
    card.classList.add("touched");
  }, { passive: true });

  card.addEventListener("touchend", () => {
    setTimeout(() => card.classList.remove("touched"), 300);
  });
});

// -------------------------------
// EFEITO 3D NOS CARDS
// -------------------------------
cards.forEach(card => {
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 18;
    const rotateY = (centerX - x) / 18;

    card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-8px)
      scale(1.02)
    `;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

// -------------------------------
// EFEITO BOTÕES
// -------------------------------
const dots = document.querySelectorAll(".dot");

dots.forEach(dot => {
  dot.addEventListener("click", () => {
    dot.style.transform = "scale(1.25)";

    setTimeout(() => {
      dot.style.transform = "scale(1)";
    }, 180);
  });
});

// -------------------------------
// SWIPE TO CLOSE (MOBILE)
// -------------------------------
let touchStartY = 0;
let touchCurrentY = 0;
let isSwiping = false;
let modalBoxElement = null;

function initSwipeToClose() {
  modalBoxElement = document.querySelector('.modal-box');
  if (!modalBoxElement) return;

  if (!document.querySelector('.modal-swipe-indicator') && window.innerWidth <= 480) {
    const indicator = document.createElement('div');
    indicator.className = 'modal-swipe-indicator';
    modalBoxElement.insertBefore(indicator, modalBoxElement.firstChild);
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
  
  const touch = e.touches[0];
  touchStartY = touch.clientY;
  isSwiping = true;
  if (modalBoxElement) {
    modalBoxElement.classList.add('swiping');
  }
}

function handleTouchMove(e) {
  if (!isSwiping || !modal.classList.contains('active')) return;
  
  const touch = e.touches[0];
  touchCurrentY = touch.clientY;
  const diffY = touchCurrentY - touchStartY;
  
  if (diffY > 0) {
    e.preventDefault();
    
    const translateY = Math.min(diffY, 200);
    if (modalBoxElement) {
      modalBoxElement.style.transform = `translateY(${translateY}px)`;
    }
    
    const opacity = Math.max(0, 0.85 - (diffY / 800));
    modal.style.background = `rgba(0,0,0,${opacity})`;
  }
}

function handleTouchEnd(e) {
  if (!isSwiping || !modal.classList.contains('active')) {
    isSwiping = false;
    return;
  }
  
  const diffY = touchCurrentY - touchStartY;
  
  if (diffY > 80) {
    fecharModal();
  }
  
  if (modalBoxElement) {
    modalBoxElement.style.transform = '';
    modalBoxElement.classList.remove('swiping');
  }
  
  modal.style.background = '';
  
  isSwiping = false;
  touchStartY = 0;
  touchCurrentY = 0;
}

document.addEventListener('DOMContentLoaded', function() {
  initSwipeToClose();
});