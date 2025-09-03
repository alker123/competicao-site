

    // Função para excluir as linhas selecionadas da tabela principal
function excluirLinhasSelecionadas() {
  tabelaPrincipal.querySelectorAll("tr").forEach(linha => {
    const check = linha.querySelector("input[type='checkbox']");
    if (check?.checked) {
      const atleta = linha.querySelector("td:nth-child(2)").textContent;
      const categoria = linha.querySelector("td:nth-child(3)").textContent;
      const id = atleta + "||" + categoria;
      // Excluir do Firebase
      excluirDoFirebase(id);
      linha.remove();
    }
  });
}

// Função para excluir do Firebase
function excluirDoFirebase(id) {
  const mediaRef = ref(db3, `medias/${seletorRitmo.value}/${id}`);
  remove(mediaRef).then(() => {
    console.log("Dado excluído com sucesso do Firebase!");
  }).catch(error => {
    console.error("Erro ao excluir dado do Firebase: ", error);
  });
}

// Função para mostrar a tabela correspondente
function mostrarTabela(tabelaNumero) {
    // Esconde todas as tabelas
    for (let i = 1; i <= 8; i++) {
        let tabelaContainer = document.getElementById('tabela-' + i + '-container');
        if (tabelaContainer) {
            tabelaContainer.style.display = 'none';
        }
    }
    
    // Exibe a tabela solicitada
    let tabelaContainer = document.getElementById('tabela-' + tabelaNumero + '-container');
    if (tabelaContainer) {
        tabelaContainer.style.display = 'block';
    }
}

// Função para voltar para a Tabela Principal
function voltarParaTabelaPrincipal() {
    mostrarTabela(1);  // Exibe a Tabela Principal (Tabela 1)
}

// Função para ir para a Tabela Secundária
function MediaTotal() {
    mostrarTabela(2);  // Exibe a Tabela Secundária (Tabela 2)
}
  

function BaixarPDF() {
    const tabela = document.getElementById('tabela-principal1');
    const ritmo = document.getElementById("nome-ritmo")?.innerText || "Avaliação";

    // Criar container temporário para PDF
    const container = document.createElement("div");
    container.style.fontFamily = "Arial, sans-serif";
    container.style.textAlign = "center";

    // Título
    const titulo = document.createElement("h2");
    titulo.textContent = ritmo;
    titulo.style.color = "#ff8c00";
    titulo.style.marginBottom = "20px";
    container.appendChild(titulo);

    // Clonar a tabela para não afetar a original
    const tabelaClonada = tabela.cloneNode(true);
    tabelaClonada.style.margin = "0 auto";
    tabelaClonada.style.borderCollapse = "collapse";
    tabelaClonada.style.border = "1px solid black";

    // Estilos de borda e padding
    tabelaClonada.querySelectorAll("th, td").forEach((td, index) => {
        td.style.border = "1px solid black";
        td.style.padding = "4px";  // Reduzindo o padding para ajustar mais informações
        td.style.textAlign = "center";

        // Ajustar largura por coluna
        if (td.innerText.trim().toLowerCase() === "sel." || td.cellIndex === 0) {
            td.style.width = "30px"; // Reduzir a largura da coluna "Sel."
        } else if (td.innerText.trim().toLowerCase() === "nome" || td.cellIndex === 1) {
            td.style.width = "110px"; // Aumentar a largura da coluna "Nome"
        } else if (td.innerText.trim().toLowerCase() === "nota" || td.innerText.trim().toLowerCase() === "total" || td.cellIndex === 3 || td.cellIndex === 5 || td.cellIndex === 6 || td.cellIndex === 8 || td.cellIndex === 9 || td.cellIndex === 11) {
            td.style.width = "40px"; // Diminuir a largura das colunas de "Nota" e "Total"
        } else if (td.innerText.trim().toLowerCase() === "vantagem" || td.cellIndex === 4 || td.cellIndex === 10) {
            td.style.width = "50px"; // Ajustar a largura das colunas de "Vantagem"
        }else if (td.innerText.trim().toLowerCase() === "punição" || td.cellIndex === 7) {
            td.style.width = "50px"; // Ajustar a largura da "Punição"
        } else if (td.innerText.trim().toLowerCase() === "categoria" || td.cellIndex === 2) {
            td.style.width = "80px"; // Ajustar a largura da "Categoria"
        } else if (td.innerText.trim().toLowerCase() === "média" || td.cellIndex === 13) {
            td.style.width = "40px"; // Ajustar a largura da "Média"
        } else {
            td.style.width = "100px"; // Largura padrão para outras colunas
        }
    });

    container.appendChild(tabelaClonada);
    document.body.appendChild(container);

    // Usando html2pdf para gerar e baixar o PDF
    html2pdf()
        .from(container)
        .set({
            margin: 10,
            filename: "documento-avaliacao.pdf",
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'landscape', // Modo Paisagem
                autoPaging: true,  // Forçar múltiplas páginas se necessário
                tableAutoSize: true  // Ajuste automático das tabelas
            }
        })
        .save()
        .then(() => {
            // Remover o container após o download
            document.body.removeChild(container);
        });
}

function BaixarPDF1() {
  // 1) Checagens
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("jsPDF não carregado. Confirme as <script> no HTML.");
    console.error("window.jspdf/jsPDF ausentes");
    return;
  }
  const { jsPDF } = window.jspdf;
  if (!jsPDF.API || !jsPDF.API.autoTable) {
    alert("autoTable não carregado. Inclua jspdf-autotable após o jsPDF.");
    console.error("jsPDF.API.autoTable ausente");
    return;
  }

  // 2) Elementos
  const tabela = document.getElementById("tabela-secundaria1");
  if (!tabela) return alert("Tabela #tabela-secundaria1 não encontrada.");
  const linhas = tabela.querySelectorAll("tbody tr");
  if (linhas.length === 0) return alert("Não há linhas na tabela para exportar.");

  const faseSelecionada = (document.getElementById("seletor-fase-grupo1")?.value || "Não informada").trim();
  const categoriaSelecionada = (document.getElementById("seletor-categoria1")?.value || "Não informada").trim();

  // índice da coluna "Próxima Fase" (robusto a mudanças)
  const cabecalhos = Array.from(tabela.querySelectorAll("thead th")).map(th => (th.textContent || "").trim().toLowerCase());
  let idxProximaFase = cabecalhos.findIndex(t => t.includes("próxima") || t.includes("proxima"));
  if (idxProximaFase < 0) idxProximaFase = null; // fallback: última coluna

  // 3) PDF
  const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
  const agora = new Date();
  const data = agora.toLocaleDateString("pt-BR");
  const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  doc.setFontSize(16);
  doc.text("Relatório - Nota de Atletas", 40, 40);

  doc.setFontSize(10);
  doc.text(`Gerado em ${data} às ${hora}`, 40, 60);

  doc.setFontSize(12);
  doc.text(`Fase: ${faseSelecionada}`, 40, 80);
  doc.text(`Categoria: ${categoriaSelecionada}`, 40, 100);

  // 4) Tabela
  doc.autoTable({
    html: "#tabela-secundaria1",
    startY: 120,
    theme: "grid",
    styles: { halign: "center", valign: "middle", fontSize: 10 },

    // Cabeçalho laranja
    headStyles: { fillColor: [255, 102, 0], textColor: 255 },

    // Destacar linha se "Classificado"
    didParseCell: function (data) {
      try {
        if (data.section !== "body") return;

        const lastIdx = (idxProximaFase != null)
          ? idxProximaFase
          : (data.table.columns.length - 1);

        if (data.column.index !== lastIdx) return;

        const raw = data.cell.raw;
        const texto = (typeof raw === "string")
          ? raw
          : ((raw && (raw.innerText || raw.textContent)) || "");

        if (texto.toLowerCase().includes("classificado")) {
          data.row.styles.fillColor = [0, 153, 0];   // verde forte
          data.row.styles.textColor = 255;           // texto branco
          data.row.styles.fontStyle = "bold";        // negrito
        } else {
          data.row.styles.fillColor = [255, 255, 255]; // branco
          data.row.styles.textColor = 0;               // preto
          data.row.styles.fontStyle = "normal";
        }
      } catch (e) {
        console.error("didParseCell error:", e);
      }
    },

    // Rodapé em todas as páginas
    didDrawPage: () => {
      const h = doc.internal.pageSize.getHeight();
      doc.setFontSize(9);
      doc.text("Sistema de Notas - Capoeira", 40, h - 20);
    }
  });

  // 5) Salvar (sanitiza nome do arquivo)
  const slug = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\-]+/g, "_");
  const nome = `notas_${slug(faseSelecionada)}_${slug(categoriaSelecionada)}_${data.replace(/\//g,"-")}.pdf`;
  doc.save(nome);
}

// Disponibiliza globalmente
window.BaixarPDF1 = BaixarPDF1;
window.baixarPDF1  = BaixarPDF1;
// Se quiser: document.getElementById("btn-download1")?.addEventListener("click", BaixarPDF1);
