# API Reference

## Overview

* GET `/api/admin/errors`
* GET `/api/global/stats`
* POST `/api/import`
* GET `/api/leaderboard/contract`
* GET `/api/leaderboard/contract/run`
* GET `/api/leaderboard/monument`
* GET `/api/leaderboard/monument/run`
* GET `/api/rankings/data`
* DELETE `/api/user/game-account/delete`
* GET `/api/user/profile/get`
* POST `/api/user/profile/create`
* POST `/api/user/profile/update`
* DELETE `/api/user/profile/delete`
* POST `/api/user/sync`
* POST `/api/user/upload-avatar`
* GET `/uploads`

## Endpoints

### GET `/api/admin/errors`

Query

* secret: string

Response

хз

### GET `/api/global/stats`

Query

* bannerId: string

Response

### POST `/api/import`

Query

* u8token: string
* authToken: string

Body

* share: boolean
* lastPullTimes { [bannerType]: number (ms) }

Response

### GET `/api/leaderboard/contract`

Query

* contractId: string
* serverId?: string
* sortField: "level" | "indicatorCount" | "time"
* sortDirection: "asc" | "desc"

Response

### GET `/api/leaderboard/contract/run`

Query

* recordId: string
* firebaseToken?: string

Response

### GET `/api/leaderboard/monument`

Query

* groupId: string
* serverId?: string
* sortField: "time"
* sortDirection: "asc" | "desc"

Response

### GET `/api/leaderboard/monument/run`

Query

* dungeonId: string
* gameUid: string
* firebaseToken?: string

Response

### GET `/api/rankings/data`

Query

* bannerType?: string
* authToken?: string
* gameUid?: string
* firebaseToken?: string

Response

### DELETE `/api/user/game-account/delete`

Query

* gameUid: string
* firebaseToken: string

Response

### GET `/api/user/profile/get`

Query

* uid: string
* firebaseToken?: string

Response

### POST `/api/user/profile/create`

Query

* uid: string
* firebaseToken: string

Response

### POST `/api/user/profile/update`

Query

* uid: string
* firebaseToken: string

Body

* newUid?: string
* isPrivate?: boolean
* avatarId?: string
* backgroundId?: string

Response

### DELETE `/api/user/profile/delete`

Query

* uid: string
* firebaseToken: string

Response

### POST `/api/user/sync`

Query

* firebaseToken: string
* uid: string
* serverId?: string

Response

### POST `/api/user/upload-avatar`

Query

* firebaseToken: string
* uid: string

Body

* image: string
* filename: string

Response

### GET `/uploads`

Query

* imageId

Response







