import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Banco principal
const firebaseConfig1 = {
  databaseURL: "https://princi-4dfd7-default-rtdb.firebaseio.com/"
};
const app1 = initializeApp(firebaseConfig1, "app1");
const db1 = getDatabase(app1);

// Banco secundário
const firebaseConfig2 = {
  databaseURL: "https://sengu-abc16-default-rtdb.firebaseio.com/"
};
const app2 = initializeApp(firebaseConfig2, "app2");
const db2 = getDatabase(app2);

// Adicionar atleta e categoria
    const fotoPerfil = document.getElementById('fotoPerfil');
    const inputFoto = document.getElementById('inputFoto');
    const botaoFoto = document.getElementById('botaoFoto');
    const nomeAtleta = document.getElementById('nome-atleta');
    const numeroAtleta = document.getElementById('numero-atleta');
    const seletorCategoria = document.getElementById("nome-categoria");
    const cadastrarAtletaBtn = document.getElementById('add-categoria-btn');
    const categoriaAtleta1 = document.getElementById('nome-categoria1');
    const cadastrarAtleta1Btn = document.getElementById('add-categoria1-btn');

 const apiKey = '475b0d11eb8eafceee5534305a71a9a5';

    botaoFoto.addEventListener('click', () => {
      inputFoto.click();
    });

    inputFoto.addEventListener('change', (event) => {
      const arquivo = event.target.files[0];
      if (arquivo) {
        const formData = new FormData();
        formData.append('image', arquivo);

        fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            const urlFoto = data.data.url;
            fotoPerfil.src = urlFoto;
          } else {
            alert("Erro ao enviar a foto.");
          }
        })
        .catch(error => {
          alert("Erro ao enviar a foto.");
        });
      }
    });

    cadastrarAtleta1Btn.addEventListener('click', () => {
  const categoria1 = categoriaAtleta1.value.trim();

  if (!categoria1) {
    return alert("Preencha o nome da categoria.");
  }

  // Salva diretamente no nó com o nome digitado
  const categoriaRef = ref(db1, 'Categoria/' + categoria1);

  set(categoriaRef, categoria1)
    .then(() => {
      alert("Categoria cadastrada com sucesso!");
      categoriaAtleta1.value = "";
    })
    .catch((error) => {
      alert("Erro ao cadastrar categoria: " + error.message);
    });
});


    async function carregarCategorias() {
  try {
    const categoriasRef = ref(db1, "Categoria");
    const snapshot = await get(categoriasRef);

    if (snapshot.exists()) {
      const categorias = snapshot.val();

      // Limpa antes de adicionar
      seletorCategoria.innerHTML = '<option value="" disabled selected>Selecionar categoria</option>';

      // Agora cada chave É o nome da categoria
      Object.keys(categorias).forEach((nomeCategoria) => {
        const option = document.createElement("option");
        option.value = nomeCategoria;          // chave (adulto, infantil, etc.)
        option.textContent = categorias[nomeCategoria]; // valor salvo (adulto, infantil, etc.)
        seletorCategoria.appendChild(option);
      });
    } else {
      console.log("Nenhuma categoria encontrada em Categoria/");
    }
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }
}

// Chama ao carregar a página
carregarCategorias();


    cadastrarAtletaBtn.addEventListener('click', () => {
      const nome = nomeAtleta.value.trim();
      const numero = numeroAtleta.value.trim();
      const categoria = seletorCategoria.value.trim();

      if (!nome || !categoria || !numero) {
        return alert("Preencha o nome e a categoria do atleta.");
      }

      // Se não alterou a imagem, salva em branco (sem URL de avatar padrão)
      const urlFoto = fotoPerfil.src.includes("foto.png") ? "" : fotoPerfil.src;

      const atletaRef = ref(db1, 'atletasPorCategoria/' + categoria);
      const newAtletaRef = push(atletaRef);

      set(newAtletaRef, {
        nome: nome,
        numero: numero,
        categoria: categoria,
        foto: urlFoto
      }).then(() => {
        alert("Atleta cadastrado com sucesso!");
        nomeAtleta.value = "";
        numeroAtleta.value = "";
        seletorCategoria.value = "";
        fotoPerfil.src = "/static/imagens/foto.png";
      }).catch((error) => {
        alert("Erro ao cadastrar o atleta: " + error.message);
      });
    });


// ===================== REFERÊNCIAS DOM =====================
const listaAtletas = document.getElementById("lista-atletas");
const atletaOperador = document.getElementById("atleta-operador");
const listaCategorias = document.getElementById("lista-categorias");
const listaCategorias2 = document.getElementById("lista-categorias-2");
const categoriaOperador = document.getElementById("categoria-operador");
const fotoAtletaContainer = document.getElementById("foto-atleta-container");
const fotoAtleta = document.getElementById("foto-atleta");

// ===================== CATEGORIAS =====================
function carregarCategoriasFirebase() {
  listaCategorias.innerHTML = '';
  listaCategorias2.innerHTML = '';
  categoriaOperador.innerHTML = '';

  // Placeholder
  const placeholder = new Option("Selecionar categoria", "");
  placeholder.disabled = true;
  placeholder.selected = true;

  listaCategorias.appendChild(placeholder.cloneNode(true));
  listaCategorias2.appendChild(placeholder.cloneNode(true));
  categoriaOperador.appendChild(placeholder.cloneNode(true));

  const nomesUnicos = new Set();
  let carregouCategoria = false;
  let carregouAtletas = false;

  function preencherSelects() {
    if (!(carregouCategoria && carregouAtletas)) return; // só preenche quando ambos terminaram

    nomesUnicos.forEach(cat => {
      listaCategorias.add(new Option(cat, cat));
      listaCategorias2.add(new Option(cat, cat));
      categoriaOperador.add(new Option(cat, cat));
    });
  }

  // Lê do nó "Categoria"
  onValue(ref(db1, 'Categoria'), (snapshot) => {
    if (snapshot.exists()) {
      Object.keys(snapshot.val()).forEach(cat => nomesUnicos.add(cat));
    }
    carregouCategoria = true;
    preencherSelects();
  }, { onlyOnce: true });

  // Lê do nó "atletasPorCategoria"
  onValue(ref(db1, 'atletasPorCategoria'), (snap2) => {
    if (snap2.exists()) {
      Object.keys(snap2.val()).forEach(cat => nomesUnicos.add(cat));
    }
    carregouAtletas = true;
    preencherSelects();
  }, { onlyOnce: true });
}

// ===================== ATLETAS =====================
function atualizarListas() {
  listaAtletas.innerHTML = '';
  atletaOperador.innerHTML = '';
  // 👆 agora essa função só mexe em atletas (não toca nas categorias!)
}

// Mostrar atletas por categoria
listaCategorias2.addEventListener("change", () => {
  const categoriaSelecionada = listaCategorias2.value;
  listaAtletas.innerHTML = '';

  if (!categoriaSelecionada) return;

  onValue(ref(db1, `atletasPorCategoria/${categoriaSelecionada}`), (snapshot) => {
    if (!snapshot.exists()) return;
    const atletas = snapshot.val();

    Object.entries(atletas).forEach(([id, atleta]) => {
      const value = JSON.stringify({ id, categoria: categoriaSelecionada, foto: atleta.foto });
      listaAtletas.add(new Option(atleta.nome, value));
    });
  }, { onlyOnce: true });
});

// Excluir atletas
document.getElementById("excluir-atleta-btn").onclick = () => {
  const selecionados = Array.from(listaAtletas.selectedOptions);
  if (selecionados.length === 0) return alert("Selecione atleta(s).");

  if (!confirm("Confirmar exclusão dos atletas?")) return;

  selecionados.forEach(opt => {
    const { id, categoria } = JSON.parse(opt.value);
    remove(ref(db1, `atletasPorCategoria/${categoria}/${id}`));
  });

  alert("Atletas excluídos!");
  listaCategorias2.dispatchEvent(new Event('change'));
};

// ===================== EXCLUIR CATEGORIA =====================
document.getElementById("excluir-categoria-btn").onclick = () => {
  const selecionadas = Array.from(listaCategorias.selectedOptions).map(opt => opt.value);
  if (selecionadas.length === 0) return alert("Selecione categoria(s).");
  if (!confirm("Confirmar exclusão das categorias?")) return;

  selecionadas.forEach(cat => {
    // remove da tabela Categoria
    remove(ref(db1, `Categoria/${cat}`));

    // também remove atletas dessa categoria
    remove(ref(db1, `atletasPorCategoria/${cat}`));
  });

  alert("Categoria(s) excluída(s)!");
  carregarCategoriasFirebase();
};

// ===================== OPERADOR =====================
// Quando mudar a categoria no operador
categoriaOperador.addEventListener("change", () => {
  const categoria = categoriaOperador.value;
  atletaOperador.innerHTML = ''; // Limpa a lista anterior
  fotoAtletaContainer.style.display = 'none'; // Oculta a foto inicialmente

  if (!categoria) return;

  const atletasRef = ref(db1, `atletasPorCategoria/${categoria}`);
  get(atletasRef).then(snapshot => {
    if (!snapshot.exists()) {
      console.log(`Nenhum dado encontrado para a categoria ${categoria}.`);
      return;
    }

    const atletas = snapshot.val();
    console.log("Atletas carregados para a categoria:", atletas);

    Object.entries(atletas).forEach(([id, atleta]) => {
      const fotoSegura = atleta.foto && atleta.foto.trim() !== "" ? atleta.foto : "/static/imagens/foto.png";
      const numero = atleta.numero || "Sem número"; // Obtém o número do atleta (caso não tenha, usa "Sem número")
      
      // Adiciona o nome do atleta com o número na opção
      const option = new Option(
        `${numero} - ${atleta.nome}`,  // Agora inclui o número junto ao nome
        JSON.stringify({ id, categoria, foto: fotoSegura, numero })
      );
      atletaOperador.add(option);
    });
  });
});

// Exibir a foto do atleta ao selecionar
atletaOperador.addEventListener("change", () => {
  const atletaSelecionado = atletaOperador.value;
  if (!atletaSelecionado) return;

  const { foto } = JSON.parse(atletaSelecionado);

  // Exibir imagem padrão se estiver vazia
  fotoAtleta.src = foto && foto.trim() !== "" ? foto : "img/foto.png";
  fotoAtletaContainer.style.display = 'block';
});

// ===================== ENVIAR PARA OPERADOR =====================
document.getElementById("enviar-operador-btn").onclick = () => {
  const atletasSelecionados = Array.from(atletaOperador.selectedOptions);
  if (atletasSelecionados.length === 0) {
    alert("Selecione atletas para enviar ao operador.");
    return;
  }

  const dadosParaEnviar = {};

  atletasSelecionados.forEach(opt => {
    try {
      const { id, categoria, foto } = JSON.parse(opt.value);
      if (!dadosParaEnviar[categoria]) dadosParaEnviar[categoria] = {};

      get(ref(db1, `atletasPorCategoria/${categoria}/${id}`))
        .then(snapshot => {
          const atletaData = snapshot.val();
          const numero = atletaData ? atletaData.numero : "Sem número";

          dadosParaEnviar[categoria][id] = {
            nome: atletaData ? atletaData.nome : opt.textContent,
            foto: foto && foto.trim() !== "" ? foto : "img/foto.png",
            numero: numero
          };

          // Depois que todos os dados forem coletados, envia ao Firebase
          if (Object.keys(dadosParaEnviar[categoria]).length === atletasSelecionados.length) {
            get(ref(db2, "classificatória"))
              .then(snapshot => {
                const dadosExistentes = snapshot.val() || {};
                const novosDados = { ...dadosExistentes };

                Object.entries(dadosParaEnviar).forEach(([categoria, atletas]) => {
                  if (!novosDados[categoria]) novosDados[categoria] = {};
                  Object.entries(atletas).forEach(([id, atleta]) => {
                    if (!novosDados[categoria][id]) {
                      novosDados[categoria][id] = atleta;
                    }
                  });
                });

                const promessas = Object.entries(novosDados).map(([categoria, atletas]) =>
                  set(ref(db2, `classificatória/${categoria}`), atletas)
                );

                return Promise.all(promessas);
              })
              .then(() => {
                alert("Dados enviados ao operador com sucesso!");
              })
              .catch(err => {
                console.error("Erro ao enviar:", err);
                alert("Erro ao enviar dados ao operador.");
              });
          }
        })
        .catch(err => {
          console.error("Erro ao buscar número:", err);
        });
    } catch (e) {
      console.warn("Erro ao interpretar atleta:", opt.value, e);
    }
  });
};

// ===================== CARREGAR AO INICIAR =====================
carregarCategoriasFirebase();
atualizarListas();
