interface Weights {
  [key: string]: Float32Array
}

interface InitSessionBody {
  batchSize: number 
  maxNumTrainSamples: number 
  isIID: boolean
  clientNums: number
  dataset: dataset
  modelServer: string
  dataServer: string
  dataNum: number
}

interface RunTrainBody {
  round: number;
  modelWeights?: Weights
}

interface TestParams {
  test: string;
  id: string;
  maxRounds: number;
}

type dataset = 'mnist' | 'cifar10'

interface GenericObjString {
  [key: string]: string
}

interface AggregateBody {
  weights: Weights
  length: number;
}
