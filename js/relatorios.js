// =========================================================
// RELATÓRIOS — FILTRO DE PERÍODO
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const botoesPeriodo = document.querySelectorAll(".btn-periodo");
  const btnAplicar = document.getElementById("btn-aplicar");
  const dataInicio = document.getElementById("data-inicio");
  const dataFim = document.getElementById("data-fim");

  // Dados simulados por período (substituir pela API futuramente)
  const dadosPorPeriodo = {
    hoje: {
      total: 9,
      resolvidos: 5,
      tma: "1h 50m",
      sla: "88%",
      violado: 1,
    },
    semana: {
      total: 47,
      resolvidos: 31,
      tma: "3h 22m",
      sla: "92%",
      violado: 4,
    },
    mes: {
      total: 182,
      resolvidos: 143,
      tma: "4h 05m",
      sla: "90%",
      violado: 18,
    },
  };

  function atualizarKPIs(dados) {
    document.getElementById("kpi-total").textContent = dados.total;
    document.getElementById("kpi-resolvidos").textContent = dados.resolvidos;
    document.getElementById("kpi-tma").textContent = dados.tma;
    document.getElementById("kpi-sla").textContent = dados.sla;
    document.getElementById("kpi-violado").textContent = dados.violado;
  }

  // Alternar entre os botões de período
  botoesPeriodo.forEach((btn) => {
    btn.addEventListener("click", () => {
      botoesPeriodo.forEach((b) => b.classList.remove("ativo"));
      btn.classList.add("ativo");

      const periodo = btn.dataset.periodo;
      if (dadosPorPeriodo[periodo]) {
        atualizarKPIs(dadosPorPeriodo[periodo]);
      }
    });
  });

  //Período personalizado
  btnAplicar.addEventListener("click", () => {
    if (!dataInicio.value || !dataFim.value) {
      alert("Selecione as datas de início e fim do período");
      return;
    }

    if (dataInicio.value > dataFim.value) {
      alert("A data inicial não pode ser posterior à data final.");
      return;
    }

    // Remove o ativos dos botões fixos para indicar período personalizado
    botoesPeriodo.forEach((b) => b.classList.remove("ativo"));

    // Futuramente: buscar dados da API com o intervalo selecionado
    console.log(
      "Período personalizado:",
      dataInicio.value,
      "até",
      dataFim.value,
    );
    alert(
      `Período aplicado: ${dataInicio.value} até ${dataFim.value}\(Dados reais serão carregados via API)`,
    );
  });
});
