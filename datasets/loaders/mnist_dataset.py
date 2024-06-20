import numpy as np
import os

def load_dataset(data_dir):
    train_dataset = load_train_dataset(data_dir)
    test_dataset = load_test_dataset(data_dir)
    return { "train": train_dataset, "test": test_dataset}

def split_dataset(dataset, distribution, dataset_length, chunk_size):
    images_data = dataset["data"][0]
    labels_data = dataset["data"][1]

    if distribution == "iid":
        chunks_images, chunks_labels = split_chunks_iid(images_data, labels_data, dataset_length, chunk_size)
    elif distribution == "non-iid":
        chunks_images, chunks_labels = split_chunks_non_iid(images_data, labels_data, dataset_length, chunk_size)
    
    batches = []
    for i in range(len(chunks_images)):
        batches.append({"images": chunks_images[i], "labels": chunks_labels[i]})
    return batches


#####################################################################

def load_train_dataset(data_dir):
    images_file = os.path.join(data_dir, 'train-images-idx3-ubyte')
    labels_file = os.path.join(data_dir, 'train-labels-idx1-ubyte')
    
    with open(images_file, 'rb') as f:
        f.read(16)
        images_data = np.fromfile(f, dtype=np.uint8).reshape(-1, 28*28) 
    with open(labels_file, 'rb') as f:
        f.read(8)
        labels_data = np.fromfile(f, dtype=np.uint8)  
    return {"data": [images_data, labels_data]}

def load_test_dataset(data_dir):
    images_file = os.path.join(data_dir, 't10k-images-idx3-ubyte')
    labels_file = os.path.join(data_dir, 't10k-labels-idx1-ubyte')

    with open(images_file, 'rb') as f:
        f.read(16)
        images_data = np.fromfile(f, dtype=np.uint8).reshape(-1, 28*28)
    
    with open(labels_file, 'rb') as f:
        f.read(8) 
        labels_data = np.fromfile(f, dtype=np.uint8)
    return {"images": images_data, "labels": labels_data}
    

def split_chunks_iid(images_data, labels_data, dataset_length, samples_per_batch):
    num_samples = len(images_data)
    num_batches = num_samples // samples_per_batch
    batches_images = []
    batches_labels = []
    for i in range(num_batches):
        start_idx = i * samples_per_batch
        end_idx = (i + 1) * samples_per_batch if i < num_batches - 1 else num_samples
        batch_images = images_data[start_idx:end_idx]
        batch_labels = labels_data[start_idx:end_idx]
        batches_images.append(batch_images)
        batches_labels.append(batch_labels)
    return batches_images, batches_labels

def split_chunks_non_iid(images_data, labels_data, length_dataset, samples_per_batch):
    total_bytes_images = len(images_data)
    sample_size_images = total_bytes_images // length_dataset
    total_bytes_labels = len(labels_data)
    sample_size_labels = total_bytes_labels // length_dataset
    batches_images = []
    batches_labels = []
    
    for i in range(length_dataset):
        start_idx = i * sample_size_images
        end_idx = (i + 1) * sample_size_images if i < length_dataset - 1 else total_bytes_images
        batch_image = images_data[start_idx:end_idx]

        start_idx = i * sample_size_labels
        end_idx = (i + 1) * sample_size_labels if i < length_dataset - 1 else total_bytes_labels
        batch_label = labels_data[start_idx:end_idx]

        batches_images.append(batch_image)
        batches_labels.append(batch_label)

    # sort samples per label
    sorted_indices = sorted(range(len(batches_labels)), key=lambda k: batches_labels[k])
    batch_images = [batches_images[idx] for idx in sorted_indices]
    batch_labels = [batches_labels[idx] for idx in sorted_indices]

    # split into num_batches
    num_samples = len(images_data)
    num_batches = num_samples // samples_per_batch
    batches_images = []
    batches_labels = []
    for i in range(num_batches):
        batches_images.append(np.concatenate(batch_images[i*samples_per_batch:(i+1)*samples_per_batch], axis=0))
        batches_labels.append(np.concatenate(batch_labels[i*samples_per_batch:(i+1)*samples_per_batch], axis=0))

    return batches_images, batches_labels