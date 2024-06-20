.PHONY: build build-dnn build-cnn

DNN_DIR=/app/mnist
CNN_DIR=/app/cifar10
TEMP_DIR=/tmp

build: build-dnn build-cnn

build-dnn:
	@echo "Building DNN..."
	@cp -rT $(DNN_DIR) $(TEMP_DIR)/mnist
	@cd $(TEMP_DIR)/mnist && python3 compile.py --output_dir dist
	@cp -rT $(TEMP_DIR)/mnist/dist /dist/mnist

build-cnn:
	@echo "Building CNN..."
	@cp -rT $(CNN_DIR) $(TEMP_DIR)/cifar10
	@cd $(TEMP_DIR)/cifar10 && python3 compile.py --output_dir dist
	@cp -rT $(TEMP_DIR)/cifar10/dist /dist/cifar10