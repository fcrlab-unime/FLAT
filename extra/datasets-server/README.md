# FastAPI Dataset Server

This program implements a FastAPI server to handle dataset requests.

## Usage

1. Copy your dataset files in datasets/<dataset_name>
2. Configure the `config.yml` file to define the available datasets and their configurations.
3. Create a loader file in loaders/ for each dataset according to the specifications outlined below.
4. Restart dataset-server to update your new xconfiguration.

## Dataset Configuration

To define a new dataset, add it to the configuration in the `config.yml` file as follows:

```yaml
datasets:
  - name: mnist
    loader: mnist_dataset
    dataset_dir: datasets/mnist
    dataset_length: 60000
    chunk_sizes: [600, 1000, 2000]
    shape: [28, 28]
  - name: cifar10
    loader: cifar10_dataset
    dataset_dir: datasets/cifar10
    dataset_length: 50000
    chunk_sizes: [500, 1000, 2000]
    shape: [3, 32, 32]

```

Ensure to specify the following parameters for each dataset:
- `name`: Unique identifier for the dataset.
- `loader`: Name of the loader module for the dataset.
- `dataset_dir`: Directory path where the dataset is located.
- `dataset_length`: Total length of the dataset.
- `chunk_sizes`: List of chunk sizes to be used during dataset splitting.
- `shape`: Dataset shape

### New loader definition

Loader Definition:

The loader for each dataset should define two functions:

1. `load_dataset(data_dir)`: Loads and returns the dataset from the specified `data_dir`.
   - Returns: A dictionary containing the dataset, with keys 'train' and 'test', where each value is a dictionary representing the dataset split ('train' or 'test').
   
2. `split_dataset(dataset, distribution, dataset_length, chunk_size)`: Splits the dataset into chunks according to the specified distribution.
   - Returns: A list of dictionaries, where each dictionary represents a chunk of the dataset. Each dictionary should contain the data necessary for training/testing, typically including 'images' and 'labels'.
   
Note: Both functions should adhere to a specific prototype and return values as specified in the code.
