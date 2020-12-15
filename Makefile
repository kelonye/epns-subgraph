build:
	@yarn $@

deploy-production:
	@yarn link-production
	@yarn $@

deploy-staging:
	@yarn link-staging
	@yarn $@

cg:
	@yarn codegen

.PHONY: \
	build \
	deploy \
	cg