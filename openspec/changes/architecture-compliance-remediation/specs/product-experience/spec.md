## MODIFIED Requirements

### Requirement: Vue L2 carrier does not violate no-preview rule

The product experience model SHALL NOT be demonstrated in Vue morphing mode with a co-located preview panel. Vue morphing is a parity surface, not the sole L2 carrier; documentation SHALL state L2 primary carrier remains `examples/react` morphing mode.

#### Scenario: Vue morphing demo is preview-free

- **WHEN** maintainer runs `examples/vue` in morphing mode
- **THEN** editing uses in-block source surface only
- **AND** no adjacent serialized preview panel is shown
