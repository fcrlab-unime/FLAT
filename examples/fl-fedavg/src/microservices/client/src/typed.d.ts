interface Weights {
  [key: string]: Float32Array
}

interface InitSessionBody {
  dataset: dataset
  chunkSize: number | undefined
  batchSize: number | undefined
  distribution: string | undefined
  initTimeout: number
  attachGUI: boolean
}

interface RunTrainBody {
  round: number
  numEpochs: number
  modelWeights?: Weights
}

type dataset = 'mnist' | 'cifar10'

interface GenericObjString {
  [key: string]: string
}

interface AggregateBody {
  weights: Weights
  length: number;
}

interface DefaultValues {
  batchSize: number
  chunkSize: number
  distribution: string
}