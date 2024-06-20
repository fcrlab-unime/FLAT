let roundAccuracyChart, roundLossChart;

const roundAccuraciesX = [];
const roundAccuraciesY = [];

const roundLossesX = [];
const roundLossesY = [];

// const XAxes = Array.from({ length: 500 }, (_, i) => i);

function exportJSON() {
  const data = {
    roundLossesX,
    roundLossesY,
    roundAccuraciesX,
    roundAccuraciesY,
  };
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  );
  a.setAttribute("download", `roundStats_${Date.now()}.json`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportCSV() {
  const data = {
    roundLossesX,
    roundLossesY,
    roundAccuraciesX,
    roundAccuraciesY,
  };
  // Create CSV
  // each row should be on a new line
  // each column should be separated by a comma
  let csv_head = `data:text/csv;charset=utf-8,${Object.keys(data).join(",")}\n`;
  let csv_body = data.roundLossesX
    .map((x, i) => {
      return `${x},${data.roundLossesY[i]},${data.roundAccuraciesX[i]},${data.roundAccuraciesY[i]}`;
    })
    .join("\n");
  const csv = csv_head + csv_body;
  console.log(csv + "wewe");

  const a = document.createElement("a");
  a.href = encodeURI(csv);
  a.setAttribute("download", `roundStats_${Date.now()}.csv`);
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

// Initialize charts
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
  document.getElementById("stats").style.display = "block";

  const roundAccCtx = document.getElementById("roundAccuracy").getContext("2d");
  roundAccuracyChart = new Chart(roundAccCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Accuracy",
          data: [],
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderWidth: 2,
          pointRadius: 3, // Adjust the size of point markers
          pointHoverRadius: 6, // Adjust the size of hover markers
          pointBackgroundColor: "rgba(255, 99, 132, 1)",
          pointBorderColor: "rgba(255, 255, 255, 0.5)",
          pointHoverBackgroundColor: "rgba(255, 99, 132, 1)",
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
            fontSize: 14, // Adjust font size
            color: "#fff",
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)", // Hide grid lines
          },
        },
        y: {
          grid: {
            color: "rgba(255,255,255,0.1)",
          },
          title: {
            display: true,
            text: "Accuracy",
            color: "#fff",
          },
          ticks: {
            beginAtZero: true,
            fontSize: 14, // Adjust font size
            color: "#fff",
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0.1)", // Adjust grid line color
            zeroLineColor: "rgba(0, 0, 0, 0.1)", // Adjust zero line color
          },
        },
      },
      legend: {
        labels: {
          fontSize: 16, // Adjust legend font size
          fontColor: "#333", // Adjust legend font color
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Accuracy per round",
          color: "#ffffff", // Colore del titolo
          font: {
            size: 20, // Dimensione del testo del titolo
          },
        },
        zoom: {
          // pan: {
          //   enabled: true,
          //   modifierKey: "ctrl",
          // },
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
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderWidth: 2,
          pointRadius: 3, // Adjust the size of point markers
          pointHoverRadius: 6, // Adjust the size of hover markers
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
            fontSize: 14, // Adjust font size
            color: "#fff",
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)", // Hide grid lines
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
            fontSize: 14, // Adjust font size
            color: "#fff",
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0.1)", // Adjust grid line color
            zeroLineColor: "rgba(0, 0, 0, 0.1)", // Adjust zero line color
          },
        },
      },
      legend: {
        labels: {
          fontSize: 16, // Adjust legend font size
          fontColor: "#333", // Adjust legend font color
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Loss per round",
          color: "#ffffff", // Colore del titolo
          font: {
            size: 20, // Dimensione del testo del titolo
          },
        },
        zoom: {
          // pan: {
          //   enabled: true,
          //   modifierKey: "ctrl",
          // },
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
