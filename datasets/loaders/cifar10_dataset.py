import numpy as np
import os 

def load_dataset(data_dir):
    train_dataset = load_train_dataset(data_dir)
    test_dataset = load_test_dataset(data_dir)
    return { "train": train_dataset, "test": test_dataset}

def split_dataset(dataset, distribution, dataset_length, chunk_size):
    if distribution == "iid":
        batches = split_chunks_iid(dataset, dataset_length, chunk_size)
    elif distribution == "non-iid":
        batches = split_chunks_non_iid(dataset, dataset_length, chunk_size)
    return batches

#####################################################################

def load_train_dataset(data_dir):
    data_batches = []
    for i in range(1, 6):
        batch_file = os.path.join(data_dir, f'data_batch_{i}.bin')
        with open(batch_file, 'rb') as f:
            data_batch = np.fromfile(f, dtype=np.uint8)
            data_batches.append(data_batch)
    combined_data = combine_batches(data_batches)
    return combined_data

def load_test_dataset(data_dir):
    data_batches = []
    batch_file = os.path.join(data_dir, 'test_batch.bin')
    with open(batch_file, 'rb') as f:
        data_batch = np.fromfile(f, dtype=np.uint8)
        data_batches.append(data_batch)
    combined_data = combine_batches(data_batches)
    return combined_data

def combine_batches(data_batches):
    combined_data = {'data': np.concatenate([batch.reshape(-1, 3073) for batch in data_batches], axis=0)}
    combined_data['labels'] = combined_data['data'][:, 0]
    combined_data['images'] = combined_data['data'][:, 1:]
    del combined_data['data']
    return combined_data

def split_chunks_iid(data, dataset_length, batch_size):
    num_batches = dataset_length // batch_size
    samples_per_batch = dataset_length // num_batches
    batches = []
    for i in range(num_batches):
        start_idx = i * samples_per_batch
        end_idx = (i + 1) * samples_per_batch if i < num_batches - 1 else dataset_length
        batch_data = {
            'images': data['images'][start_idx:end_idx],
            'labels': data['labels'][start_idx:end_idx]
        }
        batches.append(batch_data)
    return batches

def split_chunks_non_iid(data, dataset_length, batch_size):
    num_batches = dataset_length // batch_size
    num_bytes = len(data['images'])
    bytes_per_sample = num_bytes // dataset_length
    samples = []
    for i in range(dataset_length):
        start_idx = i * bytes_per_sample
        end_idx = (i + 1) * bytes_per_sample if i < dataset_length - 1 else dataset_length
        batch_data = {
            'images': data['images'][start_idx:end_idx],
            'labels': data['labels'][start_idx:end_idx]
        }
        samples.append(batch_data)

    batches_sorted = sorted(samples, key=lambda x: x['labels'])

    batches = []
    length_batch = dataset_length // num_batches
    for i in range(num_batches):
        start_idx = i * length_batch
        end_idx = (i + 1) * length_batch if i < num_batches - 1 else dataset_length
        batch = {
            'images': np.concatenate([b['images'] for b in batches_sorted[start_idx:end_idx]], axis=0),
            'labels': np.concatenate([b['labels'] for b in batches_sorted[start_idx:end_idx]], axis=0)
        }
        batches.append(batch)

    return batches