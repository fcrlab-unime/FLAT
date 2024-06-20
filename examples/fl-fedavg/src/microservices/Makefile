.PHONY: build build-client build-aggregator build-evaluator

AGGREGATOR_DIR=/app/aggregator
CLIENT_DIR=/app/client
EVALUATOR_DIR=/app/evaluator
TEMP_DIR=/tmp

build: build-aggregator build-client build-evaluator

build-aggregator:
	@echo "Building aggregator..."
	@cp -rT $(AGGREGATOR_DIR) $(TEMP_DIR)/aggregator
	@cd $(TEMP_DIR)/aggregator && npm install && npx tsc --outDir $(TEMP_DIR)/aggregator/dist
	@cp -rT $(TEMP_DIR)/aggregator/dist /dist/aggregator

build-client:
	@echo "Building client..."
	@cp -rT $(CLIENT_DIR) $(TEMP_DIR)/client
	@cd $(TEMP_DIR)/client && npm install && npm run build
	@cp -rT $(TEMP_DIR)/client/dist /dist/client

build-evaluator:
	@echo "Building evaluator..."
	@cp -rT $(EVALUATOR_DIR) $(TEMP_DIR)/evaluator
	@cd $(TEMP_DIR)/evaluator && npm install && npm run build
	@cp -rT $(TEMP_DIR)/evaluator/dist /dist/evaluator
