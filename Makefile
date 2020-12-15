build:
	@yarn $@

deploy:
	@ln -sf $(PWD)/subgraph.production.yaml $(PWD)/subgraph.yaml
	@yarn $@

deploy-staging:
	@ln -sf $(PWD)/subgraph.staging.yaml $(PWD)/subgraph.yaml
	@yarn $@

cg:
	@yarn codegen

.PHONY: \
	build \
	deploy \
	cg