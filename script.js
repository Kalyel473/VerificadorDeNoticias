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

/* ==========================================
   NAVEGAÇÃO SUAVE
========================================== */
function setActive(navId) {
  navLinks.forEach(link => {
    link.classList.remove("active");

    if (link.dataset.nav === navId) {
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

    const nav = link.dataset.nav;

    if (nav === "inicio") scrollToSection("inicio", "inicio");
    if (nav === "identificar") scrollToSection("identificar", "identificar");
    if (nav === "dicas") scrollToSection("dicas", "dicas");
  });
});

/* ==========================================
   MENU ATIVO AO ROLAR
========================================== */
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

/* ==========================================
   ÍCONES SVG
========================================== */
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

/* ==========================================
   MODAL
========================================== */
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

/* ==========================================
   VERIFICAÇÃO AVANÇADA — VERSÃO COMPLETA
========================================== */
async function verificarLink() {
  let valor = linkInput.value.trim();

  if (!valor) {
    abrirModalComIcon(
      getIconSVG("warning"),
      "Campo vazio",
      "Cole um link ou domínio antes de verificar.",
      "#ffcc00"
    );
    return;
  }

  if (!/^https?:\/\//i.test(valor)) {
    valor = "https://" + valor;
  }

  let url;
  try {
    url = new URL(valor);
  } catch {
    abrirModalComIcon(
      getIconSVG("warning"),
      "URL inválida",
      "O endereço digitado não é válido.",
      "#ffcc00"
    );
    return;
  }

  const dominio    = url.hostname.toLowerCase();
  const full       = url.href.toLowerCase();
  const path       = url.pathname.toLowerCase();
  const params     = url.search.toLowerCase();
  const partes     = dominio.split(".");
  const sld        = partes.length >= 2 ? partes[partes.length - 2] : dominio;
  const tldFinal   = partes.slice(-2).join(".");

  let score   = 0;
  let motivos = [];

  /* ------------------------------------------
     LISTAS DE REFERÊNCIA
  ------------------------------------------ */
  const confiaveis = [
    "g1.globo.com", "uol.com.br", "bbc.com", "bbc.co.uk",
    "cnn.com", "reuters.com", "apnews.com", "gov.br",
    "folha.uol.com.br", "estadao.com.br", "terra.com.br",
    "oglobo.globo.com", "correiobraziliense.com.br",
    "veja.abril.com.br", "exame.com", "valor.com.br",
    "agenciabrasil.ebc.com.br", "ibge.gov.br", "portal.fiocruz.br"
  ];

  const encurtadores = [
    "bit.ly", "tinyurl.com", "cutt.ly", "ow.ly",
    "t.co", "goo.gl", "is.gd", "bl.ink",
    "rb.gy", "short.io", "tiny.cc", "shorte.st",
    "adf.ly", "bc.vc", "linktr.ee"
  ];

  const palavrasFake = [
    "urgente", "milagre", "compartilhe", "espalhe",
    "chocante", "segredo", "vazado", "censurado",
    "ganhe dinheiro", "exclusivo", "bomba", "revelado",
    "assustador", "incrível", "imperdível", "viralizou",
    "proibido", "confirmado agora", "médicos odeiam",
    "governo esconde", "não vai aparecer no jornal"
  ];

  const imitacoes = [
    "gl0bo", "g1news", "govbrr", "uolnews",
    "bbcc", "faceboook", "whatsaap", "instagran",
    "youtub3", "twiter", "amazom", "mercadol1vre",
    "nuban k", "bradesco-online", "itau-digital",
    "correios-rastreio", "receita-federal"
  ];

  const tldSuspeitos = [
    ".xyz", ".top", ".click", ".tk", ".ml",
    ".ga", ".cf", ".pw", ".gq", ".icu",
    ".buzz", ".biz", ".cc", ".ws", ".rest",
    ".monster", ".cyou", ".cfd", ".bond",
    ".hair", ".skin", ".makeup"
  ];

  const marcas = [
    "paypal", "google", "facebook", "instagram",
    "microsoft", "amazon", "apple", "netflix",
    "banco", "bradesco", "itau", "nubank",
    "mercadopago", "caixa", "santander", "inter",
    "correios", "receita", "detran", "whatsapp",
    "telegram", "youtube", "twitter", "tiktok"
  ];

  const executaveis = [
    ".exe", ".bat", ".ps1", ".cmd", ".sh",
    ".apk", ".msi", ".jar", ".vbs", ".dmg",
    ".scr", ".pif", ".com", ".hta", ".reg"
  ];

  const termosPhishing = [
    "login", "verify", "account", "secure",
    "update", "confirm", "banking", "suporte",
    "senha", "cpf", "token", "acesso",
    "dados", "cartao", "atualizar", "validar",
    "desbloqueio", "suspensao", "regularize",
    "clique-aqui", "acesse-agora", "premio",
    "ganhou", "resgate", "pix-premio"
  ];

  const clickbait = [
    "veja", "saiba", "descubra", "inacreditável",
    "isso mudou tudo", "chocou o brasil",
    "ninguem esperava", "voce nao vai acreditar",
    "antes que apaguem", "compartilhe antes",
    "medicos ficaram em choque"
  ];

  const redirecionadores = [
    "?url=", "?redirect=", "?goto=", "?next=",
    "?return=", "?link=", "?to=", "?ref=",
    "?out=", "?target=", "?destination="
  ];

  /* ------------------------------------------
     1. PROTOCOLO
  ------------------------------------------ */
  if (url.protocol === "https:") {
    score += 2;
  } else {
    score -= 3;
    motivos.push("sem HTTPS");
  }

  /* ------------------------------------------
     2. FONTE RECONHECIDA
  ------------------------------------------ */
  if (confiaveis.some(s => dominio === s || dominio.endsWith("." + s))) {
    score += 5;
    motivos.push("fonte reconhecida e confiável");
  }

  /* ------------------------------------------
     3. ENCURTADORES DE LINK
  ------------------------------------------ */
  if (encurtadores.some(s => dominio === s || dominio.endsWith("." + s))) {
    score -= 4;
    motivos.push("link encurtado — destino real oculto");
  }

  /* ------------------------------------------
     4. DOMÍNIO COM IP DIRETO
  ------------------------------------------ */
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(dominio)) {
    score -= 5;
    motivos.push("usa endereço IP ao invés de domínio");
  }

  /* ------------------------------------------
     5. CARACTERES ESPECIAIS NO DOMÍNIO
  ------------------------------------------ */
  if (dominio.includes("@") || dominio.includes("%")) {
    score -= 4;
    motivos.push("caracteres especiais suspeitos no domínio");
  }

  /* ------------------------------------------
     6. MUITOS NÚMEROS NO DOMÍNIO
  ------------------------------------------ */
  if ((dominio.match(/\d/g) || []).length >= 4) {
    score -= 2;
    motivos.push("excesso de números no domínio");
  }

  /* ------------------------------------------
     7. SUBDOMÍNIOS EXCESSIVOS
  ------------------------------------------ */
  if (partes.length > 4) {
    score -= 3;
    motivos.push("subdomínio excessivo (" + partes.length + " níveis)");
  }

  /* ------------------------------------------
     8. MUITOS HÍFENS NO DOMÍNIO
  ------------------------------------------ */
  const hifens = (dominio.match(/-/g) || []).length;
  if (hifens >= 3) {
    score -= 2;
    motivos.push("muitos hífens no domínio (" + hifens + ")");
  }

  /* ------------------------------------------
     9. URL MUITO LONGA
  ------------------------------------------ */
  if (full.length > 140) {
    score -= 2;
    motivos.push("URL muito longa (" + full.length + " caracteres)");
  }

  /* ------------------------------------------
     10. PALAVRAS SENSACIONALISTAS / FAKE
  ------------------------------------------ */
  const fakesEncontradas = palavrasFake.filter(p => full.includes(p));
  if (fakesEncontradas.length > 0) {
    score -= Math.min(fakesEncontradas.length, 4);
    motivos.push("linguagem apelativa/sensacionalista");
  }

  /* ------------------------------------------
     11. IMITAÇÕES DE SITES CONHECIDOS (typosquatting)
  ------------------------------------------ */
  const imitacaoEncontrada = imitacoes.find(f => dominio.includes(f));
  if (imitacaoEncontrada) {
    score -= 5;
    motivos.push("imitação de site real (typosquatting)");
  }

  /* ------------------------------------------
     12. TLD SUSPEITO / ALTO RISCO
  ------------------------------------------ */
  if (tldSuspeitos.some(t => dominio.endsWith(t))) {
    score -= 3;
    motivos.push("extensão de domínio de alto risco");
  }

  /* ------------------------------------------
     13. SUBDOMÍNIO IMITANDO MARCA
         (ex: paypal.site-falso.com)
  ------------------------------------------ */
  if (partes.length > 2) {
    const subPartes = partes.slice(0, -2).join(".");
    const marcaAchada = marcas.find(m => subPartes.includes(m));
    if (marcaAchada) {
      score -= 5;
      motivos.push("subdomínio imita marca conhecida (" + marcaAchada + ")");
    }
  }

  /* ------------------------------------------
     14. HOMOGLIFOS / UNICODE NO DOMÍNIO
         (ex: pаypal.com com "а" cirílico)
  ------------------------------------------ */
  if (/[^\x00-\x7F]/.test(url.hostname)) {
    score -= 5;
    motivos.push("caracteres Unicode no domínio (possível ataque homoglifo)");
  }

  /* ------------------------------------------
     15. URL APONTA PARA ARQUIVO EXECUTÁVEL
  ------------------------------------------ */
  if (executaveis.some(e => path.endsWith(e))) {
    score -= 6;
    motivos.push("URL aponta diretamente para arquivo executável");
  }

  /* ------------------------------------------
     16. REDIRECIONAMENTO ENCADEADO
  ------------------------------------------ */
  if (redirecionadores.some(r => params.includes(r))) {
    score -= 3;
    motivos.push("parâmetro de redirecionamento suspeito na URL");
  }

  /* ------------------------------------------
     17. DOMÍNIO COM PADRÃO DGA
         (domínio gerado algoritmicamente — muitas
          consoantes, sem vogais, longo e randômico)
  ------------------------------------------ */
  const semVogais = sld.replace(/[aeiou0-9\-]/g, "");
  if (sld.length > 10 && semVogais.length / sld.length > 0.65) {
    score -= 3;
    motivos.push("domínio parece gerado automaticamente (DGA)");
  }

  /* ------------------------------------------
     18. PROFUNDIDADE EXCESSIVA DE SUBPATHS
  ------------------------------------------ */
  const profundidade = path.split("/").filter(Boolean).length;
  if (profundidade > 6) {
    score -= 2;
    motivos.push("profundidade de URL excessiva (" + profundidade + " níveis)");
  }

  /* ------------------------------------------
     19. TERMOS DE PHISHING NA URL
  ------------------------------------------ */
  const phishingAchados = termosPhishing.filter(p => full.includes(p));
  if (phishingAchados.length >= 2) {
    score -= Math.min(phishingAchados.length, 5);
    motivos.push("múltiplos termos de phishing na URL (" + phishingAchados.slice(0, 3).join(", ") + ")");
  } else if (phishingAchados.length === 1) {
    score -= 1;
    motivos.push("termo de phishing na URL (" + phishingAchados[0] + ")");
  }

  /* ------------------------------------------
     20. EXCESSO DE PARÂMETROS QUERY
  ------------------------------------------ */
  if (params) {
    const numParams = params.split("&").length;
    if (numParams > 6) {
      score -= 2;
      motivos.push("excesso de parâmetros na URL (" + numParams + ")");
    }
  }

  /* ------------------------------------------
     21. MÚLTIPLOS ENCODINGS (OFUSCAÇÃO)
  ------------------------------------------ */
  const encodings = (full.match(/%[0-9a-f]{2}/gi) || []).length;
  if (encodings > 4) {
    score -= 3;
    motivos.push("URL com múltiplos encodings — possível ofuscação");
  }

  /* ------------------------------------------
     22. PORTA NÃO PADRÃO
  ------------------------------------------ */
  if (url.port && !["80", "443", ""].includes(url.port)) {
    score -= 3;
    motivos.push("porta não padrão (" + url.port + ")");
  }

  /* ------------------------------------------
     23. ANO RECENTE NO NOME DO DOMÍNIO
         (sites falsos criados às pressas)
  ------------------------------------------ */
  const anoAtual = new Date().getFullYear();
  if (
    sld.includes(String(anoAtual)) ||
    sld.includes(String(anoAtual - 1))
  ) {
    score -= 1;
    motivos.push("ano recente embutido no domínio");
  }

  /* ------------------------------------------
     24. CLICKBAIT NO PATH DA URL
  ------------------------------------------ */
  const tituloDecode = decodeURIComponent(path.replaceAll("-", " "));
  const clickbaitAchado = clickbait.find(t => tituloDecode.includes(t));
  if (clickbaitAchado) {
    score -= 1;
    motivos.push("título com padrão clickbait");
  }

  /* ------------------------------------------
     25. DUPLA EXTENSÃO NO PATH
         (ex: foto.jpg.exe, documento.pdf.bat)
  ------------------------------------------ */
  if (/\.\w{2,4}\.\w{2,4}$/.test(path)) {
    score -= 4;
    motivos.push("dupla extensão de arquivo suspeita no path");
  }

  /* ------------------------------------------
     26. NOME DE DOMÍNIO MUITO CURTO OU GENÉRICO
         (ex: aa.tk, z1.xyz — domínios descartáveis)
  ------------------------------------------ */
  if (sld.length <= 3 && !confiaveis.some(s => dominio.includes(s))) {
    score -= 2;
    motivos.push("domínio muito curto — possível descartável");
  }

  /* ------------------------------------------
     27. MISTURA ESTRANHA DE LETRAS E NÚMEROS NO SLD
         (ex: 4pple, m1crosoft, g00gle)
  ------------------------------------------ */
  if (/[a-z]\d[a-z]|\d[a-z]\d/.test(sld)) {
    score -= 2;
    motivos.push("alternância suspeita de letras e números no domínio");
  }

  /* ------------------------------------------
     28. FRAGMENTO (HASH) SUSPEITO
         (ex: #/login, #/verify — SPAs de phishing)
  ------------------------------------------ */
  if (url.hash && /login|verify|account|senha|acesso/i.test(url.hash)) {
    score -= 2;
    motivos.push("fragmento de URL com termos de autenticação suspeitos");
  }

  /* ------------------------------------------
     29. TESTE DE CONECTIVIDADE REAL
  ------------------------------------------ */
  try {
    await fetch(url.origin, { method: "HEAD", mode: "no-cors" });
    score += 1;
  } catch {
    score -= 5;
    motivos.push("site não respondeu à requisição");
  }

  /* ------------------------------------------
     RESULTADO FINAL
  ------------------------------------------ */
  const unicosMotivos = [...new Set(motivos)];
  const texto = unicosMotivos.length
    ? "Fatores detectados: " + unicosMotivos.join(" · ")
    : "Nenhum fator suspeito detectado.";

  if (score >= 6) {
    abrirModalComIcon(
      getIconSVG("safe"),
      "Fonte Confiável",
      texto,
      "#00c896"
    );
  } else if (score >= 1) {
    abrirModalComIcon(
      getIconSVG("warning"),
      "Requer Atenção",
      texto,
      "#ffcc00"
    );
  } else {
    abrirModalComIcon(
      getIconSVG("danger"),
      "Possível Fake News / Golpe",
      texto,
      "#ff3b3b"
    );
  }
}

/* ==========================================
   EVENTOS
========================================== */
linkInput.addEventListener("keypress", e => {
  if (e.key === "Enter") verificarLink();
});

verifyBtn.addEventListener("click", verificarLink);

/* ==========================================
   RIPPLE BOTÃO
========================================== */
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

verifyBtn.addEventListener("click", function (e) {
  createRipple(e, this);
});

/* ==========================================
   ANIMAÇÃO DOS CARDS
========================================== */
const cards = document.querySelectorAll(".info-card");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.15 });

cards.forEach(card => observer.observe(card));

/* ==========================================
   EFEITO 3D
========================================== */
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

/* ==========================================
   DOTS
========================================== */
const dots = document.querySelectorAll(".dot");

dots.forEach(dot => {
  dot.addEventListener("click", () => {
    dot.style.transform = "scale(1.25)";

    setTimeout(() => {
      dot.style.transform = "scale(1)";
    }, 180);
  });
});