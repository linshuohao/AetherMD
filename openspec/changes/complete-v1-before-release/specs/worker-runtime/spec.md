## ADDED Requirements

### Requirement: Parser runs in worker thread

The system **MUST** support parsing Markdown in a Worker thread with main-thread orchestration.

#### Scenario: Parse request from main thread

- **WHEN** `createEditor` is configured with worker parsing enabled
- **AND** initial markdown is provided
- **THEN** parsing completes without blocking the main thread beyond message dispatch
- **AND** the resulting document is applied to the engine session

### Requirement: Serializer runs in worker thread

The system **MUST** support serializing documents to Markdown in a Worker thread.

#### Scenario: Serialize on getMarkdown

- **WHEN** worker serialization is enabled
- **AND** `getMarkdown()` is called
- **THEN** serialization completes via Worker message protocol
- **AND** markdown string is returned to the host
