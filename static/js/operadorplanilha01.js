import { db3 } from './firebase.js';
import { ref, get, set, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// ELEMENTOS PRINCIPAIS
const tabelaPrincipal = document.querySelector("#tabela-principal tbody");
const seletorRitmo = document.getElementById("seletor-ritmo");
const seletorCategoria = document.getElementById("seletor-categoria");
const textoRitmo = document.getElementById("ritmo-atual");
const seletorFaseGrupo = document.getElementById("seletor-fase-grupo");

let todosDados = [];
let categoriaSelecionada = "";
let mediasFinaisMap = new Map(); // Mapa com média final real

// EVENTOS
seletorRitmo.addEventListener("change", () => {
  textoRitmo.textContent = seletorRitmo.value;
  carregarDadosPorGrupoFase(seletorRitmo.value, seletorFaseGrupo.value);
});

seletorCategoria.addEventListener("change", () => {
  categoriaSelecionada = seletorCategoria.value;
  exibirLinhasFiltradas();
});

seletorFaseGrupo.addEventListener("change", () => {
  const ritmoSelecionado = seletorRitmo.value;
  const grupoFaseSelecionado = seletorFaseGrupo.value;

  carregarDadosPorGrupoFase(ritmoSelecionado, grupoFaseSelecionado);
});

async function carregarDadosPorGrupoFase(ritmo, grupoFase) {
  const caminhos = {
    classificatória: {
      A: ref(db3, `classificatóriaA/${ritmo}`),
      B: ref(db3, `classificatóriaB/${ritmo}`),
      C: ref(db3, `classificatóriaC/${ritmo}`)
    },
    oitavas: {
      A: ref(db3, `oitavasA/${ritmo}`),
      B: ref(db3, `oitavasB/${ritmo}`),
      C: ref(db3, `oitavasC/${ritmo}`)
    },
    quartas: {
      A: ref(db3, `quartasA/${ritmo}`),
      B: ref(db3, `quartasB/${ritmo}`),
      C: ref(db3, `quartasC/${ritmo}`)
    },
    semifinal: {
      A: ref(db3, `semi-finalA/${ritmo}`),
      B: ref(db3, `semi-finalB/${ritmo}`),
      C: ref(db3, `semi-finalC/${ritmo}`)
    },
    final: {
      A: ref(db3, `finalA/${ritmo}`),
      B: ref(db3, `finalB/${ritmo}`),
      C: ref(db3, `finalC/${ritmo}`)
    }
  };

  const dados = { A: {}, B: {}, C: {} };

  // Verifica se o grupoFase existe no objeto caminhos
  if (!caminhos[grupoFase]) return;

  // Limpar dados anteriores antes de carregar novos
  todosDados = [];
  mediasFinaisMap.clear();

  // Lê os dados para cada fase dentro do grupo de fase selecionado

  //await Promise.all(Object.entries(caminhos[grupoFase]).map(async ([fase, caminhoRef]) => {
    //const snap = await get(caminhoRef);

    //if (snap.exists()) {
      //snap.forEach(child => {
        // Verifica se existe a chave 'atleta' e 'categoria' antes de adicionar os dados.....
        //const atleta = child.val().atleta || "";
        //const categoria = child.val().categoria || "";

        // Se a chave 'atleta' ou 'categoria' não existir, ignora o dado......
        //if (!atleta || !categoria) return;

        //dados[fase][child.key] = child.val();
      //});
    //}
  //}));

  Object.entries(caminhos[grupoFase]).forEach(([fase, caminhoRef]) => {
  onValue(caminhoRef, snap => {
    if (snap.exists()) {
      snap.forEach(child => {
        const atleta = child.val().atleta || "";
        const categoria = child.val().categoria || "";
        if (!atleta || !categoria) return;

        dados[fase][child.key] = child.val();
      });

      // 🔄 Atualiza sempre que mudar
      processarDados(dados);
    }
  });
});


  const chaves = new Set([...Object.keys(dados.A), ...Object.keys(dados.B), ...Object.keys(dados.C)]);

  // Processa as chaves e organiza os dados
  chaves.forEach(key => {
    const a = dados.A[key] ?? {};
    const b = dados.B[key] ?? {};
    const c = dados.C[key] ?? {};

    const atleta = a.atleta || b.atleta || c.atleta || "";
    const categoria = a.categoria || b.categoria || c.categoria || "";

    // Verifica se os dados estão completos para o atleta e categoria
    if (!atleta || !categoria) return;

    // Calculando as notas finais
    const notaA = parseFloat(a.nota || 0);
    const vantagemA = parseFloat(a.vantagem || 0);
    const notaFinalA = notaA + vantagemA;

    const notaB = parseFloat(b.nota || 0);
    const punicaoB = parseFloat(b.punicao || 0);
    const notaFinalB = notaB - punicaoB;

    const notaC = parseFloat(c.nota || 0);
    const vantagemC = parseFloat(c.vantagem || 0);
    const notaFinalC = notaC + vantagemC;

    // Soma das notas finais
    const somaNotas = notaFinalA + notaFinalB + notaFinalC;

    // Cálculo da média arredondada para duas casas decimais
    const media = parseFloat((somaNotas / 3).toFixed(2)); // Divide a soma das notas por 3 e arredonda para 2 casas decimais

    // Salva a média final real
    mediasFinaisMap.set(atleta + "||" + categoria, media);

    // Salva os dados, incluindo a foto
    todosDados.push({
      atleta,
      categoria,
      notaA,
      vantagemA,
      notaFinalA,
      notaB,
      punicaoB,
      notaFinalB,
      notaC,
      vantagemC,
      notaFinalC,
      media,
      numero: a.numero || b.numero || c.numero || "",
      foto: a.foto || b.foto || c.foto || ""  // A URL da foto
    });

    // Salva a média final no Firebase
    salvarMediaNoFirebase({
      atleta,
      categoria,
      media,
      numero: a.numero || b.numero || c.numero || "",
      foto: a.foto || b.foto || c.foto || ""  // Passa a foto do atleta ao salvar
    });
  });

  atualizarSeletorCategorias();
  exibirLinhasFiltradas();
}


// Função para salvar a média final no Firebase
//function salvarMediaNoFirebase(dado) {
 // const mediaComDuasCasas = (Math.floor(dado.media * 100) / 100).toFixed(2);
 // const fotoUrl = dado.foto ? dado.foto : "";  // Caso não tenha foto, salva como string vazia
 // const numero = dado.numero || "";
 // const mediaRef = ref(db3, `medias/${seletorRitmo.value}/${seletorFaseGrupo.value}/${dado.atleta}||${dado.categoria}`);
  
 // set(mediaRef, {
  //  media: mediaComDuasCasas,
  //  atleta: dado.atleta,
  //  categoria: dado.categoria,
  //  numero: numero, 
 //   foto: fotoUrl
 // }).catch(error => {
 //   console.error("Erro ao salvar média no Firebase: ", error);
//   });
//}

// Função para salvar a média final no Firebase
function salvarMediaNoFirebase(dado) {
  const mediaComDuasCasas = (Math.floor(dado.media * 100) / 100).toFixed(2);
  const fotoUrl = dado.foto ? dado.foto : "";  // Caso não tenha foto, salva como string vazia
  const numero = dado.numero || "";

  // Pegando o ritmo selecionado do seletor
  const ritmoSelecionado = document.getElementById("seletor-ritmo").value;

  // Definir a chave correspondente ao ritmo selecionado
  let mediaKey = "";
  
  // Atualizar a chave de acordo com o ritmo selecionado
  switch (ritmoSelecionado) {
    case 'angola':
      mediaKey = 'mediaAngola';
      break;
    case 'iuna':
      mediaKey = 'mediaIuna';
      break;
    case 'regional':
      mediaKey = 'mediaRegional';
      break;
    default:
      console.error("Ritmo não selecionado corretamente");
      return;  // Não faz nada se não for selecionado corretamente
  }

  // Caminho para salvar a média no Firebase com base na fase e o atleta
  const mediaRef = ref(db3, `medias/${ritmoSelecionado}/${seletorFaseGrupo.value}/${dado.atleta}||${dado.categoria}`);
  
  // Salvando a média específica para o ritmo selecionado
  set(mediaRef, {
    [mediaKey]: mediaComDuasCasas,  // Salva a média para a chave correspondente ao ritmo
    atleta: dado.atleta,
    categoria: dado.categoria,
    numero: numero,
    foto: fotoUrl
  }).catch(error => {
    console.error("Erro ao salvar média no Firebase: ", error);
  });
}




// Função para atualizar as categorias no seletor
function atualizarSeletorCategorias() {
  const categorias = [...new Set(todosDados.map(d => d.categoria))].sort();
  seletorCategoria.innerHTML = '<option value="">Todas</option>';
  categorias.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    seletorCategoria.appendChild(opt);
  });
  seletorCategoria.value = categoriaSelecionada || "";
}

// Função para exibir as linhas filtradas na tabela principal
function exibirLinhasFiltradas() {
  tabelaPrincipal.innerHTML = "";
  const mapaUnico = new Map();

  let filtrados = categoriaSelecionada
    ? todosDados.filter(d => d.categoria === categoriaSelecionada)
    : todosDados;

  filtrados.forEach(dado => {
    const id = dado.atleta + "||" + dado.categoria;
    if (!mapaUnico.has(id)) mapaUnico.set(id, dado);
  });

  const listaUnica = Array.from(mapaUnico.values()).sort((a, b) => b.media - a.media);

  listaUnica.forEach(dado => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" /></td>
      <td contenteditable="true">${dado.atleta}</td>
      <td contenteditable="true">${dado.categoria}</td>
      <td contenteditable="true">${dado.notaA}</td>
      <td contenteditable="true">${dado.vantagemA || 0}</td>
      <td>${dado.notaFinalA.toFixed(1)}</td>
      <td contenteditable="true">${dado.notaB}</td>
      <td contenteditable="true">${dado.punicaoB || 0}</td>
      <td>${dado.notaFinalB.toFixed(1)}</td>
      <td contenteditable="true">${dado.notaC}</td>
      <td contenteditable="true">${dado.vantagemC || 0}</td>
      <td>${dado.notaFinalC.toFixed(1)}</td>
      <td>${(Math.floor(dado.media * 100) / 100).toFixed(2)}</td>
    `;
    tabelaPrincipal.appendChild(tr);
  });
}

