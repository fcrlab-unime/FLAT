from onnxruntime.training import artifacts
import torch
import onnx
import io
import os
import json
import argparse

class CNN(torch.nn.Module):
    def __init__(self,input_channel,output_channel, num_classes):
        super(CNN, self).__init__()
        self.conv1 = torch.nn.Conv2d(input_channel, output_channel, kernel_size=3, padding=1)
        self.relu1 = torch.nn.ReLU()
        self.conv2 = torch.nn.Conv2d(output_channel, output_channel*2, kernel_size=3, padding=1)
        self.relu2 = torch.nn.ReLU()
        self.conv3 = torch.nn.Conv2d(output_channel*2, output_channel*4, kernel_size=3, padding=1)
        self.relu3 = torch.nn.ReLU()
        self.pool = torch.nn.MaxPool2d(2, 2)
        self.flatten = torch.nn.Flatten()
        self.fc1 = torch.nn.Linear(output_channel*4 * 4 * 4, 512)
        self.fc2 = torch.nn.Linear(512, num_classes)

    def forward(self, x):
        x = self.conv1(x)   
        x = self.relu1(x)
        x = self.pool(x)
        x = self.conv2(x)
        x = self.relu2(x)
        x = self.pool(x)
        x = self.conv3(x)
        x = self.relu3(x)
        x = self.pool(x)
        x = self.flatten(x)
        x = self.relu1(x)
        x = self.fc1(x)
        x = self.relu1(x)
        x = self.fc2(x)
        return x

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output_dir", type=str, required=True, default="dist/cifar10")
    args = parser.parse_args()

    if not os.path.exists(args.output_dir):
        os.makedirs(args.output_dir)
    
    device = "cpu"
    batch_size = 64


    input_size, hidden_size, output_size = 3, 32, 10
    pt_model = CNN(input_channel=input_size,output_channel=hidden_size,num_classes=output_size).to(device)
    model_inputs = torch.randn(1, input_size, hidden_size, hidden_size)

    input_names = ["input"]
    output_names = ["output"]
    dynamic_axes = {"input": {0: "batch_size"}, "output": {0: "batch_size"}}

    f = io.BytesIO()
    torch.onnx.export(
        pt_model,
        model_inputs,
        f,
        input_names=input_names,
        output_names=output_names,
        opset_version=14,
        do_constant_folding=False,
        training=torch.onnx.TrainingMode.TRAINING,
        dynamic_axes=dynamic_axes,
        export_params=True,
        keep_initializers_as_inputs=False,
    )
    onnx_model = onnx.load_model_from_string(f.getvalue())

    requires_grad = [name for name, param in pt_model.named_parameters() if param.requires_grad]
    shapes = [param.shape for name, param in pt_model.named_parameters() if param.requires_grad]
    frozen_params = [name for name, param in pt_model.named_parameters() if not param.requires_grad]

    json_shapes = [{"name": name, "shape": shape} for name, shape in zip(requires_grad, shapes)]
    json.dump(json_shapes, open(args.output_dir+"/shapes.json", "w"))
    artifacts.generate_artifacts(
        onnx_model,
        optimizer=artifacts.OptimType.AdamW,
        loss=artifacts.LossType.CrossEntropyLoss,
        artifact_directory=args.output_dir,
        requires_grad=requires_grad,
        frozen_params=frozen_params,
        additional_output_names=output_names)
    