import { db3, db4 } from './firebase.js';
import {  ref, get, set, push  } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Variáveis globais / elementos
const tabelaPrincipal = document.querySelector("#tabela-principal");
const tabelaSecundaria = document.querySelector("#tabela-secundaria");
const btnMediaTotal = document.getElementById("MediaTotal");
const btnVoltarParaTabelaPrincipal = document.getElementById("voltarParaTabelaPrincipal");
const seletorCategoriaSecundaria = document.getElementById("seletor-categoria1");
const seletorFaseSecundaria = document.getElementById("seletor-fase-grupo1");
const tabelaSecundariaBody = document.querySelector("#tabela-secundaria tbody");

let dadosOriginais = []; // sempre guarda TODOS os atletas da fase atual

// ---- Navegação ----
btnMediaTotal.addEventListener("click", async () => {
  tabelaPrincipal.style.display = "none";
  tabelaSecundaria.style.display = "block";
  await recarregarFase(); // carrega do Firebase e monta select
});

btnVoltarParaTabelaPrincipal.addEventListener("click", () => {
  tabelaSecundaria.style.display = "none";
  tabelaPrincipal.style.display = "block";
});

// ---- Filtros ----
// Trocar FASE => recarrega do Firebase e remonta select
seletorFaseSecundaria.addEventListener("change", async () => {
  await recarregarFase();
});

// Trocar CATEGORIA => NÃO busca no Firebase; só filtra localmente
seletorCategoriaSecundaria.addEventListener("change", () => {
  exibirLinhasTabelaSecundaria(dadosOriginais);
});

// ---- Carregamento principal por fase (recria select + tabela) ----
async function recarregarFase() {
  const faseSelecionada = seletorFaseSecundaria.value;
  if (!faseSelecionada) {
    alert("Por favor, selecione uma fase.");
    return;
  }

  dadosOriginais = await carregarDadosPorGrupoFaseSecundaria(faseSelecionada); // SEM filtrar por categoria
  console.log("Dados carregados para a fase", faseSelecionada, dadosOriginais);

  if (!dadosOriginais.length) {
    alert("Nenhum dado encontrado para a fase selecionada.");
  }

  atualizarSeletorCategoriasSecundaria(dadosOriginais); // monta o select com TODAS as categorias
  seletorCategoriaSecundaria.value = ""; // volta para "Todas"
  exibirLinhasTabelaSecundaria(dadosOriginais);
}

// ---- Buscar no Firebase (todas as categorias da fase) ----
async function carregarDadosPorGrupoFaseSecundaria(fase) {
  const ritmos = ['regional', 'angola', 'iuna'];
  const atletasNotas = {};

  for (let ritmoSelecionado of ritmos) {
    const caminhoRef = ref(db3, `medias/${ritmoSelecionado}/${fase}`);
    const snap = await get(caminhoRef);

    if (!snap.exists()) continue;

    snap.forEach(child => {
      const v = child.val();
      const atleta = v.atleta;
      const categoriaDB = v.categoria;

      if (!atletasNotas[atleta]) {
        atletasNotas[atleta] = {
          atleta,
          categoria: categoriaDB,
          mediaRegional: 0,
          mediaAngola: 0,
          mediaIuna: 0,
          notaFinal: 0
        };
      }

      const key = `media${ritmoSelecionado.charAt(0).toUpperCase() + ritmoSelecionado.slice(1)}`;
      const mediaNum = parseFloat(v[key] ?? 0) || 0;

      if (ritmoSelecionado === 'regional') atletasNotas[atleta].mediaRegional = mediaNum;
      if (ritmoSelecionado === 'angola')   atletasNotas[atleta].mediaAngola   = mediaNum;
      if (ritmoSelecionado === 'iuna')     atletasNotas[atleta].mediaIuna     = mediaNum;

      atletasNotas[atleta].notaFinal = parseFloat(
        (atletasNotas[atleta].mediaRegional +
         atletasNotas[atleta].mediaAngola +
         atletasNotas[atleta].mediaIuna).toFixed(2)
      );
    });
  }

  return Object.values(atletasNotas);
}

// ---- Montar select de categorias (NUNCA com dados filtrados) ----
function atualizarSeletorCategoriasSecundaria(dados) {
  const categorias = [...new Set(dados.map(d => d.categoria).filter(Boolean))].sort();
  seletorCategoriaSecundaria.innerHTML = '<option value="">Todas</option>';
  categorias.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    seletorCategoriaSecundaria.appendChild(opt);
  });
}

// ---- Render da tabela (filtra localmente por categoria selecionada) ----
function exibirLinhasTabelaSecundaria(dados) {
  const categoriaSelecionada = seletorCategoriaSecundaria.value;
  tabelaSecundariaBody.innerHTML = "";

  const dadosFiltrados = categoriaSelecionada
    ? dados.filter(d => d.categoria === categoriaSelecionada)
    : dados;

  dadosFiltrados.sort((a, b) => b.notaFinal - a.notaFinal);

  dadosFiltrados.forEach((dado, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${dado.atleta}</td>
      <td>${dado.categoria ?? ""}</td>
      <td>${(dado.mediaRegional ?? 0).toFixed(2)}</td>
      <td>${(dado.mediaAngola ?? 0).toFixed(2)}</td>
      <td>${(dado.mediaIuna ?? 0).toFixed(2)}</td>
      <td>${(dado.notaFinal ?? 0).toFixed(2)}</td>
      <td class="col-proxima-fase"></td>
    `;

    // Marca automaticamente os 16 primeiros
 //if (index < 16) {
  //[...tr.children].forEach(td => {
   // td.style.backgroundColor = "lightgreen";
   // td.style.fontWeight = "bold";
 // });
//}

    tabelaSecundariaBody.appendChild(tr);
  });
}

let faseAtual = null; // guarda a última fase marcada
let qtdAtual = 0;     // guarda a quantidade da fase


function marcarMelhores(qtd, fase) {
  const linhas = tabelaSecundariaBody.querySelectorAll("tr");

  linhas.forEach((tr, index) => {
    const tds = tr.children;

    // Reseta estilo e coluna "Próxima Fase"
    [...tds].forEach(td => {
      td.style.backgroundColor = "";
      td.style.fontWeight = "";
    });
    const tdProximaFase = tr.querySelector(".col-proxima-fase");
    if (tdProximaFase) tdProximaFase.textContent = "";

    // Marca apenas os primeiros "qtd"
    if (index < qtd) {
      [...tds].forEach(td => {
        td.style.backgroundColor = "lightgreen";
        td.style.fontWeight = "bold";
      });

      if (tdProximaFase) tdProximaFase.textContent = "Classificado";
    }
  });

  faseAtual = fase;
  qtdAtual = qtd;
}



// ---- Funções chamadas pelos botões ----
window.oitavas = function() {
  marcarMelhores(16, "oitavas");
};

window.quartas = function() {
  marcarMelhores(8, "quartas");
};

window.semifinal = function() {
  marcarMelhores(4, "semi-final");
};

window.final = function() {
  marcarMelhores(2, "final");
};

// Função genérica para enviar os atletas já marcados em verde
// Função genérica para enviar os atletas já marcados em verde
async function enviarSelecionados(fase, qtd) {
  const linhas = tabelaSecundariaBody.querySelectorAll("tr");
  const categoriaSelecionada = seletorCategoriaSecundaria.value;

  let enviados = 0;

  for (let i = 0; i < linhas.length && enviados < qtd; i++) {
    const tr = linhas[i];
    const tds = tr.children;

    // Verifica se a linha está marcada em verde (selecionada)
    if (tds[0].style.backgroundColor === "lightgreen") {
      const nomeAtleta = tds[1].textContent; // coluna do atleta
      


      // 🔎 Buscar os dados reais do atleta no db3
      const refAtletas = ref(db3, `atletasPorCategoria/${categoriaSelecionada}`);
      const snap = await get(refAtletas);

      if (snap.exists()) {
        const data = snap.val();

        // Encontrar o atleta correspondente pelo nome
        const atletaEncontrado = Object.values(data).find(a => a.nome === nomeAtleta);

        if (atletaEncontrado) {
          const dado = {
            foto: atletaEncontrado.foto || "",
            nome: atletaEncontrado.nome,
            numero: atletaEncontrado.numero || ""
          };

          // Salvar no db4
          const refFase = ref(db4, `${fase}/${categoriaSelecionada}`);
          const novo = push(refFase);
          await set(novo, dado);

          enviados++;
        }
      }
    }
  }

  alert(`Foram enviados ${enviados} atletas para ${fase}!`);
}


// Botão enviar (detecta a fase automaticamente pelo número de atletas marcados)
window.enviar1 = function () {
  const linhas = tabelaSecundariaBody.querySelectorAll("tr");
  const selecionados = Array.from(linhas).filter(tr => 
    tr.children[0].style.backgroundColor === "lightgreen"
  );

  const qtd = selecionados.length;

  if (qtd === 16) {
    enviarSelecionados("oitavas", 16);
  } else if (qtd === 8) {
    enviarSelecionados("quartas", 8);
  } else if (qtd === 4) {
    enviarSelecionados("semi-final", 4);
  } else if (qtd === 2) {
    enviarSelecionados("final", 2);
  } else {
    alert("Selecione 16, 8, 4 ou 2 atletas para enviar!");
  }
};
