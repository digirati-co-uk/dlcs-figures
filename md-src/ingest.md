---
title: Ingest, origin supplied
order: 1
---

```
sequenceDiagram
    Customer->>API: POST /images/customer/
    Note right of Customer: JSON document,<br/>like info.json<br/>No binary payload
    Note right of API: Ingest is async<br/>Pulled from queue
    API->>ImageService: Ingest    
    alt If 'immediate'
        ImageService->>Customer: GET /origin
        ImageService->>kdu_exe: Convert to JP2
        Note right of ImageService: Save to SCRATCH EFS
        ImageService->>kdu_exe: MakeThumbnails
        Note right of kdu_exe: Bound by 100, by 400<br/>Save to Customer S3
        ImageService->>ImageServerNode: GET /../info.json
        ImageService->>DynamoDB: (Write entry)
        opt If 'Keep'
            ImageService->>S3: Save JP2
        end
    else Deferred
        ImageService->>DynamoDB: Write placeholder
        Note right of ImageService: This is an unseen image<br/>Use w,h from customer<br/>Leave info.json blank
    end


```
