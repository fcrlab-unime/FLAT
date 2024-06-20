var kConnector = null;
var vPodBaseURL = "http://aggregator";
let URLParams = new URLSearchParams(window.location.search);
var attachGUI =
  !URLParams.has("attachGUI") || URLParams.get("attachGUI") === "true";
var autoStart = URLParams.get("autoStart") === "true";

const init = (callbacks) => {
  const sessionName = "aggregator";
  const debugMode = "none";

  const kConnector = new KConnector(callbacks);
  kConnector.init(kleintGateway, sessionName, debugMode);
  return kConnector;
};

async function onReady(message) {
  if (attachGUI) {
    enableButton("startButton");
    document.getElementById("flat").style.display = "block";
    document.getElementById("gui").style.display = "flex";
  }

  if (autoStart) {
    startTraining();
  }
  return new Promise((resolve, reject) => {
    resolve("Received");
  });
}

async function onRoundStart(message) {
  const body = message.Body; //{ round: currentRound+1, clients: currentRoundClients, totalClients: clients }
  if (!attachGUI) {
    return;
  }
  document.getElementById(
    "round"
  ).innerHTML = `<h1 style='text-align: center;'>${body.round}</h1>`;
  document.getElementById("currentClients").innerHTML = body.clients
    .sort()
    .map((client) => "<p>" + client + "</p>")
    .join("");
  document.getElementById("totalClients").innerHTML = body.totalClients
    .sort()
    .map(
      (client) =>
        "<p>" +
        (body.clients.includes(client)
          ? `<strong>${client}</strong>`
          : client) +
        "</p>"
    )
    .join("");
  document.getElementById(
    "currentClientsNum"
  ).innerHTML = `(${body.clients.length})`;
  document.getElementById(
    "totalClientsNum"
  ).innerHTML = `(${body.totalClients.length})`;
}

function resetInfoDiv() {
  if (!attachGUI) {
    return;
  }
  document.getElementById("round").innerHTML =
    "<h1 style='text-align: center;'>-</h1>";
  document.getElementById("currentClients").innerHTML = "<p>-</p>";
  document.getElementById("totalClients").innerHTML = "<p>-</p>";
  document.getElementById("currentClientsNum").innerHTML = "";
  document.getElementById("totalClientsNum").innerHTML = "";
}

async function onTrainEnd(message) {
  if (attachGUI) {
    enableButton("startButton");
    disableButton("pauseButton");
  }

  if (URLParams.has("autoStart") && URLParams.get("autoStart") === "true") {
    startTraining();
  }
  return new Promise((resolve, reject) => {
    resolve("Received");
  });
}

async function log(message) {
  document.getElementById('log').innerHTML = `<p>${message.Body.message}</p>`;
  return new Promise((resolve, reject) => {
    resolve("Received");
  });
}

const callbacks = {
  onReady,
  onRoundStart,
  log,
};

kConnector = init(callbacks);
