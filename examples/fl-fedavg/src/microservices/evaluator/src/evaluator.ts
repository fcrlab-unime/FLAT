
import { Cifar10Data } from './datasets/cifar10';
import { MnistData } from './datasets/mnist';
import { Float32Concat } from './utils'
import * as ort from 'onnxruntime-web/training';

declare var vpod: { env: { [key: string]: string }, location: { [key: string]: string } };

// INIT
var testset: Cifar10Data | MnistData;
var session = null;
var currentRound = 0;
var accuracies = []
var accumulatedLoss = 0;
var losses = [];
var batchSize = 64;

var retrieveDatasetPromise: Promise<void>;
var initializationPromise: Promise<void>;

export const inference = async (body: string, params: GenericObjString, headers: GenericObjString): Promise<string> => {
  let data = JSON.parse(body);
  let normalizedData = data.map((x: number) => MnistData.normalize(x));
  if (testset instanceof MnistData) {
    let imageFloatBatch = (new Float32Array(normalizedData))
    let imageTensor = new ort.Tensor('float32', imageFloatBatch, [1, 784])
    const feeds = {
      input: imageTensor,
      labels: new ort.Tensor('int64', new BigInt64Array(1), [1])
    };
    const results = await session.runEvalStep(feeds);
    let inferenceResult = getSinglePredition(results['output']);
    console.log("Inference", inferenceResult);
    fetch('vpod://main/sendInference', { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inferenceResult) });
    return inferenceResult.label.toString();
  }
  return "";
}


function countCorrectPredictions(output: ort.Tensor, labels: ort.Tensor): number {
  let result = 0;
  const predictions = getPredictions(output);
  for (let i = 0; i < predictions.length; ++i) {
    if (BigInt(predictions[i]) === labels.data[i]) {
      ++result;
    }
  }
  return result;
}

function getPredictions(results: ort.Tensor): number[] {
  const predictions = [];
  const [batchSize, numClasses] = results.dims;
  for (let i = 0; i < batchSize; ++i) {
    const probabilities = results.data.slice(i * numClasses, (i + 1) * numClasses) as Float32Array;
    const resultsLabel = indexOfMax(probabilities);
    predictions.push(resultsLabel);
  }
  return predictions;
}

function getSinglePredition(input: ort.Tensor): { probabilities: Float32Array[], label: number } {
  const probabilities = [];
  const [_, numClasses] = input.dims;
  const prob = input.data.slice(0, numClasses) as Float32Array;
  probabilities.push(prob);
  let label = indexOfMax(prob);
  return {
    probabilities, label
  };
}

// training & testing helper functions
function indexOfMax(arr: Float32Array): number {
  if (arr.length === 0) {
    throw new Error('index of max (used in test accuracy function) expects a non-empty array. Something went wrong.');
  }
  let maxIndex = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > arr[maxIndex]) {
      maxIndex = i;
    }
  }
  return maxIndex;
}



export const initSession = async (body: InitSessionBody, params: GenericObjString, headers: GenericObjString): Promise<string> => {
  let dataset = body.dataset || 'mnist'
  batchSize = body.batchSize || 64

  reset();
  initializationPromise = initAsyncSession(dataset, batchSize);

  return "Session Initialized";
}

async function initAsyncSession(dataset, batchSize): Promise<void> {
  const response = await fetch(`${vpod.env.MODEL_SERVER}/${dataset}/shapes.json`);
  const shapes = await response.json();

  let datasetURL = getDatasetURL(dataset);
  if (dataset === 'mnist') {
    testset = new MnistData(batchSize, datasetURL, shapes)
  } else {
    testset = new Cifar10Data(batchSize, datasetURL, shapes)
  }
  retrieveDatasetPromise = testset.getData(true)

  session = await loadTrainingSession(vpod.env.MODEL_SERVER, dataset)
  console.log('[EVALUATOR] loaded dataset: ', dataset)
  console.log('[EVALUATOR] loaded batch size: ', batchSize)
  return;
}

async function loadTrainingSession(modelServer: string, dataset: dataset): Promise<ort.TrainingSession> {
  const chkptPath = `${modelServer}/${dataset}/checkpoint`;
  const trainingPath = `${modelServer}/${dataset}/training_model.onnx`;
  const optimizerPath = `${modelServer}/${dataset}/optimizer_model.onnx`;
  const evalPath = `${modelServer}/${dataset}/eval_model.onnx`;

  const createOptions: ort.TrainingSessionCreateOptions = {
    checkpointState: chkptPath,
    trainModel: trainingPath,
    evalModel: evalPath,
    optimizerModel: optimizerPath,
  };

  try {
    const session = await ort.TrainingSession.create(createOptions);
    return session;
  } catch (err) {
    throw err;
  }
}

export const runEval = async (body: RunTrainBody & TestParams, params: GenericObjString, headers: GenericObjString): Promise<string> => {
  currentRound = body.round
  let modelWeights = body.modelWeights || null
  if (modelWeights) {
    await setParams(modelWeights)
  }

  if (initializationPromise) {
    await initializationPromise;
    initializationPromise = null;
  }
  if (retrieveDatasetPromise) {
    await retrieveDatasetPromise;
  }

  accumulatedLoss = 0;
  accuracies.push(await runEvalStep(session, testset));
  fetch('vpod://main/onRoundEnd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accuracy: { y: accuracies[accuracies.length - 1], x: currentRound },
      loss: { y: losses[losses.length - 1], x: currentRound }
    })
  });
  return "Test Completed";
}

async function runEvalStep(
  session: ort.TrainingSession,
  dataSet: Cifar10Data | MnistData,
) {

  let batchNum = 0;
  let totalNumBatches = (dataSet instanceof Cifar10Data) ?
    getNumBatches(Cifar10Data.MAX_NUM_TEST_SAMPLES, batchSize) :
    getNumBatches(MnistData.MAX_NUM_TEST_SAMPLES, batchSize);
  let testPicsSoFar = 0;
  let numCorrect = 0;

  for await (const batch of dataSet.trainingBatches()) {
    ++batchNum;
    const feeds = {
      input: batch.data,
      labels: batch.labels,
    };
    const results = await session.runEvalStep(feeds);
    const lossNodeName = Object.keys(results).find((key) => key.includes("loss"));
    let rawLoss = results[lossNodeName].data as unknown as string;

    const loss = parseFloat(rawLoss);

    accumulatedLoss += loss;
    testPicsSoFar += batch.data.dims[0];
    numCorrect += countCorrectPredictions(results['output'], batch.labels);
  }
  losses.push(accumulatedLoss / totalNumBatches)
  const avgAcc = numCorrect / testPicsSoFar;
  console.log("RoundN: ", currentRound, "AVG Accuracy: ", avgAcc, "Loss: ", accumulatedLoss / totalNumBatches)
  return avgAcc;
}

export const setParams = async (weights: Weights): Promise<string> => {
  let new_weights = new Float32Array()
  const shapes = testset.shapes

  for (let i = 0; i < shapes.length; i++) {
    new_weights = Float32Concat(new_weights, weights[shapes[i]['name']])
  }
  await session.loadParametersBuffer(new Uint8Array(new_weights.buffer), true)
  new_weights = null
  return "Weights Set"
}

const getNumBatches = (datasetLength: number, batchSize: number) => {
  return Math.floor(datasetLength / batchSize);
}

const getDatasetURL = (dataset: string) => {
  let dataServer = vpod.env.DATASET_SERVER ?? vpod.location.origin;
  return `${dataServer}/dataset/${dataset}/test/`;
}

const reset = () => {
  fetch('vpod://main/resetCharts');
  session = null;
  currentRound = 0;
}

console.log("[EVALUATOR] Loaded.");