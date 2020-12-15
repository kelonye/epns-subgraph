## EPNS Subgraph

### Deployed instances

- https://thegraph.com/explorer/subgraph/vbstreetz/epns (production)
- https://thegraph.com/explorer/subgraph/vbstreetz/epns-staging (staging)

### Example usage

This subgraph is being used by [epns-sdk](https://github.com/vbstreetz/epns-sdk) to power these dapp frontends:

- https://epns.surge.sh (production)
- https://epns-staging.surge.sh (staging)

### Deployment

1. Create a new subgraph at https://thegraph.com/explorer/subgraph/create. You might want to create an additional one for staging.
2. Ran `yarn` to install node packages.
3. Create a symlink from `subgraph.production.yaml` to `subgraph.yaml` with `yarn link-production`.
4. Ran `yarn codegen` to generated required epns subgraph files.
5. Update `vbstreetz/epns` and `vbstreetz/epns-staging` in `package.json` to match your instance(s).
6. Deploy to the production subgraph with `yarn deploy-production`.
7. To deploy to staging:
   - Change the symlink to originate from `subgraph.staging.yaml` with `yarn link-staging`.
   - Deploy to the staging subgraph `yarn deploy-staging`
8. Visit the subgraphs and verify no errors in the indexing.
