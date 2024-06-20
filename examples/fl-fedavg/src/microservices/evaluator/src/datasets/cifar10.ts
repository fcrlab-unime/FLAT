// consists of 60000 32x32 RGB images in 10 classes (6000 images per class). There are 50000 training images and 10000 test images.
// the dataset is divided in 5 batches each of 10000 images, the test set is one batch of 10000 images
// each file is 30730000 bytes long
// label 1 byte - and its a number between 0 and 9
// image is 3*32*32 byte: 3072 bytes
// the first 1024 bytes are the red channel, the next 1024 bytes are the green channel, and the last 1024 bytes are the blue channel
// the image is stored in row-major order, so the first 32 bytes are the red channel of the first row of the image
// 781 batches 32x32 training images
// 157 batches 32x32 test images

//fetch batch
import * as ort from 'onnxruntime-web/training';
// import shapes from './cifar10/shapes.json'



export class Cifar10Data {
  static readonly BATCH_SIZE = 64;
  static readonly MAX_NUM_TEST_SAMPLES = 10000;
  static readonly MAX_NUM_TRAIN_SAMPLES = 50000;

  static readonly LABELS = ['airplane', 'automobile', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse', 'ship', 'truck']
  public data = null;
  public actualTrainLength = 0;

  constructor(public batchSize = Cifar10Data.BATCH_SIZE,
    public datasetURL = "",
    public shapes = null) 
  {
    if (batchSize <= 0) {
      throw new Error("batchSize must be > 0");
    }
  }

  private *batches(data: ort.Tensor[], labels: ort.Tensor[]) {
    for (let batchIndex = 0; batchIndex < data.length; ++batchIndex) {
      yield {
        data: data[batchIndex],
        labels: labels[batchIndex],
      };
    }
  }x

  public async * trainingBatches() {
    const [trainingData, trainingLabels] = this.data;
    yield* this.batches(trainingData, trainingLabels);
  }

  public async getData(normalize = true): Promise<void> {
		const response = await fetch(this.datasetURL);
		let dataObj = JSON.parse(await response.json());

		let imagesBatch:ort.Tensor[] = [], labelsBatch:ort.Tensor[] = [];
		let imagesTensor:ort.Tensor, labelsTensor:ort.Tensor;

		this.actualTrainLength = 0;
		let dataset = dataObj.data;

		while(dataset.images.length > 0) {
			let batchSize = Math.min(this.batchSize, dataset.images.length);
			const batchShape: number[] = [batchSize, ...dataObj.shape];
			const labelShape: number[] = [batchSize];

			let images = dataset.images.splice(0, this.batchSize),
				  labels = dataset.labels.splice(0, this.batchSize);
			let imagesList = [], 
				  imagesFloatBatch: Float32Array;

			images.forEach((image) => {
				imagesList = imagesList.concat(image);
			})
			if (normalize) {
				imagesList = imagesList.map(v => Cifar10Data.normalize(v));
			}
			imagesFloatBatch = (new Float32Array(imagesList));
			imagesTensor = new ort.Tensor('float32', imagesFloatBatch, batchShape);

			let labelsList = Array.from(labels).map(BigInt);
			labelsTensor = new ort.Tensor('int64', new BigInt64Array(labelsList), labelShape);

			imagesBatch.push(imagesTensor);
			labelsBatch.push(labelsTensor);
			this.actualTrainLength += batchSize;
		}
		this.data = [imagesBatch, labelsBatch];
	}

  public static normalize(pixelValue: number): number {
    return pixelValue / 255.0
  }
}

