import { db4 as db } from "./firebase.js";
import { ref, onValue, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// 📌 Elementos HTML
const atletaSelect = document.getElementById("atleta-selection");
const categoriaSelect = document.getElementById("categoria-selection");
const ritmoSelect = document.getElementById("ritmo-selection");
const btnEnviar = document.getElementById("enviar-jurado");
const faseAtualNome = document.getElementById("fase-atual-nome");

// Botões das fases com IDs únicos
const btnClassificatoria = document.getElementById("btn-classificatoria");
const btnOitavas = document.getElementById("btn-oitavas");
const btnQuartas = document.getElementById("btn-quartas");
const btnSemifinal = document.getElementById("btn-semifinal");
const btnFinal = document.getElementById("btn-final");

// Array com todos os botões de fase para facilitar o gerenciamento
const botoesFase = [btnClassificatoria, btnOitavas, btnQuartas, btnSemifinal, btnFinal];

let dadosAtletas = {}; // 🔹 Agora sim! Armazena info completa, inclusive foto

// 🔄 Variável para controlar o modo atual
let modoAtual = "avaliacoes"; // ou "fase"
let dadosFaseAtual = {}; // 🔹 Armazena todos os dados da fase atual

// 🎯 Função para atualizar botões ativos e indicador de fase
function atualizarFaseAtiva(faseNome, botaoAtivo) {
    // Remove classe active de todos os botões
    botoesFase.forEach(btn => {
        if (btn) btn.classList.remove('active');
    });
    
    // Adiciona classe active ao botão clicado
    if (botaoAtivo) {
        botaoAtivo.classList.add('active');
    }
    
    // Atualiza o indicador de fase
    if (faseAtualNome) {
        faseAtualNome.textContent = faseNome;
    }
}

// 🔁 Função para carregar dados do enviosParaOperador
function carregarEnviosParaOperador() {
  modoAtual = "classificatória";
  atualizarFaseAtiva("classificatória", btnClassificatoria);
  
  onValue(ref(db, "classificatória"), snap => {
    categoriaSelect.innerHTML = "<option value=''>Selecione</option>";
    atletaSelect.innerHTML = "<option value=''>Selecione</option>";
    dadosAtletas = {};

    if (snap.exists()) {
      const data = snap.val();
      const categorias = Object.keys(data);

      categorias.forEach(categoria => {
        const opt = document.createElement("option");
        opt.value = categoria;
        opt.textContent = categoria;
        categoriaSelect.appendChild(opt);
      });
    }
  });
}

categoriaSelect.addEventListener("change", () => {
  const categoria = categoriaSelect.value;
  atletaSelect.innerHTML = "<option value=''>Selecione</option>"; // Limpa as opções anteriores
  
  if (!categoria) return; // Se não houver categoria selecionada, nada acontece

  dadosAtletas = {}; // Resetar os dados dos atletas ao trocar a categoria

  if (modoAtual === "fases") {
    // 🔹 Carrega atletas da fase classificatória
    const categoriaRef = ref(db, `fases/${categoria}`);
    
    onValue(categoriaRef, snap => {
      atletaSelect.innerHTML = "<option value=''>Selecione</option>";

      if (snap.exists()) {
        const atletasObj = snap.val();
        for (const id in atletasObj) {
          const atleta = atletasObj[id];
          if (atleta.nome) {
            dadosAtletas[atleta.nome] = {
              id,
              nome: atleta.nome,
              categoria: atleta.categoria || categoria,
              foto: atleta.foto || "",
              numero: atleta.numero || ""
            };

            const opt = document.createElement("option");
            opt.value = atleta.nome;
            opt.textContent = `${atleta.numero || ""} - ${atleta.nome}`;
            atletaSelect.appendChild(opt);
          }
        }
      }
    }, { onlyOnce: true });

  } else {
    // 🔹 Carrega atletas de fases eliminatórias (oitavas, quartas, semifinal, final)
    const categoriaRef = ref(db, `${modoAtual}/${categoria}`);

    onValue(categoriaRef, snap => {
      atletaSelect.innerHTML = "<option value=''>Selecione</option>";

      if (snap.exists()) {
        const atletasObj = snap.val();
        for (const id in atletasObj) {
          const atleta = atletasObj[id];
          if (atleta && atleta.nome) {
            dadosAtletas[atleta.nome] = {
              id,
              nome: atleta.nome,
              categoria: atleta.categoria || categoria,
              foto: atleta.foto || "",
              numero: atleta.numero || ""
            };

            const opt = document.createElement("option");
            opt.value = atleta.nome;
            opt.textContent = `${atleta.numero || ""} - ${atleta.nome}`;
            atletaSelect.appendChild(opt);
          }
        }
      }
    }, { onlyOnce: true });
  }
});


// 📌 Função para carregar dados de uma fase específica
function carregarDadosDaFase(caminho) {
    modoAtual = "fase";
    console.log(`🔍 Carregando dados da fase: ${caminho}`);
    
    const faseRef = ref(db, caminho);

    onValue(faseRef, snapshot => {
        const dados = snapshot.val();
        console.log(`📊 Dados recebidos de ${caminho}:`, dados);

        // Limpar selects
        atletaSelect.innerHTML = '<option value="">Selecione um Atleta</option>';
        categoriaSelect.innerHTML = '<option value="">Selecione uma Categoria</option>';
        dadosAtletas = {}; // Resetar dados
        dadosFaseAtual = {}; // Resetar dados da fase

        if (!dados) {
            console.log(`⚠️ Nenhum dado encontrado em ${caminho}`);
            return;
        }

        // Salvar todos os dados da fase
        dadosFaseAtual = dados;
        
        // Coletar todas as categorias únicas
        const categoriasSet = new Set();

        for (const id in dados) {
            const entry = dados[id];
            console.log(`🔍 Processando entrada ${id}:`, entry);
            
            if (!entry || !entry.categoria) {
                console.log(`⚠️ Entrada sem categoria ${id}:`, entry);
                continue;
            }

            // Adicionar categoria ao set (evita duplicatas)
            categoriasSet.add(entry.categoria);
        }

        // Adicionar categorias ao select
        categoriasSet.forEach(categoria => {
            const optCategoria = document.createElement("option");
            optCategoria.value = categoria;
            optCategoria.textContent = categoria;
            categoriaSelect.appendChild(optCategoria);
        });
        
        console.log(`✅ Carregadas ${categoriasSet.size} categorias: ${Array.from(categoriasSet).join(', ')}`);
        console.log(`📋 Agora selecione uma categoria para ver os atletas`);
    });
}

// 🚀 Inicializar com dados do enviosParaOperador
carregarEnviosParaOperador();

// Evento do botão Classificatória
btnClassificatoria.addEventListener("click", () => {
    console.log("🔘 Botão classificatória clicado");
    atualizarFaseAtiva("classificatória", btnClassificatoria);
    carregarDadosDaFase("classificatória");
    carregarEnviosParaOperador();
});

// Eventos dos botões
btnOitavas.addEventListener("click", () => {
    console.log("🔘 Botão Oitavas clicado");
    atualizarFaseAtiva("oitavas", btnOitavas);
    carregarDadosDaFase("oitavas");
    carregarEnviosParaOperador1();
});

btnQuartas.addEventListener("click", () => {
    console.log("🔘 Botão Quartas clicado");
    atualizarFaseAtiva("quartas", btnQuartas);
    carregarDadosDaFase("quartas");
    carregarEnviosParaOperador2();
});

btnSemifinal.addEventListener("click", () => {
    console.log("🔘 Botão Semifinal clicado");
    atualizarFaseAtiva("semi-final", btnSemifinal);
    carregarDadosDaFase("semifinal");
    carregarEnviosParaOperador3();
});

btnFinal.addEventListener("click", () => {
    console.log("🔘 Botão Final clicado");
    atualizarFaseAtiva("final", btnFinal);
    carregarDadosDaFase("final");
    carregarEnviosParaOperador4();
});

// Enviar para Jurados

btnEnviar.addEventListener("click", () => {
  // Obtém os atletas selecionados, categoria, ritmo e fase
  const atletas = Array.from(atletaSelect.selectedOptions).map(opt => opt.value);
  const categoria = categoriaSelect.value;
  const ritmo = ritmoSelect.value;
  const faseSelecionada = faseAtualNome.textContent; // Obtém o nome da fase selecionada

  // Verifica se todos os campos necessários estão preenchidos
  if (!atletas.length || !categoria || !ritmo || !faseSelecionada) {
    alert("⚠️ Selecione um atleta, uma categoria, o ritmo e a fase.");
    return;
  }

  // Definindo os jurados e seus caminhos
  const jurados = [
    { raiz: "avaliacaodejuradoA", nome: "juradoA" },
    { raiz: "avaliacaodejuradoB", nome: "juradoB" },
    { raiz: "avaliacaodejuradoC", nome: "juradoC" }
  ];

  // Percorre cada atleta selecionado
  atletas.forEach(nomeAtleta => {
    const info = dadosAtletas[nomeAtleta];

    // Verifica se as informações do atleta foram encontradas
    if (!info) {
      console.warn(`⚠️ Dados do atleta "${nomeAtleta}" não encontrados.`);
      return;
    }


    // Monta os dados a serem enviados
    const dados = {
      nome: info.nome,
      categoria: info.categoria,
      ritmo: ritmo,
      foto: info.foto || "", // Foto, se disponível
      numero: info.numero || "",
      fase: faseSelecionada  // Fase do atleta
    };

    // Envia os dados para cada jurado
    jurados.forEach(({ raiz, nome }) => {
      const caminho = `${raiz}/${faseSelecionada}/${ritmo}/${nome}`;

      // Envia os dados para o Firebase
      push(ref(db, caminho), dados)
        .then(() => {
          console.log(`✅ Enviado para ${caminho}, dados`);
        })
        .catch(err => {
          console.error(`❌ Erro ao enviar para ${caminho}:`, err);
        });
    });
  });



  alert("✅ Dados enviados para os jurados!");

  // Limpar selects após envio
  //atletaSelect.innerHTML = "<option value=''>Selecione</option>";
  //categoriaSelect.value = "";
 // ritmoSelect.value = "";
});

// 🔁 Função para carregar dados do enviosParaOperador
function carregarEnviosParaOperador1() {
  modoAtual = "oitavas";
  atualizarFaseAtiva("oitavas", btnOitavas);
  
  onValue(ref(db, "oitavas"), snap => {
    categoriaSelect.innerHTML = "<option value=''>Selecione</option>";
    atletaSelect.innerHTML = "<option value=''>Selecione</option>";
    dadosAtletas = {};

    if (snap.exists()) {
      const data = snap.val();
      const categorias = Object.keys(data);

      categorias.forEach(categoria => {
        const opt = document.createElement("option");
        opt.value = categoria;
        opt.textContent = categoria;
        categoriaSelect.appendChild(opt);
      });
    }
  });
}

// 🔁 Função para carregar dados do enviosParaOperador
function carregarEnviosParaOperador2() {
  modoAtual = "quartas";
  atualizarFaseAtiva("quartas", btnQuartas);
  
  onValue(ref(db, "quartas"), snap => {
    categoriaSelect.innerHTML = "<option value=''>Selecione</option>";
    atletaSelect.innerHTML = "<option value=''>Selecione</option>";
    dadosAtletas = {};

    if (snap.exists()) {
      const data = snap.val();
      const categorias = Object.keys(data);

      categorias.forEach(categoria => {
        const opt = document.createElement("option");
        opt.value = categoria;
        opt.textContent = categoria;
        categoriaSelect.appendChild(opt);
      });
    }
  });
}

// 🔁 Função para carregar dados do enviosParaOperador
function carregarEnviosParaOperador3() {
  modoAtual = "semi-final";
  atualizarFaseAtiva("semi-final", btnSemifinal);
  
  onValue(ref(db, "semi-final"), snap => {
    categoriaSelect.innerHTML = "<option value=''>Selecione</option>";
    atletaSelect.innerHTML = "<option value=''>Selecione</option>";
    dadosAtletas = {};

    if (snap.exists()) {
      const data = snap.val();
      const categorias = Object.keys(data);

      categorias.forEach(categoria => {
        const opt = document.createElement("option");
        opt.value = categoria;
        opt.textContent = categoria;
        categoriaSelect.appendChild(opt);
      });
    }
  });
}

// 🔁 Função para carregar dados do enviosParaOperador
function carregarEnviosParaOperador4() {
  modoAtual = "final";
  atualizarFaseAtiva("final", btnFinal);
  
  onValue(ref(db, "final"), snap => {
    categoriaSelect.innerHTML = "<option value=''>Selecione</option>";
    atletaSelect.innerHTML = "<option value=''>Selecione</option>";
    dadosAtletas = {};

    if (snap.exists()) {
      const data = snap.val();
      const categorias = Object.keys(data);

      categorias.forEach(categoria => {
        const opt = document.createElement("option");
        opt.value = categoria;
        opt.textContent = categoria;
        categoriaSelect.appendChild(opt);
      });
    }
  });
}
