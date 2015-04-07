---
title: PDF Service
order: 1
---


```
sequenceDiagram
    User->>API: GET /pdf?seq=/iiif/cust/seq/
    alt pdf exists in cust S3
       API->>User: (application/pdf response)
    else pdf does not exist
       API->>PdfSvc: GetEstimatedBuildTime()
       alt build time lt threshold
          API->>User: (application/pdf response)
       else build time gt threshold
          API->>User: 301 redirect to wait/notify page
       end
    end
```
