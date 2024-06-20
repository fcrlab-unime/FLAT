from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
import random
import yaml
import importlib.util
import uvicorn
import os
import codecs, json 
import numpy as np

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)

with open("config.yml", "r") as file:
    config = yaml.safe_load(file)

datasets_config = config.get("datasets", [])
dataset_configs = {dataset["name"]: dataset for dataset in datasets_config}

dataset_chunks = {}

for dataset_name, dataset_config in dataset_configs.items():
    module_name = "loaders." + dataset_config["loader"] 
    dataset_module =  importlib.import_module(module_name)
    
    dataset = dataset_module.load_dataset(dataset_config["dataset_dir"])
    chunk_sizes = dataset_configs[dataset_name]["chunk_sizes"]
    dataset_length = dataset_configs[dataset_name]["dataset_length"]

    dataset_chunks[dataset_name] = {
        "train": {},
        "test": dataset["test"]
    }
    for distribution in ["iid", "non-iid"]:
        dataset_chunks[dataset_name][distribution] = {}
        for chunk_size in chunk_sizes:
            dataset_chunks[dataset_name][distribution][chunk_size] = dataset_module.split_dataset(dataset["train"], distribution, dataset_length, chunk_size)


def create_new_split(dataset_name, distribution, chunk_size):
    dataset_config = dataset_configs[dataset_name]
    module_name = "loaders." + dataset_config["loader"]
    dataset_module =  importlib.import_module(module_name)
    dataset = dataset_module.load_dataset(dataset_config["dataset_dir"])
    dataset_length = dataset_config["dataset_length"]
    dataset_chunks[dataset_name][distribution][chunk_size] = dataset_module.split_dataset(dataset["train"], distribution, dataset_length, chunk_size)


@app.get("/dataset/{dataset_name}/{typology}/")
async def get_test_dataset(dataset_name: str, typology: str):
    if dataset_name.lower() not in dataset_configs:
        raise HTTPException(status_code=400, detail=f"Dataset {dataset_name} not found".format(name=dataset_name) )

    typology = typology.lower()
    if typology not in ["test"]:
         raise HTTPException(status_code=400, detail=f"Type of data {typology} not supported (train, test)".format(typology=typology))
    res = {
        "data": dataset_chunks[dataset_name]['test'],
        "shape": dataset_configs[dataset_name]["shape"]
    }
    return json.dumps(res, cls=NumpyEncoder)


@app.get("/dataset/{dataset_name}/{typology}/{distribution}/{chunk_size}")
async def get_random_chunk(dataset_name: str, typology: str, distribution: str, chunk_size: int):
    if dataset_name.lower() not in dataset_configs:
        raise HTTPException(status_code=400, detail=f"Dataset {dataset_name} not found".format(name=dataset_name) )

    typology = typology.lower()
    if typology not in ["train", "test"]:
         raise HTTPException(status_code=400, detail=f"Type of data {typology} not supported (train, test)".format(typology=typology))

    if typology == "test":
        return json.dumps(dataset_chunks[dataset_name]["test"], cls=NumpyEncoder)

    if distribution.lower() not in ["iid", "non-iid"]:
        raise HTTPException(status_code=400, detail=f"Distribuzione {distribution} non supportata (iid, non-iid)".format(distribution=distribution))

    if chunk_size not in dataset_chunks[dataset_name][distribution]:
        create_new_split(dataset_name, distribution, chunk_size)

    chunks = dataset_chunks[dataset_name][distribution][chunk_size]
    id = random.randint(0, len(chunks) - 1)
    res = {
        "data": chunks[id],
        "shape": dataset_configs[dataset_name]["shape"]
    }
    return json.dumps(res, cls=NumpyEncoder)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=80)