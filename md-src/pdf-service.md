---
title: PDF Service
order: 1
---


```
sequenceDiagram
    User->>API: GET /pdf?seq=/iiif/cust/seq/
    alt pdf exists
       API->>API: WriteFile()
```
