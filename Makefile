.PHONY: help docker-deploy docker-restart docker-remove k8s-generate-cm k8s-deploy k8s-restart k8s-remove build fl-fedavg fl-fedavg-aggregator fl-fedavg-client fl-fedavg-evaluator datasets-server download-datasets download-mnist download-cifar10 models models-dnn models-cnn

DOWNLOAD_PATH=./datasets/download

define gen_cm
	sed -E 's/[[:space:]]+$$//g' $(3) > /tmp/$(5); \
	kubectl create cm $(1) --from-file=/tmp/$(5) --dry-run=client -n=flat -o yaml > /tmp/$(1).1.flat.tmp && \
	kubectl annotate --local -f /tmp/$(1).1.flat.tmp  use-subpath="true" --dry-run=client -o yaml > /tmp/$(1).2.flat.tmp && \
	kubectl label --local -f /tmp/$(1).2.flat.tmp  app=$(2) --dry-run=client -o yaml > $(4) && \
	rm /tmp/$(5); \
	rm /tmp/*.flat.tmp
endef

help:
	@printf "\n"
	@printf "%-25s %-25s\n" "FLAT - Federated Learning Across Tabs" ""
	@printf "%-25s %-25s\n" "_____________________________________" ""
	@printf "\n"
	@printf "%-25s %-25s\n" "Usage: make [command]" ""
	@printf "\n"
	@printf "%-25s %-25s\n" "Commands:" ""
	@printf "\n"
	@printf "%-25s %-25s\n" "build" "Build all FLAT architecture services"
	@printf "\n"
	@printf "%-25s %-25s\n" "docker-deploy" "Deploy FLAT architecture"
	@printf "%-25s %-25s\n" "docker-restart" "Restart FLAT architecture"
	@printf "%-25s %-25s\n" "docker-remove" "Remove FLAT architecture"
	@printf "\n"
	@printf "%-25s %-25s\n" "k8s-deploy" "Deploy FLAT architecture"
	@printf "%-25s %-25s\n" "k8s-restart" "Restart FLAT architecture"
	@printf "%-25s %-25s\n" "k8s-remove" "Remove FLAT architecture"
	@printf "%-25s %-25s\n" "k8s-generate-cm" "Generate ConfigMap for Kubernetes"
	@printf "\n"
	@printf "%-25s %-25s\n" "fl-fedavg" "Build FL-FedAvg example"
	@printf "\n"
	@printf "%-2s %-22s %-25s\n" "" "fl-fedavg-aggregator" "Build FL-FedAvg aggregator microservice"
	@printf "%-2s %-22s %-25s\n" "" "fl-fedavg-client" "Build FL-FedAvg client microservice"
	@printf "%-2s %-22s %-25s\n" "" "fl-fedavg-evaluator" "Build FL-FedAvg evaluator microservice"
	@printf "\n"
	@printf "%-25s %-25s\n" "download-datasets" "Download MNIST and CIFAR-10 datasets"
	@printf "\n"
	@printf "%-2s %-22s %-25s\n" "" "download-mnist" "Download MNIST dataset"
	@printf "%-2s %-22s %-25s\n" "" "download-cifar10" "Download CIFAR-10 dataset"
	@printf "\n"
	@printf "%-25s %-25s\n" "datasets-server" "Build datasets-server Docker image"
	@printf "\n"
	@printf "%-25s %-25s\n" "models" "Build DNN and CNN models"
	@printf "\n"
	@printf "%-2s %-22s %-25s\n" "" "models-dnn" "Build DNN models"
	@printf "%-2s %-22s %-25s\n" "" "models-cnn" "Build CNN models"
	@printf "\n"


docker-deploy:
	@echo "\033[0;32m[DOCKER-COMPOSE] Deploying FLAT architecture\033[0m"
	DOCKER_COMPOSE=deploy/docker-compose/docker-compose.yml; \
	DOCKER_COMPOSE_FL_FEDAVG=deploy/docker-compose/docker-compose.fl-fedavg.yml; \
	docker compose -f $$DOCKER_COMPOSE -f $$DOCKER_COMPOSE_FL_FEDAVG up -d && \
	echo "\033[0;32m[DOCKER-COMPOSE] Deploy completed successfully\033[0m" || \
	echo "\033[0;31m[DOCKER-COMPOSE] Deploy failed\033[0m"

docker-restart:
	@echo "\033[0;32m[DOCKER-COMPOSE] Removing FLAT architecture\033[0m"
	DOCKER_COMPOSE=deploy/docker-compose/docker-compose.yml; \
	DOCKER_COMPOSE_FL_FEDAVG=deploy/docker-compose/docker-compose.fl-fedavg.yml; \
	docker compose -f $$DOCKER_COMPOSE -f $$DOCKER_COMPOSE_FL_FEDAVG restart && \
	echo "\033[0;32m[DOCKER-COMPOSE] Removing completed successfully\033[0m" || \
	echo "\033[0;31m[DOCKER-COMPOSE] Removing failed\033[0m"

docker-remove:
	@echo "\033[0;32m[DOCKER-COMPOSE] Removing FLAT architecture\033[0m"
	DOCKER_COMPOSE=deploy/docker-compose/docker-compose.yml; \
	DOCKER_COMPOSE_FL_FEDAVG=deploy/docker-compose/docker-compose.fl-fedavg.yml; \
	docker compose -f $$DOCKER_COMPOSE -f $$DOCKER_COMPOSE_FL_FEDAVG down && \
	echo "\033[0;32m[DOCKER-COMPOSE] Removing completed successfully\033[0m" || \
	echo "\033[0;31m[DOCKER-COMPOSE] Removing failed\033[0m"

k8s-generate-cm:
	@echo "\033[0;32m[KUBERNETES] Generating ConfigMap\033[0m"
	K8S_OPERATOR=deploy/k8s/flat-architecture; \
	VPODS=examples/fl-fedavg/vpods.yml; \
	CONFIG=config.js; \
	NGINX=extra/nginx/default.conf; \
	INDEX=examples/fl-fedavg/src/frontend/public/index.html; \
	$(call gen_cm,kleint-gateway-cm0,kleint-gateway,$$VPODS,$$K8S_OPERATOR/001-kleint-gateway-cm0-configmap.yaml,vpods.yml) && \
	$(call gen_cm,webserver-cm0,webserver,$$CONFIG,$$K8S_OPERATOR/001-webserver-cm0-configmap.yaml,config.js) && \
	$(call gen_cm,webserver-cm1,webserver,$$NGINX,$$K8S_OPERATOR/001-webserver-cm1-configmap.yaml,default.conf) && \
	$(call gen_cm,webserver-cm2,webserver,$$INDEX,$$K8S_OPERATOR/001-webserver-cm2-configmap.yaml,index.html) && \
	echo "\033[0;32m[KUBERNETES] ConfigMap generated successfully\033[0m" || \
	echo "\033[0;31m[KUBERNETES] ConfigMap generation failed\033[0m"

k8s-deploy:
	@echo "\033[0;32m[KUBERNETES] Deploying FLAT architecture\033[0m"
	K8S_OPERATOR=deploy/k8s; \
	make k8s-generate-cm && \
	kubectl apply -f $$K8S_OPERATOR && \
	kubectl apply -f $$K8S_OPERATOR/fl-fedavg && \
	kubectl apply -f $$K8S_OPERATOR/flat-architecture && \
	echo "\033[0;32m[KUBERNETES] Deploying completed successfully\033[0m" || \
	echo "\033[0;31m[KUBERNETES] Deploying failed\033[0m"

k8s-restart:
	@echo "\033[0;32m[KUBERNETES] Restarting FLAT architecture\033[0m"
	K8S_OPERATOR=deploy/k8s; \
	make k8s-generate-cm && \
	kubectl apply -f $$K8S_OPERATOR/flat-architecture && \
	kubectl rollout restart deployment -n flat && \
	echo "\033[0;32m[KUBERNETES] Restarting completed successfully\033[0m" || \
	echo "\033[0;31m[KUBERNETES] Restarting failed\033[0m"

k8s-remove:
	@echo "\033[0;32m[KUBERNETES] Removing FLAT architecture\033[0m"
	K8S_OPERATOR=deploy/k8s; \
	kubectl delete -f $$K8S_OPERATOR/flat-architecture && \
	kubectl delete -f $$K8S_OPERATOR/fl-fedavg && \
	kubectl delete -f $$K8S_OPERATOR && \
	echo "\033[0;32m[KUBERNETES] Removing completed successfully\033[0m" || \
	echo "\033[0;31m[KUBERNETES] Removing failed\033[0m"

build: datasets-server fl-fedavg

fl-fedavg:
	DIRECTORY=examples/fl-fedavg; \
	CONTAINER_NAME=flat-build-all-$$(date +%s) && \
	docker run -it --name $$CONTAINER_NAME --rm \
		-v ./examples/fl-fedavg/src/microservices:/app \
		-v ./examples/fl-fedavg/dist/microservices:/dist \
		node:18 /bin/sh -c "cd app/ && make build"

fl-fedavg-aggregator:
	DIRECTORY=examples/fl-fedavg; \
	CONTAINER_NAME=flat-build-aggregator-$$(date +%s) && \
	docker run -it --name $$CONTAINER_NAME --rm \
		-v ./examples/fl-fedavg/src/microservices:/app \
		-v ./examples/fl-fedavg/dist/microservices:/dist \
		node:18 /bin/sh -c "cd app/ && make build-aggregator"

fl-fedavg-client:
	DIRECTORY=examples/fl-fedavg; \
	CONTAINER_NAME=flat-build-client-$$(date +%s) && \
	docker run -it --name $$CONTAINER_NAME --rm \
		-v ./examples/fl-fedavg/src/microservices:/app \
		-v ./examples/fl-fedavg/dist/microservices:/dist \
		node:18 /bin/sh -c "cd app/ && make build-client"

fl-fedavg-evaluator:
	DIRECTORY=examples/fl-fedavg; \
	CONTAINER_NAME=flat-build-evaluator-$$(date +%s) && \
	docker run -it --name $$CONTAINER_NAME --rm \
		-v ./examples/fl-fedavg/src/microservices:/app \
		-v ./examples/fl-fedavg/dist/microservices:/dist \
		node:18 /bin/sh -c "cd app/ && make build-evaluator"

download-datasets: download-mnist download-cifar10

download-mnist:
	@echo "\033[0;32m[DATASETS] Downloading MNIST dataset\033[0m"
	@mkdir -p $(DOWNLOAD_PATH)/mnist
	@wget https://ossci-datasets.s3.amazonaws.com/mnist/train-images-idx3-ubyte.gz -O $(DOWNLOAD_PATH)/mnist/train-images-idx3-ubyte.gz
	@wget https://ossci-datasets.s3.amazonaws.com/mnist/train-labels-idx1-ubyte.gz -O $(DOWNLOAD_PATH)/mnist/train-labels-idx1-ubyte.gz
	@wget https://ossci-datasets.s3.amazonaws.com/mnist/t10k-images-idx3-ubyte.gz -O $(DOWNLOAD_PATH)/mnist/t10k-images-idx3-ubyte.gz
	@wget https://ossci-datasets.s3.amazonaws.com/mnist/t10k-labels-idx1-ubyte.gz -O $(DOWNLOAD_PATH)/mnist/t10k-labels-idx1-ubyte.gz
	@gunzip $(DOWNLOAD_PATH)/mnist/*.gz

download-cifar10:
	@echo "\033[0;32m[DATASETS] Downloading CIFAR-10 dataset\033[0m"
	@mkdir -p $(DOWNLOAD_PATH)/cifar10
	@wget https://www.cs.toronto.edu/~kriz/cifar-10-binary.tar.gz -O $(DOWNLOAD_PATH)/cifar10/cifar-10-binary.tar.gz
	@tar --strip-components=1 -xvzf $(DOWNLOAD_PATH)/cifar10/cifar-10-binary.tar.gz -C $(DOWNLOAD_PATH)/cifar10
	@rm $(DOWNLOAD_PATH)/cifar10/cifar-10-binary.tar.gz

datasets-server:
	@echo "\033[0;32m[DATASETS-SERVER] Building Docker image\033[0m"
	IMAGE_NAME=ghcr.io/fcrlab-unime/flat-datasets-server:latest; \
	DOCKERFILE_PATH=extra/datasets-server/Dockerfile; \
	CONTEXT_DIR=extra/datasets-server; \
	docker build --platform=linux/amd64 -t $$IMAGE_NAME -f $$DOCKERFILE_PATH $$CONTEXT_DIR && \
	echo "\033[0;32m[DATASETS-SERVER] Build completed successfully\033[0m" || \
	echo "\033[0;31m[DATASETS-SERVER] Build failed\033[0m"

models:
	DIRECTORY=examples/fl-fedavg; \
	CONTAINER_NAME=flat-onnx-builder && \
	docker build -t $$CONTAINER_NAME ./examples/fl-fedavg/src/models && \
	docker run --platform=linux/amd64 -it --name $$CONTAINER_NAME --rm \
		-v ./examples/fl-fedavg/src/models:/app \
		-v ./examples/fl-fedavg/dist/models:/dist \
		$$CONTAINER_NAME /bin/sh -c "make build"

models-dnn:
	DIRECTORY=examples/fl-fedavg; \
	CONTAINER_NAME=flat-onnx-builder && \
	docker build -t $$CONTAINER_NAME ./examples/fl-fedavg/src/models && \
	docker run --platform=linux/amd64 -it --name $$CONTAINER_NAME --rm \
		-v ./examples/fl-fedavg/src/models:/app \
		-v ./examples/fl-fedavg/dist/models:/dist \
		$$CONTAINER_NAME /bin/sh -c "make build-dnn"

models-cnn:
	DIRECTORY=examples/fl-fedavg; \
	CONTAINER_NAME=flat-onnx-builder && \
	docker build -t $$CONTAINER_NAME ./examples/fl-fedavg/src/models && \
	docker run --platform=linux/amd64 -it --name $$CONTAINER_NAME --rm \
		-v ./examples/fl-fedavg/src/models:/app \
		-v ./examples/fl-fedavg/dist/models:/dist \
		$$CONTAINER_NAME /bin/sh -c "make build-cnn"
