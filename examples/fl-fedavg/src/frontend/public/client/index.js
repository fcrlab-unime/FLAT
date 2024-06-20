var kConnector = null;
var vPodBaseURL = "http://client"
var URLParams = new URLSearchParams(window.location.search);
var attachGUI = (!URLParams.has("attachGUI") || (URLParams.get('attachGUI') === 'true'));

if (attachGUI) {
  document.getElementById('flat').style.display = 'block';
  document.getElementById('gui').style.display = 'block';
}

const init = (callbacks) => {
  const sessionName = "client";
  const debugMode = "none";

  const kConnector = new KConnector(callbacks);
  kConnector.init(kleintGateway, sessionName, debugMode);
  return kConnector;
};

async function onEpochEnd(message) {
  const loss = message.Body;
  
  epochLossesX.push(loss.x);
  epochLossesY.push(loss.y);
  if (attachGUI) {
    updateChart(epochLossesX, epochLossesY, epochLossChart);
  }

  return new Promise((resolve, reject) => {
    resolve("Epoch End");
  });
}

async function onRoundEnd(message) {
  const loss = message.Body;
  roundLossesX.push(loss.x);
  roundLossesY.push(loss.y);
  if (attachGUI) {
    updateChart(roundLossesX, roundLossesY, roundLossChart);
    addVerticalLine(`Round ${loss.x}`, loss.totalEpochs, epochLossChart)
  }

  return new Promise((resolve, reject) => {
    resolve("Round End");
  });
}

async function resetCharts(message) {
  if (attachGUI) {
    epochLossesX.splice(0, epochLossesX.length);
    epochLossesY.splice(0, epochLossesY.length);
    roundLossesX.splice(0, roundLossesX.length);
    roundLossesY.splice(0, roundLossesY.length);
    resetVerticalLines(epochLossChart);
    updateChart([], [], epochLossChart);
    updateChart([], [], roundLossChart);
  }

  return new Promise((resolve, reject) => {
    resolve("Reset");
  });
}

async function setDefaultParams() {
  let body = {
    distribution: document.getElementById("datasetType").value,
    chunkSize: parseInt(document.getElementById("chunkSize").value),
    batchSize: parseInt(document.getElementById("batchSize").value),
  }
  let data = {
    Method: "POST",
    Url: `${vPodBaseURL}/setDefaultParams`,
    Headers: [],
    Body: body,
  };
  kConnector.sendData(data);
  document.getElementById("defaultDatasetType").innerHTML = body.distribution;
  document.getElementById("defaultChunkSize").innerHTML = body.chunkSize;
  document.getElementById("defaultBatchSize").innerHTML = body.batchSize;
}

const callbacks = {
  onEpochEnd,
  onRoundEnd,
  resetCharts,
};

kConnector = init(callbacks);
