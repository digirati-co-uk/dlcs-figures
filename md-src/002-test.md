---
title: Sequence Diagram Again
order: 4
---
# Another one

> A Sequence diagram is an interaction diagram that shows how processes operate with one another and in what order.

Mermaid can render sequence diagrams. The code snippet below:
```
%% Example of sequence diagram
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
```

Renders the following diagram:

```
sequenceDiagram
    Tom->>John: Hello John, how are you?
    John-->>Tom: Great!
```
