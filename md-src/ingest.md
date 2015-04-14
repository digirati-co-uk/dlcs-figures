---
title: Ingest, origin supplied
order: 1
---


```
sequenceDiagram
  participant Customer
  participant API  
    Customer->>API: POST /images/customer/
    Note right of Customer: JSON document, like info.json

```
