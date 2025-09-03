const translations = {
  pt: {
    headerTitle: "👨‍⚖️ Jurado",
    systemTitle: "Sistema de Competição de Capoeira",
    mainTitle: "Jurado B - Avaliação",
    labelCategoria: "Categoria:",
    labelRitmo: "Ritmo:",
    labelFase: "Fase:",
    labelAtleta: "Selecionar Atleta",
    optionSelect: "Selecione um atleta",
    labelNota: "Nota",
    labelPunição: "Punição",
    btnText: "📤 Enviar Nota",
    successMessage: "✅ Nota enviada com sucesso!",
    errorMessage: "❌ Erro ao enviar a nota.",
    athleteNotFound: "❌ Atleta não encontrado."
  },
  en: {
    headerTitle: "👨‍⚖️ Judge",
    systemTitle: "Capoeira Competition System",
    mainTitle: "Judge B - Evaluation",
    labelFase: "phase:",
    labelCategoria: "Category:",
    labelRitmo: "Rhythm:",
    labelAtleta: "Select Athlete",
    optionSelect: "Select an athlete",
    labelNota: "Score",
    labelPunição: "Punishment",
    btnText: "📤 Send Score",
    successMessage: "✅ Score submitted successfully!",
    errorMessage: "❌ Error submitting the score.",
    athleteNotFound: "❌ Athlete not found."
  },
  es: {
    headerTitle: "👨‍⚖️ Juez",
    systemTitle: "Sistema de Competición de Capoeira",
    mainTitle: "Juez B - Evaluación",
    labelCategoria: "Categoría:",
    labelRitmo: "Ritmo:",
    labelFase: "Fase:",
    labelAtleta: "Seleccionar Atleta",
    optionSelect: "Selecciona un atleta",
    labelNota: "Puntuación",
    labelPunição: "Castigo",
    btnText: "📤 Enviar Puntuación",
    successMessage: "✅ ¡Puntuación enviada con éxito!",
    errorMessage: "❌ Error al enviar la puntuación.",
    athleteNotFound: "❌ Atleta no encontrado."
  }
};

let currentLang = 'pt';

function updateTexts() {
  const t = translations[currentLang];

  const h1Logo = document.querySelector(".logo h1");
  if (h1Logo) h1Logo.textContent = t.headerTitle;

  const pLogo = document.querySelector(".logo p");
  if (pLogo) pLogo.textContent = t.systemTitle;

  const mainTitle = document.querySelector(".avaliacao-box h1");
  if (mainTitle) mainTitle.textContent = t.mainTitle;

   const labelFase = document.querySelector('label[for="fase"]');
  if (labelFase) labelFase.textContent = t.labelFase;

  const labelCategoria = document.querySelector('label[for="categoria"]');
  if (labelCategoria) labelCategoria.textContent = t.labelCategoria;

  const labelRitmo = document.querySelector('label[for="ritmo"]');
  if (labelRitmo) labelRitmo.textContent = t.labelRitmo;

  const labelAtleta = document.querySelector('label[for="atleta"]');
  if (labelAtleta) labelAtleta.textContent = t.labelAtleta;

  const optionDefault = document.querySelector('#atleta option');
  if (optionDefault) optionDefault.textContent = t.optionSelect;

  const notaLabels = document.querySelectorAll('label[for="nota"]');
  notaLabels.forEach(label => label.textContent = t.labelNota);

  const vantagemLabels = document.querySelectorAll('label[for="vantagem"]');
  vantagemLabels.forEach(label => label.textContent = t.labelVantagem);

  const btn = document.querySelector('#enviar');
  if (btn) btn.textContent = t.btnText;
}

function changeLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(lang);
  if (activeBtn) activeBtn.classList.add('active');
  localStorage.setItem('judgeLanguage', lang);
  updateTexts();
}

document.getElementById("pt")?.addEventListener("click", () => changeLanguage("pt"));
document.getElementById("en")?.addEventListener("click", () => changeLanguage("en"));
document.getElementById("es")?.addEventListener("click", () => changeLanguage("es"));

const savedLang = localStorage.getItem("judgeLanguage");
if (savedLang && translations[savedLang]) {
  changeLanguage(savedLang);
} else {
  updateTexts();
}

// Handle button click events to show success or error messages
document.getElementById("enviar").addEventListener("click", async () => {
  const chave = atletaSelect.value;
  const dados = dadosAtletas[chave];
  if (!dados) {
    alert(translations[currentLang].athleteNotFound);
    return;
  }

  const nome = dados.nome;
  const categoria = dados.categoria;
  const ritmo = dados.ritmo;
  const id = dados.id;
  nota = parseFloat(notaInput.value);
  punição = parseFloat(puniçãoInput.value);
  const notaFinal = (nota - punição).toFixed(1);

  const dadosNota = {
    atleta: nome,
    categoria,
    foto: dados.foto || "",
    jurado: JURADO,
    nota,
    notaFinal,
    ritmo,
    punição
  };

  const chavePadrao = `${nome}_${categoria}_${ritmo}`.toLowerCase().replace(/\s+/g, "_");

  try {
    await set(ref(dbEscrita, `avaliacoes${JURADO}/${ritmo}/${chavePadrao}`), dadosNota);
    await set(ref(dbEscrita, `avaliado${JURADO}/${ritmo}/${chavePadrao}`), true);
    await set(ref(dbLeitura, `avaliacaodejurado${JURADO}/${ritmo}/jurado${JURADO}/${id}`), null);

    const snapshot = await get(ref(dbLeitura, `avaliacaodejurado${JURADO}/${ritmo}/jurado${JURADO}`));
    if (!snapshot.exists()) {
      await set(ref(dbLeitura, `avaliacaodejurado${JURADO}/${ritmo}`), null);
    }

    alert(translations[currentLang].successMessage);

    nota = 9.0;
    punição = 0.0;
    notaInput.value = nota.toFixed(1);
    puniçãoInput.value = punição.toFixed(1);
    carregarAtletas();

  } catch (error) {
    console.error("Erro ao enviar a nota:", error);
    alert(translations[currentLang].errorMessage);
  }
});
