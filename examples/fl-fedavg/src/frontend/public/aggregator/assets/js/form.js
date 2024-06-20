function setQueryParamValuesToForm() {
  var params = new URLSearchParams(window.location.search);
  var form = document.getElementById('configForm');
  var inputs = form.querySelectorAll('input, select');

  inputs.forEach(function(input) {
      var paramName = input.getAttribute('name');
      var paramValue = params.get(paramName);
      if (paramValue !== null) {
          if (input.tagName === 'INPUT') {
              input.value = paramValue;
          } else if (input.tagName === 'SELECT') {
              var option = input.querySelector('option[value="' + paramValue + '"]');
              if (option !== null) {
                  option.selected = true;
              }
          }
      }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  setQueryParamValuesToForm();
});

function disableButton(id) {
  button = document.getElementById(id);
  button.disabled = true;
  button.classList.add("disabled");
}

function enableButton(id) {
  button = document.getElementById(id);
  button.disabled = false;
  button.classList.remove("disabled");
}

function getFormValues() {
  params = {
    dataset: document.getElementById("dataset").value,
    distribution: document.getElementById("distribution").value,
    chunkSize: parseInt(document.getElementById("chunkSize").value),
    batchSize: parseInt(document.getElementById("batchSize").value),
    clientNums: parseInt(document.getElementById("clientNums").value),
    minClientNums: parseInt(document.getElementById("minClientNums").value),
    initTimeout: parseInt(document.getElementById("initTimeout").value),
    trainTimeout: parseInt(document.getElementById("trainTimeout").value),
    roundTimeout: parseInt(document.getElementById("roundTimeout").value),
    numEpochs: parseInt(document.getElementById("numEpochs").value),
    numRounds: parseInt(document.getElementById("numRounds").value),
    fraction: parseFloat(document.getElementById("fraction").value),
    attachGUI: URLParams.has("attachGUI") && URLParams.get('attachGUI') === 'false' ? false : true,
  };
  return params;
}

function disableFormOnRunning() {
  document.getElementById("dataset").disabled = true;
  document.getElementById("distribution").disabled = true;
  document.getElementById("chunkSize").disabled = true;
  document.getElementById("batchSize").disabled = true;
}

function enableFormOnStop() {
  document.getElementById("dataset").disabled = false;
  document.getElementById("distribution").disabled = false;
  document.getElementById("chunkSize").disabled = false;
  document.getElementById("batchSize").disabled = false;
}

function toggleForm() {
  var form = document.getElementById("configDiv");
  form.classList.toggle("open");
}

function openForm() {
  var form = document.getElementById("configDiv");
  form.classList.add("open");
}

function closeForm() {
  var form = document.getElementById("configDiv");
  form.classList.remove("open");
}