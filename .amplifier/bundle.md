---
bundle:
  name: portfolio
  version: 0.1.0
  description: Expert delegation bundle with TS web dev bundle

# Include both exp-delegation and ts web dev bundle
includes:
  - bundle: git+https://github.com/microsoft/amplifier-foundation@main#subdirectory=experiments/delegation-only
  - bundle: git+https://github.com/microsoft/amplifier-bundle-design-intelligence@main#subdirectory=behaviors/design-intelligence.yaml
  - bundle: git+https://github.com/microsoft/amplifier-bundle-ts-dev@main
  - bundle: git+https://github.com/microsoft/amplifier-bundle-issues@main
---