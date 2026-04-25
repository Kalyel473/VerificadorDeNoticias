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
    if (link.dataset.nav === navId) link.classList.add("active");
  });
}

function scrollToSection(sectionId, navId) {
  const target = sectionsMap[sectionId];
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.pageYOffset - 70;
  window.scrollTo({ top, behavior: "smooth" });
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
  if (scroll >= dicasTop) current = "dicas";
  else if (scroll >= identificarTop) current = "identificar";
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
      stroke="#00c896" stroke-width="2.8" fill="none"
      stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }
  if (type === "warning") {
    return `
    <svg viewBox="0 0 80 80" width="56" height="56">
      <polygon points="40,8 74,68 6,68"
      fill="rgba(255,204,0,.18)" stroke="#ffcc00" stroke-width="3"/>
      <line x1="40" y1="28" x2="40" y2="50"
      stroke="#ffcc00" stroke-width="5" stroke-linecap="round"/>
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
    stroke="red" stroke-width="3" stroke-linecap="round"/>
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
   EXTRAÇÃO DE TEXTO DO HTML
========================================== */
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

/* ==========================================
   ANÁLISE COMPLETA DO TEXTO DA NOTÍCIA
========================================== */
function analisarTextoCompleto(texto) {
  const t = texto.toLowerCase();
  const palavras = t.split(/\s+/).filter(Boolean);
  const total = palavras.length;
  const fatores = [];

  /* 1. MAIÚSCULAS EXCESSIVAS */
  const maiusculas = (texto.match(/[A-ZÁÉÍÓÚÀÃÕÂÊÔ]{4,}/g) || []).length;
  if (maiusculas >= 5) {
    fatores.push({ peso: -3, tag: "alerta", texto: `Excesso de letras maiúsculas (${maiusculas} ocorrências) — padrão comum em fake news` });
  } else if (maiusculas >= 2) {
    fatores.push({ peso: -1, tag: "atenção", texto: "Uso de maiúsculas em bloco detectado" });
  }

  /* 2. PONTUAÇÃO EXCESSIVA */
  const exclamacoes = (texto.match(/!/g) || []).length;
  const interrogacoes = (texto.match(/\?/g) || []).length;
  if (exclamacoes >= 4) {
    fatores.push({ peso: -2, tag: "alerta", texto: `Pontuação excessiva: ${exclamacoes} exclamações — linguagem sensacionalista` });
  } else if (exclamacoes >= 2) {
    fatores.push({ peso: -1, tag: "atenção", texto: "Múltiplas exclamações detectadas" });
  }
  if (interrogacoes >= 4) {
    fatores.push({ peso: -1, tag: "atenção", texto: `Muitas perguntas retóricas (${interrogacoes}) — técnica de manipulação emocional` });
  }

  /* 3. PALAVRAS SENSACIONALISTAS */
  const sensacional = [
    "urgente", "imperdível", "chocante", "inacreditável", "bomba", "revelado",
    "vazado", "censurado", "milagre", "exclusivo", "segredo", "espalhe",
    "compartilhe agora", "antes que apaguem", "governo esconde",
    "médicos odeiam", "eles não querem que você saiba", "viralizou",
    "nunca antes visto", "assustador", "confirmado agora", "proibido",
    "ninguém acredita", "isso mudou tudo", "chocou o brasil"
  ];
  const sensEnc = sensacional.filter(p => t.includes(p));
  if (sensEnc.length >= 3) {
    fatores.push({ peso: -3, tag: "alerta", texto: `Linguagem fortemente sensacionalista: "${sensEnc.slice(0, 3).join('", "')}"` });
  } else if (sensEnc.length >= 1) {
    fatores.push({ peso: -2, tag: "atenção", texto: `Termos sensacionalistas: "${sensEnc.join('", "')}"` });
  }

  /* 4. PRESENÇA DE FONTES CITADAS */
  const fontesPadroes = [
    "segundo", "de acordo com", "conforme", "afirmou", "declarou", "disse",
    "informou", "relatou", "apurou", "publicou", "divulgou", "noticiou",
    "pesquisa", "estudo", "levantamento", "ministério", "secretaria",
    "especialistas afirmam", "cientistas"
  ];
  const fontesEnc = fontesPadroes.filter(p => t.includes(p)).length;
  if (fontesEnc === 0 && total > 80) {
    fatores.push({ peso: -3, tag: "alerta", texto: "Nenhuma fonte citada — texto sem atribuição de informações" });
  } else if (fontesEnc >= 3) {
    fatores.push({ peso: 2, tag: "positivo", texto: `Múltiplas fontes citadas (${fontesEnc} referências)` });
  } else if (fontesEnc >= 1) {
    fatores.push({ peso: 1, tag: "positivo", texto: "Ao menos uma fonte é citada no texto" });
  }

  /* 5. APELO AO MEDO */
  const apelMedo = [
    "cuidado", "perigo", "atenção", "alerta", "grave", "sérios riscos",
    "todos serão afetados", "isso vai te matar", "pode matar", "risco de morte",
    "acorde", "estão te enganando", "não deixe seus filhos", "o fim",
    "apocalipse", "colapso", "golpe", "ditadura", "invasão"
  ];
  const medoEnc = apelMedo.filter(p => t.includes(p));
  if (medoEnc.length >= 3) {
    fatores.push({ peso: -3, tag: "alerta", texto: `Forte apelo ao medo: "${medoEnc.slice(0, 3).join('", "')}"` });
  } else if (medoEnc.length >= 1) {
    fatores.push({ peso: -1, tag: "atenção", texto: `Apelo emocional ao medo: "${medoEnc[0]}"` });
  }

  /* 6. CONTEXTO TEMPORAL */
  const temData = /\b(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|\d{1,2}\/\d{1,2}\/\d{2,4}|20\d\d|ontem|hoje|esta semana|este mês)\b/i.test(texto);
  if (!temData && total > 100) {
    fatores.push({ peso: -2, tag: "atenção", texto: "Ausência de datas ou contexto temporal — conteúdo fora de época?" });
  } else if (temData) {
    fatores.push({ peso: 1, tag: "positivo", texto: "Referência temporal presente no texto" });
  }

  /* 7. AUTORIA */
  const temAutor = /\b(redação|por |repórter|jornalista|editor|equipe|staff|correspondent)\b/i.test(texto);
  if (!temAutor && total > 80) {
    fatores.push({ peso: -1, tag: "atenção", texto: "Autoria não identificada no conteúdo" });
  } else if (temAutor) {
    fatores.push({ peso: 1, tag: "positivo", texto: "Autoria ou veículo identificado" });
  }

  /* 8. GENERALIZAÇÕES ABSOLUTAS */
  const absolutos = [
    "todo mundo sabe", "todos concordam", "é fato que", "ninguém pode negar",
    "ficou provado", "já está comprovado", "100%", "absolutamente certo",
    "definitivamente", "sem sombra de dúvida", "é mentira que", "não existe"
  ];
  const absEnc = absolutos.filter(p => t.includes(p));
  if (absEnc.length >= 2) {
    fatores.push({ peso: -2, tag: "alerta", texto: `Generalizações absolutas: "${absEnc.slice(0, 2).join('", "')}"` });
  } else if (absEnc.length === 1) {
    fatores.push({ peso: -1, tag: "atenção", texto: `Afirmação absoluta sem evidência: "${absEnc[0]}"` });
  }

  /* 9. PEDIDO DE COMPARTILHAMENTO */
  const share = [
    "compartilhe", "repasse", "manda pra todo mundo", "passa pra frente",
    "mostre para", "avise seus amigos", "salva esse post", "não deixa sumir",
    "antes que deletem", "copia e cola"
  ];
  const shareEnc = share.filter(p => t.includes(p));
  if (shareEnc.length >= 1) {
    fatores.push({ peso: -3, tag: "alerta", texto: `Pedido de compartilhamento urgente: "${shareEnc[0]}" — padrão clássico de desinformação` });
  }

  /* 10. TEORIAS DA CONSPIRAÇÃO */
  const conspiracao = [
    "élite", "illuminati", "deep state", "estado profundo", "nova ordem mundial",
    "agenda oculta", "querem te calar", "supressão da verdade", "grande reset",
    "chip", "implante", "controle mental", "5g mata", "vacina mata",
    "veneno na água", "chemtrail"
  ];
  const conspEnc = conspiracao.filter(p => t.includes(p));
  if (conspEnc.length >= 2) {
    fatores.push({ peso: -4, tag: "alerta", texto: `Elementos de teoria da conspiração: "${conspEnc.slice(0, 2).join('", "')}"` });
  } else if (conspEnc.length === 1) {
    fatores.push({ peso: -2, tag: "atenção", texto: `Referência a narrativa conspiratória: "${conspEnc[0]}"` });
  }

  /* 11. SAÚDE FALSA / CURAS MILAGROSAS */
  const saudeFalsa = [
    "cura definitiva", "cura o câncer", "elimina o vírus", "médicos estão escondendo",
    "faz emagrecer", "basta tomar", "receita caseira", "remédio natural",
    "farmacêuticas não querem", "proibido pela anvisa", "proibido nos eua",
    "funciona mesmo"
  ];
  const saudeEnc = saudeFalsa.filter(p => t.includes(p));
  if (saudeEnc.length >= 1) {
    fatores.push({ peso: -4, tag: "alerta", texto: `Alegação de saúde suspeita: "${saudeEnc[0]}"` });
  }

  /* 12. REFERÊNCIA A FACT-CHECKERS */
  const factcheck = [
    "agência lupa", "aos fatos", "boatos.org", "e-farsas", "snopes",
    "politifact", "fact.check", "verificado por", "fato ou fake", "checamos", "checagem"
  ];
  const fcEnc = factcheck.filter(p => t.includes(p));
  if (fcEnc.length >= 1) {
    fatores.push({ peso: 2, tag: "positivo", texto: "Referência a agência de fact-checking detectada" });
  }

  /* 13. DIVERSIDADE VOCABULAR */
  const unicos = new Set(palavras).size;
  const diversidade = total > 0 ? unicos / total : 0;
  if (total > 100 && diversidade < 0.35) {
    fatores.push({ peso: -1, tag: "atenção", texto: `Baixa diversidade vocabular (${Math.round(diversidade * 100)}%) — texto repetitivo` });
  } else if (total > 100 && diversidade > 0.6) {
    fatores.push({ peso: 1, tag: "positivo", texto: `Boa diversidade vocabular (${Math.round(diversidade * 100)}%) — escrita elaborada` });
  }

  /* 14. EXTENSÃO DO TEXTO */
  if (total < 60) {
    fatores.push({ peso: -1, tag: "atenção", texto: "Texto muito curto — sem profundidade informativa" });
  } else if (total > 300) {
    fatores.push({ peso: 1, tag: "positivo", texto: "Texto extenso — mais espaço para contextualização" });
  }

  /* 15. POLARIZAÇÃO POLÍTICA */
  const polarizacao = [
    "comunista", "fascista", "nazista", "esquerdista", "direitista",
    "lula ladrão", "bolsominion", "petralha", "golpista", "milícia",
    "bandido vermelho", "coxinha", "mortadela"
  ];
  const polEnc = polarizacao.filter(p => t.includes(p));
  if (polEnc.length >= 2) {
    fatores.push({ peso: -2, tag: "atenção", texto: `Linguagem política polarizada: "${polEnc.slice(0, 2).join('", "')}"` });
  }

  const scoreTotal = fatores.reduce((s, f) => s + f.peso, 0);
  return { score: scoreTotal, fatores, totalPalavras: total };
}

/* ==========================================
   ANÁLISE DO DOMÍNIO (complementar)
========================================== */
function analisarDominio(url) {
  const dominio = url.hostname.toLowerCase();
  const partes = dominio.split(".");
  const fatores = [];
  let score = 0;

  const confiaveis = [
    "g1.globo.com", "uol.com.br", "bbc.com", "bbc.co.uk", "cnn.com",
    "reuters.com", "apnews.com", "gov.br", "folha.uol.com.br",
    "estadao.com.br", "oglobo.globo.com", "correiobraziliense.com.br",
    "agenciabrasil.ebc.com.br", "ibge.gov.br", "portal.fiocruz.br",
    "veja.abril.com.br", "exame.com", "valor.com.br",
    "gazetadopovo.com.br", "terra.com.br"
  ];

  const tldSuspeitos = [
    ".xyz", ".top", ".click", ".tk", ".ml", ".ga", ".cf",
    ".pw", ".gq", ".icu", ".buzz", ".cc", ".ws", ".monster",
    ".cyou", ".cfd", ".bond"
  ];

  const encurtadores = [
    "bit.ly", "tinyurl.com", "cutt.ly", "ow.ly",
    "t.co", "goo.gl", "rb.gy", "linktr.ee"
  ];

  if (url.protocol === "https:") {
    score += 1;
  } else {
    score -= 1;
    fatores.push({ peso: -1, tag: "atenção", texto: "Site sem HTTPS" });
  }

  if (confiaveis.some(s => dominio === s || dominio.endsWith("." + s))) {
    score += 4;
    fatores.push({ peso: 4, tag: "positivo", texto: `Domínio reconhecido como veículo jornalístico confiável: ${dominio}` });
  }

  if (encurtadores.some(s => dominio === s)) {
    score -= 2;
    fatores.push({ peso: -2, tag: "atenção", texto: "Link encurtado — destino real oculto" });
  }

  if (tldSuspeitos.some(t => dominio.endsWith(t))) {
    score -= 2;
    fatores.push({ peso: -2, tag: "atenção", texto: `Extensão de domínio de alto risco: .${partes.pop()}` });
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(dominio)) {
    score -= 3;
    fatores.push({ peso: -3, tag: "alerta", texto: "Endereço IP direto em vez de domínio" });
  }

  if (partes.length > 4) {
    score -= 1;
    fatores.push({ peso: -1, tag: "atenção", texto: `Subdomínios excessivos (${partes.length} níveis)` });
  }

  return { score, fatores };
}

/* ==========================================
   CALCULAR VEREDICTO FINAL
========================================== */
function calcVeredicto(score, fatores) {
  if (score >= 5) {
    return {
      icon: getIconSVG("safe"),
      titulo: "Provavelmente Confiável",
      cor: "#00c896",
      resumo: fatores
    };
  } else if (score >= 2) {
    return {
      icon: getIconSVG("warning"),
      titulo: "Requer Atenção",
      cor: "#ffcc00",
      resumo: fatores
    };
  } else if (score >= -2) {
    return {
      icon: getIconSVG("warning"),
      titulo: "Conteúdo Suspeito",
      cor: "#ff8c00",
      resumo: fatores
    };
  } else {
    return {
      icon: getIconSVG("danger"),
      titulo: "Alto Risco de Fake News",
      cor: "#ff3b3b",
      resumo: fatores
    };
  }
}

/* ==========================================
   FORMATAR TEXTO DO MODAL
========================================== */
function formatarTextoModal(fatores, totalPalavras, fonte) {
  const negativos = fatores.filter(f => f.peso < 0);
  const positivos = fatores.filter(f => f.peso > 0);

  let linhas = [];

  if (fonte) linhas.push(`Fonte: ${fonte}`);
  if (totalPalavras) linhas.push(`Palavras analisadas: ${totalPalavras}`);
  if (linhas.length) linhas.push("");

  if (negativos.length > 0) {
    linhas.push("⚠ Fatores de risco:");
    negativos.forEach(f => linhas.push(`  · ${f.texto}`));
  }

  if (positivos.length > 0) {
    if (negativos.length > 0) linhas.push("");
    linhas.push("✓ Fatores positivos:");
    positivos.forEach(f => linhas.push(`  · ${f.texto}`));
  }

  if (fatores.length === 0) {
    linhas.push("Nenhum fator significativo detectado.");
  }

  return linhas.join("\n");
}

/* ==========================================
   VERIFICAÇÃO PRINCIPAL — LINK
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

  if (!/^https?:\/\//i.test(valor)) valor = "https://" + valor;

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

  verifyBtn.disabled = true;
  verifyBtn.textContent = "Analisando...";

  /* Tenta buscar o conteúdo real da página via proxy CORS */
  let textoExtraido = "";
  try {
    const proxy = "https://api.allorigins.win/get?url=" + encodeURIComponent(valor);
    const resp = await fetch(proxy);
    const json = await resp.json();
    textoExtraido = extrairTextoHTML(json.contents || "");
  } catch (e) {
    textoExtraido = "";
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
    fatoresCombinados.push({
      peso: 0,
      tag: "atenção",
      texto: "Conteúdo da página não pôde ser extraído — análise baseada apenas no domínio"
    });
  }

  const veredicto = calcVeredicto(scoreTotal, fatoresCombinados);
  const textoModal = formatarTextoModal(fatoresCombinados, totalPalavras || null, url.hostname);

  verifyBtn.disabled = false;
  verifyBtn.textContent = "Verificar";

  abrirModalComIcon(veredicto.icon, veredicto.titulo, textoModal, veredicto.cor);
}

/* ==========================================
   EVENTOS DO INPUT
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
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
}, { threshold: 0.15 });

cards.forEach(card => observer.observe(card));

/* ==========================================
   EFEITO 3D NOS CARDS
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
    setTimeout(() => { dot.style.transform = "scale(1)"; }, 180);
  });
});