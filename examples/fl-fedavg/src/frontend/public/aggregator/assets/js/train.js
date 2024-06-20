async function startTraining() {
  if (attachGUI) {
    disableButton("startButton");
    enableButton("pauseButton");
    enableButton("resetButton");
    disableFormOnRunning()
    closeForm();
  }
  const body = getFormValues();

  let data = {
    Method: "POST",
    Url: `${vPodBaseURL}/start`,
    Headers: [],
    Body: JSON.stringify(body),
  };

  kConnector.sendData(data);
}

async function pauseTraining() {
  if (attachGUI) {
    disableButton("pauseButton");
    enableButton("startButton");
    openForm();
  }
  let data = {
    Method: "POST",
    Url: `${vPodBaseURL}/pause`,
    Headers: [],
    Body: {},
  };
  kConnector.sendData(data);
}

async function resetTraining() {
  if (attachGUI) {
    disableButton("resetButton");
    disableButton("pauseButton");
    enableButton("startButton");
    enableFormOnStop();
    openForm();
  }
  let data = {
    Method: "POST",
    Url: `${vPodBaseURL}/resetParams`,
    Headers: [],
    Body: {},
  };

  kConnector.sendData(data);
  attachGUI && resetInfoDiv();
}
