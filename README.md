# FLAT (Federated Learning Across Tabs)

FLAT (Federated Learning Across Tabs) is an advanced system designed to enable Federated Learning (FL) across different browser tabs, harnessing the innovative concept of the Cloud-Edge-Client Continuum. This approach allows for a seamless integration of cloud resources, edge devices, and client browsers to collaboratively perform FL tasks.

## Index
* [Overview](#overview)
    * [Publications](#publications)
    * [Key features](#key-features) 
    * [Benefits](#benefits)
    * [How it works](#how-it-works)
* [Roadmap](#roadmap)
* [Getting Started](#getting-started)
    * [Requirements](#requirements)
    * [Build the platform](#build-the-platform)
    * [Deploy the platform](#deploy-the-platform)
    * [Demo](#demo)
* [Extra](#extra)
    * [Contributing](#contributing)
    * [Cite this work](#cite-this-work)
    * [License](#license)
    * [Contact](#contact)

## Overview

### Publications

- M. Garofalo, M. Colosi, A. Catalfamo, and M. Villari. **Web-Centric Federated Learning over the Cloud-Edge Continuum Leveraging ONNX and WASM.** In *IEEE 29th IEEE Symposium on Computers and Communications (ISCC2024), June 26--29, 2024, Paris, France.* doi: TBA

Related work:
- M. Colosi, M. Garofalo, A. Galletta, M. Fazio, A. Celesti, and M. Villari. 2024. **Cloud-Edge-Client Continuum: Leveraging Browsers as Deployment Nodes with Virtual Pods**. In Proceedings of the *IEEE/ACM 10th International Conference on Big Data Computing, Applications and Technologies (BDCAT '23)*. [https://doi.org/10.1145/3632366.3632395](https://doi.org/10.1145/3632366.3632395)

### Key Features

- **Federated Learning over Browsers**: FLAT enables users to run FL directly within their Web browsers, promoting privacy and security by keeping data localized.

- **Cloud-Edge-Client Continuum**: This novel framework leverages the combined power of cloud computing, edge devices, and client browsers by means of the novel *Cloud-Edge-Client Continuum* paradigm, whose latest implementation is [Kleint](https://github.com/fcrlab-unime/kleint), to optimize the FL process. The Continuum ensures efficient resource utilization and improved learning outcomes.

- **Zero Configuration**: A peer who wants to join an FL session via FLAT does not need to install anything. By simply visiting a web page, they can make their computing resources available and become a node in the FL network.

### Benefits

- **Data Privacy**: By keeping data on the client side, performing all calculations on browsers, and sharing only model updates, FLAT ensures the security of sensitive information.

- **Scalability**: The Cloud-Edge-Client Continuum allows for scalable FL, accommodating a wide range of devices from powerful cloud servers to resource-constrained edge devices and browsers.

- **Flexibility**: FLAT can be integrated into various applications and use cases, providing a flexible solution for FL across diverse environments.

- **Resource Utilization**: FLAT maximizes the utilization of surrounding devices like smartphones and laptops, requiring only a browser. This innovative approach enhances FL infrastructure, creating a robust and efficient learning system across the Cloud-Edge-Client Continuum.

- **Cross-Platform**: The use of Web browsers ensures portability across various heterogeneous devices, making FLAT a truly cross-platform solution that works seamlessly on different operating systems and hardware configurations.

FLAT is currently designed to allow FL models to be trained on the Web using [Kleint](https://github.com/fcrlab-unime/kleint) and the Open Neural Network Exchange (ONNX) format. However, integration of other deep learning frameworks and beyond are future capabilities that will be developed in future versions of FLAT (see [Roadmap](#roadmap)).

### How It Works
TODO: add an explanation and diagrams about how FLAT implements FEDERATED LEARNING

## Roadmap

| Feature | Status |
|---|---|
| ONNX | ✅ |
| Tf.js | ⏳ |
| Decentralized FL | ❌ |


## Getting Started

To get started with FLAT, we go through three stages: Build, deploy and execute FL applications.


### Requirements

#### Deploying FLAT

To build the FLAT system, you need to have the following software installed on your machine:

- **Docker**: Docker is required to build the various services and components of the FLAT system.
- **Make**: Make is used to run the commands defined in the Makefile. It is typically pre-installed on Unix-based systems.


#### Deploying FLAT
To deploy the FLAT system, you need to have the following:

- **AMD64 Nodes**: Some containers used in FLAT are only compiled for the AMD64 architecture. Ensure your nodes meet this requirement.
- **Docker**: Docker Compose is used to deploy the FLAT architecture. Ensure that Docker is installed and running on your system. Docker Compose is typically included with Docker Desktop installations.
- **Kubernetes**: Alternatively, you can use Kubernetes to run the FLAT system. Kubernetes allows for more complex and scalable deployments. You can set up a Kubernetes cluster using tools like Minikube, MicroK8s, or a cloud provider's Kubernetes service.

On the client side, the only requirement to use the platform is to have a Web browser installed.

#### TL;DR

| Task | Requirements |
| ---- | --- |
| Building FLAT | Docker, Make|
| Deploying FLAT | AMD64 Nodes, Docker or Kubernetes|
| Join FLAT as a client | Browser |

Make sure to meet these requirements before proceeding with building and running the FLAT system. For installation instructions, refer to the official documentation of the respective tools.


### Build the platform

1. **Clone the Repository**: Go to the `/opt` folder and clone the repository on the local node. Using the `/opt` folder is not mandatory, but in case you want to deploy to K8s, the `persistent volumes` should be modified accordingly, replacing `/opt` with the selected parent folder in all occurrences of the yaml files under the `/deploy/k8s` path.

    <pre lang="bash"> cd /opt && git clone git@github.com:fcrlab-unime/FLAT.git </pre>

2. **Build the system**: As shown in [How It Works Section](#how-it-works), we simulate each client's local dataset through a datasets server. Therefore, we build the dataset server and all components of FLAT through the command:

    <pre lang="bash"> cd FLAT/ && make build </pre>

3. **Download the datasets**: The first time generally the MNIST and CIFAR10 datasets are not present at the path `/opt/FLAT/datasets/download` so we download and unzip them with the command:

    <pre lang="bash"> make download-datasets </pre>

4. (Optional) **Build the models**: The models used are relatively lightweight, so they were placed directly in the repository at the path `/opt/FLAT/examples/dist/models`. However, the Makefile provides a command to build the models used in the demo:

    <pre lang="bash"> make models </pre>

    To change or build your own models see [Build Models](https://github.com/fcrlab-unime/FLAT/examples/fl-fedavg/models).

### Deploy the platform

FLAT can be deployed on Docker, via Docker Compose or Kubernetes.

**Docker**: 

1. **Deploy via** `docker compose`:

    <pre lang="bash"> make docker-deploy </pre>

2. **Specify kleint-gateway port and IP address**:

    modify the `/opt/FLAT/config.js` file replacing `<node-ip>` with the actual IP of the node hosting the kleint-gatway and port with 13579:
    <pre lang="javascript">
    // /opt/FLAT/config.js

    const kleintGateway = "&lt;node-ip&gt;:13579";
    const scriptLoadDelay = 100; //ms
    </pre>

**Kubernetes**:

1. **Adjust the k8s operator deployments files accordingly**: For simplicity, this implementation assumes that the volumes are on the same machine where the repository is cloned. It is therefore critical to ensure that k8s deploys the containers on the correct node. 
  - Navigate to the path `/opt/FLAT/deploy/k8s/flat-architecture`;
  - edit the `nodeSelector` field of the following files by assigning the `<node-hostename>` of the machine hosting the FLAT `persistent volumes`:
    - `003-dataset-server-deployment.yaml`
    - `003-kleint-gateway-deployment.yaml`
    - `003-webserver-deployment.yaml`

    replace the `<node-hostname>` field at the bottom of the files with the actual hostname of the node hosting the volumes:

    <pre lang="yaml">
    nodeSelector:
        kubernetes.io/arch: amd64
        kubernetes.io/hostname: &lt;node-hostname&gt;
    </pre>

2. **Deploy via** `kubectl`:

    <pre lang="bash"> make k8s-deploy </pre>

3. **Specify kleint-gateway port and IP address**:

    modify the `/opt/FLAT/config.js` file replacing `<node-ip>` with the actual IP of the node hosting the kleint-gateway and port 30003:

   <pre lang="javascript">
    // /opt/FLAT/config.js

    const kleintGateway = "&lt;node-ip&gt;:30003";
    const scriptLoadDelay = 100; //ms
  </pre>

### Demo

Once the containers are up and running, the respective VPods can be accessed through a browser. If the node hosting the `webserver` container has a public IP address, it is possible to become an FL node globally, otherwise, it is necessary to visit the Web page while connected to the same LAN:

- **Landing page**:

```
http://<node-ip>:31013/
```

- **Client**:

```
http://<node-ip>:31013/fl-fedavg/web/client
```

- **Aggregator**:

```
http://<node-ip>:31013/fl-fedavg/web/aggregator
```

- **Evaluator**:

```
http://<node-ip>:31013/fl-fedavg/web/evaluator
```

## Extra

### Contributing

Contributions to the Federated Learning Web Platform are welcome! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make changes and commit them to your branch.
4. Push your changes to your fork.
5. Submit a pull request to the main repository.

### Cite this work

```
@inproceedings{FLAT,
  title={Web-Centric Federated Learning over the Cloud-Edge Continuum Leveraging ONNX and WASM},
  booktitle={IEEE 29th IEEE Symposium on Computers and Communications (ISCC2024), June 26--29, 2024, Paris, France}, 
  author={Garofalo, Marco and Colosi, Mario and Catalfamo, Alessio and Villari, Massimo},
  volume={},
  number={},
  year={2024},
  doi={},
}
```

### License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

### Contact

For questions or support, please contact [projectmaintainer@example.com](mailto:projectmaintainer@example.com).
