# Portfolio Builder Test Assets

This directory contains realistic test data for validating the portfolio builder implementation. Use these assets to ensure your implementation handles real-world content and user scenarios properly.

## Structure

```
test-assets/
├── README.md                     # This file
├── IMAGE-GENERATION-SPECS.md     # Detailed image specifications for GenAI
├── user-profiles/                # Realistic user data
│   ├── sarah-chen/              # Theatre costume designer
│   ├── marcus-williams/         # New freelance designer
│   └── emma-rodriguez/          # Veteran film supervisor
├── basic-testing/               # Generic test content
└── sample-content/              # Reusable text content
```

## Usage Instructions

1. **Generate Images**: Use the specifications in `IMAGE-GENERATION-SPECS.md` to create realistic portfolio images
2. **Seed User Accounts**: Import the profile.json files to create pre-configured test users
3. **Test Scenarios**: Use the realistic content to validate upload, gallery, and editing workflows
4. **Performance Testing**: Large image sets test optimization and loading performance

## Test User Accounts

Each user profile represents different complexity levels:

- **Sarah Chen**: Medium complexity (8-12 images, 3 projects, theatre focus)
- **Marcus Williams**: Low complexity (6-8 images, 1 project, getting started)
- **Emma Rodriguez**: High complexity (25+ images, 10+ projects, extensive portfolio)
- **Basic Testing**: Minimal complexity (3-4 images, simple content)

## Validation Scenarios

Use these assets to test:

### Core Functionality
- ✓ Image upload and optimization
- ✓ Gallery creation and management
- ✓ Text editing and formatting
- ✓ Theme switching with content preservation
- ✓ Draft/publish workflow

### User Experience Flows
- ✓ First-time portfolio creation (Marcus)
- ✓ Mobile editing and photo upload (Sarah)
- ✓ Large portfolio organization (Emma)
- ✓ Theme adaptation scenarios
- ✓ Collaborative review process

### Performance & Edge Cases
- ✓ Large image uploads (film production stills)
- ✓ Mixed aspect ratios in galleries
- ✓ Bulk operations (Emma's extensive portfolio)
- ✓ Mobile network conditions
- ✓ Accessibility validation

## Implementation Notes

- Images should be generated at realistic resolutions (2000x1500px minimum for portfolio photos)
- Include a mix of aspect ratios: portrait, landscape, and square
- Ensure alt text examples demonstrate accessibility best practices
- Profile data reflects real creative professional needs and workflows
- Content complexity increases from Marcus → Sarah → Emma for progressive testing