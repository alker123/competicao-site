import { db4 } from './firebase.js';
    import { ref, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

    const seletorCategoria = document.getElementById("seletor-categoria");
    const seletorFase = document.getElementById("seletor-fase");
    const tabelaBody = document.querySelector("#tabela-sorteio tbody");
    const botaoSortear = document.getElementById("btn-sortear");
    botaoSortear.addEventListener("click", sortearAtletas);

    let atletasPorCategoria = {}; // guarda atletas da fase selecionada

    // Lista fixa de fases
    const fases = ['classificatória','oitavas','quartas','semi-final','final'];

    // Preencher seletor de fases
    fases.forEach(fase => {
      const opt = document.createElement("option");
      opt.value = fase;
      opt.textContent = fase.charAt(0).toUpperCase() + fase.slice(1);
      seletorFase.appendChild(opt);
    });

    // Quando mudar a fase, carregar categorias do db4
    seletorFase.addEventListener("change", async () => {
      const faseSelecionada = seletorFase.value;
      seletorCategoria.innerHTML = '<option value="">Selecione a categoria</option>';

      if (!faseSelecionada) return;

      const snap = await get(ref(db4, faseSelecionada));
      if (!snap.exists()) return;

      const data = snap.val();
      atletasPorCategoria = data;

      Object.keys(data).forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        seletorCategoria.appendChild(opt);
      });
    });

    // Função para sortear atletas
    function sortearAtletas() {
      tabelaBody.innerHTML = "";
      const fase = seletorFase.value;
      const categoria = seletorCategoria.value;

      if (!fase || !categoria) {
        alert("Selecione uma fase e categoria!");
        return;
      }

      const atletasObj = atletasPorCategoria[categoria];
      if (!atletasObj) {
        alert("Nenhum atleta encontrado!");
        return;
      }

      let atletas = Object.values(atletasObj);

      // Embaralhar lista de atletas
      atletas = atletas.sort(() => Math.random() - 0.5);

      // Montar tabela em pares
      for (let i = 0; i < atletas.length; i += 2) {
  const atleta1 = atletas[i];
  let atleta2 = atletas[i + 1];

  const tr = document.createElement("tr");

  if (!atleta2) {
    // Último atleta sem adversário
    atleta2 = atletas[0]; // enfrenta o primeiro do sorteio

    tr.innerHTML = `
      <td>${atleta1.numero} - ${atleta1.nome}</td>
      <td>X</td>
      <td style="background-color: red; color: white; font-weight: bold;">${atleta2.numero} - ${atleta2.nome}</td>
    `;
  } else {
    tr.innerHTML = `
      <td>${atleta1.numero} - ${atleta1.nome}</td>
      <td>X</td>
      <td>${atleta2.numero} - ${atleta2.nome}</td>
    `;
  }

    tabelaBody.appendChild(tr);
    }
  }

// Expor a função globalmente para o onclick funcionar
  window.baixarPDF3 = function () {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    console.error('jsPDF não carregado');
    alert('Falha ao carregar jsPDF. Verifique os scripts.');
    return;
  }

  const tabela = document.getElementById('tabela-sorteio');
  if (!tabela || tabela.querySelectorAll('tbody tr').length === 0) {
    alert('Não há linhas na tabela para exportar.');
    return;
  }

  // Pegando fase e categoria
  const faseSelecionada = document.getElementById('seletor-fase').value || 'Não informada';
  const categoriaSelecionada = document.getElementById('seletor-categoria').value || 'Não informada';

  const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });

  // Cabeçalho com data/hora
  const agora = new Date();
  const data = agora.toLocaleDateString('pt-BR');
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  doc.setFontSize(16);
  doc.text('Resultado do Sorteio', 40, 40);
  
  doc.setFontSize(12);
  doc.text(`Fase: ${faseSelecionada}`, 40, 80);
  doc.text(`Categoria: ${categoriaSelecionada}`, 40, 100);

  doc.setFontSize(10);
  doc.text(`Gerado em ${data} às ${hora}`, 40, 60);

  // Tabela
  doc.autoTable({
    html: '#tabela-sorteio',
    startY: 120,
    theme: 'grid',
    styles: { halign: 'center', valign: 'middle', fontSize: 12 },
    headStyles: { fillColor: [0, 123, 255], textColor: 255 },
    didDrawPage: () => {
      const h = doc.internal.pageSize.getHeight();
      doc.setFontSize(9);
      doc.text('Sistema de Sorteio Automático', 40, h - 20);
    },
  });

  doc.save(`resultado_sorteio_${faseSelecionada}_${categoriaSelecionada}_${data.replace(/\//g, '-')}.pdf`);
};
