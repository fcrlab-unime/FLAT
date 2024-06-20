let epochLossChart, roundLossChart;

const epochLossesX = [];
const epochLossesY = [];

const roundLossesX = [];
const roundLossesY = [];

function exportJSON() {
  const data = {
    epochLossesX,
    epochLossesY,
    roundLossesX,
    roundLossesY,
  };
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  );
  a.setAttribute("download", `lossStats_${Date.now()}.json`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportCSV() {
  const data = {
    epochLossesX,
    epochLossesY,
    roundLossesX,
    roundLossesY,
  };

  let csv_head = `data:text/csv;charset=utf-8,${Object.keys(data).join(",")}\n`;
  let csv_body = data.epochLossesX
    .map((x, i) => {
      return `${x},${data.epochLossesY[i]},${data.roundLossesX[i]},${data.roundLossesY[i]}`;
    })
    .join("\n");
  const csv = csv_head + csv_body;

  const a = document.createElement("a");
  a.href = encodeURI(csv);
  a.setAttribute("download", `lossStats_${Date.now()}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function addScript(src, type = "text/javascript") {
  const script = document.createElement("script");
  script.src = src;
  script.type = "text/javascript";
  document.getElementsByTagName("head")[0].appendChild(script);
}

window.onload = async function () {
  if (!attachGUI) {
    return;
  }
  addScript("assets/js/chart.js");
  while (typeof Chart === "undefined") {
    await new Promise((resolve) => setTimeout(resolve, scriptLoadDelay));
  }
  addScript("assets/js/hammer.js");
  while (typeof Hammer === "undefined") {
    await new Promise((resolve) => setTimeout(resolve, scriptLoadDelay));
  }
  addScript("assets/js/zoom-plugin.js");
  while (typeof ChartZoom === "undefined") {
    await new Promise((resolve) => setTimeout(resolve, scriptLoadDelay));
  }
  addScript("assets/js/annotation.js");
  while (typeof globalThis["chartjs-plugin-annotation"] === "undefined") {
    await new Promise((resolve) => setTimeout(resolve, scriptLoadDelay));
  }

  document.getElementById("stats").style.display = "block";
  const epochLossCtx = document.getElementById("epochLoss").getContext("2d");
  epochLossChart = new Chart(epochLossCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Loss",
          color: "#fff",
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: "rgba(255, 99, 132, 1)",
          pointBorderColor: "rgba(255, 255, 255, 0.5)",
          pointHoverBackgroundColor: "rgba(255, 99, 132, 1)",
          pointHoverBorderColor: "rgba(255, 255, 255, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        color: "#ffffff",
        font: {
          size: 20,
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(255,255,255,0.1)",
          },
          title: {
            display: true,
            text: "Epochs",
            color: "#fff",
          },
          ticks: {
            fontSize: 14,
            color: "#fff",
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
          },
        },

        y: {
          grid: {
            color: "rgba(255,255,255,0.1)",
          },
          title: {
            display: true,
            text: "Loss",
            color: "#fff",
          },
          ticks: {
            beginAtZero: true,
            fontSize: 14,
            color: "#fff",
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0.1)",
            zeroLineColor: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
      legend: {
        labels: {
          fontSize: 16,
          color: "#fff",
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Loss per epoch",
          color: "#ffffff", // Colore del titolo
          font: {
            size: 20, // Dimensione del testo del titolo
          },
        },
        annotation: {
          annotations: {},
        },
        zoom: {
          zoom: {
            drag: {
              enabled: true,
            },
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "xy",
          },
        },
      },
    },
  });

  const roundLossCtx = document.getElementById("roundLoss").getContext("2d");
  roundLossChart = new Chart(roundLossCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Loss",
          data: [],
          borderColor: "rgba(54, 162, 235, 1)",
          labelColor: "#ffffff",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: "rgba(54, 162, 235, 1)",
          pointBorderColor: "transparent",
          pointHoverBackgroundColor: "rgba(54, 162, 235, 1)",
          pointHoverBorderColor: "rgba(255, 255, 255, 1)",
        },
      ],
    },
    options: {
      title: {
        display: true,
        color: "#ffffff",
        font: {
          size: 20,
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(255,255,255,0.1)",
          },
          title: {
            display: true,
            text: "Communication Rounds",
            color: "#fff",
          },
          ticks: {
            fontSize: 14,
            color: "white",
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
          },
        },

        y: {
          grid: {
            color: "rgba(255,255,255,0.1)",
          },
          title: {
            display: true,
            text: "Loss",
            color: "#fff",
          },
          ticks: {
            beginAtZero: true,
            fontSize: 14,
            color: "#fff",
          },
          gridLines: {
            color: "#fff",
          },
        },
      },
      legend: {
        labels: {
          fontSize: 16,
          fontColor: "#ffffff",
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Loss per round",
          color: "#ffffff",
          font: {
            size: 20,
          },
        },
        zoom: {
          zoom: {
            drag: {
              enabled: true,
            },
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "xy",
          },
        },
      },
    },
  });
};

// {x: number, y: number}
function updateChart(xData, yData, chart) {
  chart.data.labels = xData;
  chart.data.datasets[0].data = yData;
  chart.update();
}

function addVerticalLine(label, value, chart) {
  var annotations = chart.options.plugins.annotation.annotations;
  annotations[value] = {
    type: "line",
    xMin: value,
    xMax: value,
    borderColor: "rgb(0, 128, 255, 0.3)",
    borderWidth: 2,
    label: {
      display: true,
      content: label,
      position: "start",
    },
  };
  chart.update();
}

function resetVerticalLines(chart) {
  chart.options.plugins.annotation.annotations = {};
  chart.update();
}