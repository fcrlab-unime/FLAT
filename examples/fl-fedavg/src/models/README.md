# Build ONNX Models

There are several strategies to build ONNX models, one of the most common is to write the model in a classical deep learning framework such as [PyTorch](https://pytorch.org/) and convert it to ONNX. 
In the case of [ONNX Runtime Training](https://onnxruntime.ai/training), it is required the generation of artifacts such as:

1. Training model
2. Evaluation model
3. Checkpoint
4. Optimizer model.

via a [Python API](https://onnxruntime.ai/docs/api/python/modules/onnxruntime/training/artifacts.html).


The code used for building the model is a customized version of [the code found in a sample repository](https://github.com/microsoft/onnxruntime-training-examples/tree/master/on_device_training/web/offline-step) from Microsoft.

To build your own model or to modify the two existing model of this example you need to modify one of the two `compile.py` files inside the folders `/mnist` or `cifar10` at the path `/opt/FLAT/examples/fl-fedavg/models`. 

The `compile.py` file, has already a predefined model depending on the dataset used, namely a DNN for MNIST and a CNN for CIFAR10:

<pre lang="python">
# mnist/compile.py

from onnxruntime.training import artifacts
import torch
import onnx
import io
import os
import json
import argparse

# Pytorch class that we will use to generate the graphs.
class DNN(torch.nn.Module):
    def __init__(self, input_size, hidden_size, num_classes):
        super(DNN, self).__init__()
        self.fc1 = torch.nn.Linear(input_size, hidden_size)
        self.relu = torch.nn.ReLU()
        self.fc2 = torch.nn.Linear(hidden_size, hidden_size)
        self.relu2 = torch.nn.ReLU()
        self.fc3 = torch.nn.Linear(hidden_size, num_classes)

    def forward(self, model_input):
        out = self.fc1(model_input)
        out = self.relu(out)
        out = self.fc2(out)
        out = self.relu2(out)
        out = self.fc3(out)
        return out

</pre>

You can modify existing models or change them completely, but of course you need to adapt the rest of the `compile.py` files with the correct parameters, such as `input_size` , `hidden_size` etc.

The `compile.py` files contain the code to extract the shapes of the model weight matrices. This is necessary for our implementation, since the API exposed by ONNX Runtime Training Web returns the model weights in a contiguous array losing information about the shapes of the weight matrices. The purpose of the `shapes.json` file is therefore to contain information about the original shapes of the network weights matrices, so that the contiguous array provided by ONNX can be reshaped accordingly.

Finally, you need to execute the code via the make command from the root folder of FLAT:

<pre lang="bash">
cd /opt/FLAT && make models
</pre>
