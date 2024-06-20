interface Weights {
  [key: string]: number[]
}

interface FetchResponse {
  message: string
  success: boolean
}

interface InitSessionBody {
  dataset: string
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

interface StartParams {
  dataset: string
  distribution: string | undefined
  chunkSize: number
  batchSize: number
  clientNums: number
  minClientNums: number
  fraction: number
  initTimeout: number
  trainTimeout: number
  roundTimeout: number
  numEpochs: number
  numRounds: number
  attachGUI: boolean
}

interface StringParams {
  [key: string]: string
}

interface StringHeaders {
  [key: string]: string
}

type InitAggregatorParams  = any;

interface AggregateBody {
  weights: Weights
  length: number
}

interface PromisesResolves {
  [key: string]: {
    resolve: Function,
    reject: Function,
    done: boolean
  }
}

interface FetchHeaders {
  'Content-Type': 'application/json',
  'X-Kleint-Session-Destination': string
}