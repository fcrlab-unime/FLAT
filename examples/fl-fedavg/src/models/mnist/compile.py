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

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output_dir", type=str, required=True, default="dist/mnist")
    args = parser.parse_args()

    if not os.path.exists(args.output_dir):
        os.makedirs(args.output_dir)
    
    device = "cpu"
    batch_size = 64

    input_size, hidden_size, output_size = 784, 200, 10
    pt_model = DNN(input_size, hidden_size, output_size).to(device)
    model_inputs = (torch.randn(batch_size, input_size, device=device),)

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