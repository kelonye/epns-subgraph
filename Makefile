build:
	@yarn $@

deploy:
	@yarn $@

cg:
	@yarn codegen

.PHONY: \
	build \
	deploy \
	cg