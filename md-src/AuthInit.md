---
title: Authentication
order: 3
---

```
sequenceDiagram
    User->>DLCS: GET /protected
    DLCS->>DLCS: Show Login
    DLCS->>Customer: Redirect
    User->>Customer: Authenticate
    Customer->>DLCS: redirect with token
    DLCS->>Customer: Acquire user and roles
    DLCS->>User: Set Cookie with Roles
    User->>DLCS: GET /protected
    DLCS->>Image Database: Match roles
    DLCS->>User: 200 OK
```