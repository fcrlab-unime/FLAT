// The following is modified from Justin Harris's project:
// https://github.com/juharris/train-pytorch-in-js

// Modified from https://github.com/cazala/mnist/blob/master/src/mnist.js
// so that we can place the data in a specific folder and avoid out of memory errors
// and use TypeScript.
import * as ort from 'onnxruntime-web/training';

/**
 * Dataset description at https://deepai.org/dataset/mnist.
 */
export class MnistData {
	static readonly BATCH_SIZE = 64
	static readonly MAX_NUM_TRAIN_SAMPLES = 60000
	static readonly MAX_NUM_TEST_SAMPLES = 10000

	static readonly pixelMax = 255
	static readonly pixelMean = 0.1307
	static readonly pixelStd = 0.3081
	public actualTrainLength = 0
	public data = null

	constructor(public batchSize = MnistData.BATCH_SIZE, public datasetURL = "", public shapes = null) {
		if (batchSize <= 0) {
			throw new Error("batchSize must be > 0")
		}
	}

	private *batches(data: ort.Tensor[], labels: ort.Tensor[]) {
		for (let batchIndex = 0; batchIndex < data.length; ++batchIndex) {
			yield {
				data: data[batchIndex],
				labels: labels[batchIndex],
			}
		}
	}

	public async * trainingBatches() {
		const [trainingData, trainingLabels] = this.data
		yield* this.batches(trainingData, trainingLabels)
	}

	public async getData(normalize = true): Promise<void> {
		const response = await fetch(this.datasetURL)
		let dataObj = JSON.parse(await response.json());


		let imagesBatch:ort.Tensor[] = [], labelsBatch:ort.Tensor[] = []
		let imagesTensor: ort.Tensor, labelsTensor:ort.Tensor

		this.actualTrainLength = 0;
		let dataset = dataObj.data
		while(dataset.images.length > 0) {
			let batchSize = Math.min(this.batchSize, dataset.images.length)
			const batchShape: number[] = [batchSize, ...dataObj.shape]
			const labelShape: number[] = [batchSize]

			let images = dataset.images.splice(0, this.batchSize),
				labels = dataset.labels.splice(0, this.batchSize)
			let imagesList = [], 
				imagesFloatBatch: Float32Array

			images.forEach((image, i) => {
				imagesList = imagesList.concat(image)
			})
			if (normalize) {
				imagesList = imagesList.map(v => MnistData.normalize(v))
			}
			imagesFloatBatch = (new Float32Array(imagesList))
			imagesTensor = new ort.Tensor('float32', imagesFloatBatch, batchShape)

			let labelsList = Array.from(labels).map(BigInt)
			labelsTensor = new ort.Tensor('int64', new BigInt64Array(labelsList), labelShape)

			imagesBatch.push(imagesTensor)
			labelsBatch.push(labelsTensor)
			this.actualTrainLength += batchSize
		}

		this.data = [imagesBatch, labelsBatch];
	}

	public static normalize(pixelValue: number): number {
		return ((pixelValue / this.pixelMax) - this.pixelMean) / this.pixelStd
	}
}