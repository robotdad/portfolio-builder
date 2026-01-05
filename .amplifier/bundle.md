---
bundle:
  name: portfolio
  version: 0.1.0
  description: Foundation bundle with TypeScript/JavaScript code intelligence and skills

# Include both foundation and lsp-typescript
includes:
  - bundle: git+https://github.com/microsoft/amplifier-foundation@main
  - bundle: git+https://github.com/robotdad/amplifier-bundle-lsp-typescript@main
  - bundle: git+https://github.com/microsoft/amplifier-module-tool-skills@main#subdirectory=behaviors/skills.yaml
---