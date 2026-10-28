const INTEGRATION_OPT_IN = "--run-local-qa-integration";
const MUTATION_OPT_IN = "--allow-local-qa-mutations";

export function requireLocalQaIntegrationOptIn(args = process.argv.slice(2)) {
  if (!args.includes(INTEGRATION_OPT_IN)) {
    throw new Error(`Local QA integration is opt-in; pass ${INTEGRATION_OPT_IN} to continue.`);
  }
}

export function requireLocalQaMutationOptIn(args = process.argv.slice(2)) {
  requireLocalQaIntegrationOptIn(args);
  if (!args.includes(MUTATION_OPT_IN)) {
    throw new Error(`This local QA script mutates data; pass ${MUTATION_OPT_IN} to continue.`);
  }
}
