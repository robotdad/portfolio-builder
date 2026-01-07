---
bundle:
  name: portfolio
  version: 0.1.0
  description: Foundation bundle with TypeScript/JavaScript code intelligence

# Include both foundation and lsp-typescript
includes:
  - bundle: git+https://github.com/microsoft/amplifier-foundation@main
  - bundle: git+https://github.com/microsoft/amplifier-bundle-lsp-typescript@main
---