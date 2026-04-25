const navLinks = document.querySelectorAll("#mainNav a");
const modal = document.getElementById("modalOverlay");
const modalIcon = document.getElementById("modalIcon");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const verifyBtn = document.getElementById("verifyBtn");
const linkInput = document.getElementById("linkInput");

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
// ICONES SVG MODAL
// -------------------------------
function getIconSVG(type) {
  if (type === "safe") {
    return `
    <svg viewBox="0 0 36 36" width="56" height="56">
      <path d="M18 3L6 8v9c0 7.88 5.14 15.27 12 17 6.86-1.73 12-9.12 12-17V8L18 3z"
      fill="#00c896" opacity=".18"/>
      <path d="M18 3L6 8v9c0 7.88 5.14 15.27 12 17 6.86-1.73 12-9.12 12-17V8L18 3z"
      fill="none" stroke="#00c896" stroke-width="2"/>
      <path d="M13 18l3.5 3.5L23 14"
      stroke="#00c896" stroke-width="2.8"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"/>
    </svg>`;
  }

  if (type === "warning") {
    return `
    <svg viewBox="0 0 80 80" width="56" height="56">
      <polygon points="40,8 74,68 6,68"
      fill="rgba(255,204,0,.18)"
      stroke="#ffcc00"
      stroke-width="3"/>
      <line x1="40" y1="28" x2="40" y2="50"
      stroke="#ffcc00"
      stroke-width="5"
      stroke-linecap="round"/>
      <circle cx="40" cy="60" r="4" fill="#ffcc00"/>
    </svg>`;
  }

  return `
  <svg viewBox="0 0 36 36" width="56" height="56">
    <path d="M18 3L6 8v9c0 7.88 5.14 15.27 12 17 6.86-1.73 12-9.12 12-17V8L18 3z"
    fill="red" opacity=".18"/>
    <path d="M18 3L6 8v9c0 7.88 5.14 15.27 12 17 6.86-1.73 12-9.12 12-17V8L18 3z"
    fill="none" stroke="red" stroke-width="2"/>
    <line x1="18" y1="12" x2="18" y2="21"
    stroke="red"
    stroke-width="3"
    stroke-linecap="round"/>
    <circle cx="18" cy="26" r="2" fill="red"/>
  </svg>`;
}

// -------------------------------
// MODAL
// -------------------------------
function abrirModalComIcon(icon, title, text, color) {
  modalIcon.innerHTML = icon;
  modalTitle.innerText = title;
  modalText.innerText = text;
  modalTitle.style.color = color;
  modal.classList.add("active");
}

function fecharModal() {
  modal.classList.remove("active");
}

modal.addEventListener("click", e => {
  if (e.target === modal) fecharModal();
});

// -------------------------------
// VERIFICAÇÃO ROBUSTA DE LINKS
// -------------------------------
function verificarLink() {
  let valor = linkInput.value.trim();

  if (valor === "") {
    abrirModalComIcon(
      getIconSVG("warning"),
      "Campo vazio",
      "Cole um link antes de verificar.",
      "#ffcc00"
    );
    return;
  }

  let url;

  try {
    if (!valor.startsWith("http://") && !valor.startsWith("https://")) {
      valor = "https://" + valor;
    }

    url = new URL(valor);
  } catch {
    abrirModalComIcon(
      getIconSVG("warning"),
      "Link inválido",
      "O endereço informado não parece válido.",
      "#ffcc00"
    );
    return;
  }

  const dominio = url.hostname.toLowerCase();
  const full = valor.toLowerCase();

  let score = 0;
  let motivos = [];

  // Fontes confiáveis
  const confiaveis = [
    "g1.globo.com",
    "uol.com.br",
    "bbc.com",
    "gov.br",
    "reuters.com",
    "apnews.com",
    "folha.uol.com.br",
    "estadao.com.br"
  ];

  if (confiaveis.some(site => dominio.includes(site))) {
    score += 4;
    motivos.push("fonte reconhecida");
  }

  // Encurtadores
  const encurtadores = [
    "bit.ly",
    "tinyurl.com",
    "ow.ly",
    "cutt.ly"
  ];

  if (encurtadores.some(site => dominio.includes(site))) {
    score -= 3;
    motivos.push("link encurtado");
  }

  // HTTPS
  if (url.protocol === "https:") {
    score += 1;
  } else {
    score -= 1;
    motivos.push("sem HTTPS");
  }

  // palavras suspeitas
  const suspeitas = [
    "urgente",
    "chocante",
    "compartilhe",
    "milagre",
    "segredo",
    "vazado"
  ];

  suspeitas.forEach(p => {
    if (full.includes(p)) {
      score -= 1;
      motivos.push("linguagem apelativa");
    }
  });

  // domínio estranho
  if (dominio.includes("@") || dominio.split(".").length > 4) {
    score -= 2;
    motivos.push("domínio suspeito");
  }

  // Resultado
  if (score >= 4) {
    abrirModalComIcon(
      getIconSVG("safe"),
      "Fonte Confiável",
      "O link aparenta ser seguro. Motivos: " + motivos.join(", "),
      "#00c896"
    );
  } else if (score >= 1) {
    abrirModalComIcon(
      getIconSVG("warning"),
      "Requer Atenção",
      "Não parece falso, mas exige cautela. Motivos: " + motivos.join(", "),
      "#ffcc00"
    );
  } else {
    abrirModalComIcon(
      getIconSVG("danger"),
      "Possível Fake News",
      "Há sinais suspeitos neste link. Motivos: " + motivos.join(", "),
      "#ff3b3b"
    );
  }
}

// ENTER NO INPUT
linkInput.addEventListener("keypress", e => {
  if (e.key === "Enter") verificarLink();
});

// BOTÃO VERIFICAR
verifyBtn.addEventListener("click", verificarLink);

// -------------------------------
// EFEITO RIPPLE BOTÃO
// -------------------------------
function createRipple(e, element) {
  const ripple = document.createElement("span");
  ripple.classList.add("ripple-effect");

  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);

  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = e.clientX - rect.left - size / 2 + "px";
  ripple.style.top = e.clientY - rect.top - size / 2 + "px";

  element.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

verifyBtn.addEventListener("click", function(e) {
  createRipple(e, this);
});

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