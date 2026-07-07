## ADDED Requirements

### Requirement: Permission guard blocks unauthorized API access

The Core **MUST** enforce runtime permissions before executing privileged operations.

#### Scenario: Missing permission rejects command

- **WHEN** a plugin dispatches a command requiring permission not in `grantedPermissions`
- **THEN** `dispatch` returns `{ ok: false }` with `error.source` of `core`
- **AND** the handler is not invoked

#### Scenario: Granted permission allows command

- **WHEN** the required permission is in `grantedPermissions`
- **THEN** the command proceeds through the Guard chain
