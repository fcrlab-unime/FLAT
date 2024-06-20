var kConnector = null;
var vPodBaseURL = "http://evaluator";
var URLParams = new URLSearchParams(window.location.search);
var attachGUI = (!URLParams.has("attachGUI") || (URLParams.get('attachGUI') === 'true'));

if (attachGUI) {
  document.getElementById('flat').style.display = 'block';
  document.getElementById('gui').style.display = 'block';
}

const init = (callbacks) => {
  const sessionName = "evaluator";
  const debugMode = "none";

  kConnector = new KConnector(callbacks);
  kConnector.init(kleintGateway, sessionName, debugMode);
};

async function onRoundEnd(message) {
  const stats = message.Body;
  roundLossesX.push(stats.loss.x);
  roundLossesY.push(stats.loss.y);

  roundAccuraciesX.push(stats.accuracy.x);
  roundAccuraciesY.push(stats.accuracy.y);
  if (attachGUI) {
    updateChart(roundLossesX, roundLossesY, roundLossChart);
    updateChart(roundAccuraciesX, roundAccuraciesY, roundAccuracyChart);
  }

  return new Promise((resolve, reject) => {
    resolve("Round End");
  });
}

async function resetCharts(message) {
  if (attachGUI) {
    roundLossesX.splice(0, roundLossesX.length);
    roundLossesY.splice(0, roundLossesY.length);
    roundAccuraciesX.splice(0, roundAccuraciesX.length);
    roundAccuraciesY.splice(0, roundAccuraciesY.length);
    updateChart([], [], roundLossChart);
    updateChart([], [], roundAccuracyChart);
  }

  return new Promise((resolve, reject) => {
    resolve("Reset");
  });
}

const inference = () => {
  let image = getDrawingPixels();
  let data = {
    Method: "POST",
    Url: `${vPodBaseURL}/inference`,
    Headers: [],
    Body: JSON.stringify(image),
  };
  clearCanvas();
  lastCanvas++
  kConnector.sendData(data);
}

const sendInference = (message) => {
  const data = message.Body;
  document.getElementById('prediction').innerHTML = data.label;
}

const changeTab = (tab) => {
  inactiveTab = (tab+1)%2;
  console.log(`tab${tab}`, `tab${inactiveTab}`)
  document.getElementById(`tab${tab}`).classList.remove("hidden");
  document.getElementById(`btn${tab}`).classList.add("active");
  document.getElementById(`tab${inactiveTab}`).classList.add("hidden");
  document.getElementById(`btn${inactiveTab}`).classList.remove("active");
}

const callbacks = {
  onRoundEnd,
  sendInference,
  resetCharts
};

init(callbacks);
