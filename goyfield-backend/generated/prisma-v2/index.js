
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.19.0
 * Query Engine version: 5fe21811a6ba0b952a3bc71400666511fe3b902f
 */
Prisma.prismaVersion = {
  client: "5.19.0",
  engine: "5fe21811a6ba0b952a3bc71400666511fe3b902f"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}


  const path = require('path')

/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.FirebaseUserScalarFieldEnum = {
  firebaseUid: 'firebaseUid',
  createdAt: 'createdAt'
};

exports.Prisma.UserScalarFieldEnum = {
  uid: 'uid',
  publicUid: 'publicUid',
  firebaseUid: 'firebaseUid',
  isPrivate: 'isPrivate',
  avatarId: 'avatarId',
  backgroundId: 'backgroundId',
  displayAvatar: 'displayAvatar',
  uploadCount: 'uploadCount',
  lastUploadReset: 'lastUploadReset',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserGameProfileScalarFieldEnum = {
  gameUid: 'gameUid',
  serverId: 'serverId',
  uid: 'uid',
  level: 'level',
  data: 'data',
  bannerProfileId: 'bannerProfileId'
};

exports.Prisma.UserContractLeaderboardScalarFieldEnum = {
  id: 'id',
  recordId: 'recordId',
  gameUid: 'gameUid',
  contractId: 'contractId',
  indicatorCount: 'indicatorCount',
  clearTimeSec: 'clearTimeSec',
  data: 'data',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserContractCharacterScalarFieldEnum = {
  userRecordId: 'userRecordId',
  charId: 'charId'
};

exports.Prisma.UserMonumentLeaderboardScalarFieldEnum = {
  id: 'id',
  userGroupId: 'userGroupId',
  gameUid: 'gameUid',
  dungeonId: 'dungeonId',
  groupId: 'groupId',
  isHard: 'isHard',
  clearTimeSec: 'clearTimeSec',
  data: 'data',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserMonumentGroupScalarFieldEnum = {
  id: 'id',
  gameUid: 'gameUid',
  groupId: 'groupId',
  isHard: 'isHard'
};

exports.Prisma.UserMonumentCharacterScalarFieldEnum = {
  recordId: 'recordId',
  userGroupId: 'userGroupId',
  charId: 'charId'
};

exports.Prisma.UserBannerProfileScalarFieldEnum = {
  profileId: 'profileId',
  publicId: 'publicId',
  privateId: 'privateId',
  version: 'version',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BannerTokenIdScalarFieldEnum = {
  id: 'id',
  profileId: 'profileId',
  createdAt: 'createdAt'
};

exports.Prisma.BannerPullsIdScalarFieldEnum = {
  id: 'id',
  period: 'period',
  profileId: 'profileId',
  createdAt: 'createdAt'
};

exports.Prisma.UserBannerStatScalarFieldEnum = {
  profileId: 'profileId',
  bannerId: 'bannerId',
  bannerType: 'bannerType',
  unfreePulls: 'unfreePulls',
  total6: 'total6',
  total5: 'total5',
  won5050: 'won5050',
  total5050: 'total5050',
  freePulls: 'freePulls',
  free6: 'free6',
  free5: 'free5',
  freeWin5050: 'freeWin5050',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserCharBannerTypePullsScalarFieldEnum = {
  profileId: 'profileId',
  bannerType: 'bannerType',
  last6Pull: 'last6Pull',
  last5Pull: 'last5Pull',
  lastWin5050Pull: 'lastWin5050Pull',
  lastPullTimeTs: 'lastPullTimeTs',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserCharBannerPullsScalarFieldEnum = {
  profileId: 'profileId',
  bannerId: 'bannerId',
  last6LimitedPull: 'last6LimitedPull',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserWeaponBannerPullsScalarFieldEnum = {
  profileId: 'profileId',
  bannerId: 'bannerId',
  last6Pull: 'last6Pull',
  last5Pull: 'last5Pull',
  lastWin5050Pull: 'lastWin5050Pull',
  lastPullTimeTs: 'lastPullTimeTs',
  updatedAt: 'updatedAt'
};

exports.Prisma.GlobalBannerTimelineScalarFieldEnum = {
  bannerId: 'bannerId',
  date: 'date',
  totalPullsCount: 'totalPullsCount',
  freePullsCount: 'freePullsCount'
};

exports.Prisma.GlobalPityDistributionScalarFieldEnum = {
  bannerId: 'bannerId',
  pity: 'pity',
  rarity: 'rarity',
  count: 'count'
};

exports.Prisma.GlobalItemStatsScalarFieldEnum = {
  bannerId: 'bannerId',
  itemId: 'itemId',
  rarity: 'rarity',
  count: 'count'
};

exports.Prisma.ImportErrorScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  url: 'url',
  message: 'message',
  stack: 'stack',
  serverId: 'serverId',
  solved: 'solved'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  FirebaseUser: 'FirebaseUser',
  User: 'User',
  UserGameProfile: 'UserGameProfile',
  UserContractLeaderboard: 'UserContractLeaderboard',
  UserContractCharacter: 'UserContractCharacter',
  UserMonumentLeaderboard: 'UserMonumentLeaderboard',
  UserMonumentGroup: 'UserMonumentGroup',
  UserMonumentCharacter: 'UserMonumentCharacter',
  UserBannerProfile: 'UserBannerProfile',
  BannerTokenId: 'BannerTokenId',
  BannerPullsId: 'BannerPullsId',
  UserBannerStat: 'UserBannerStat',
  UserCharBannerTypePulls: 'UserCharBannerTypePulls',
  UserCharBannerPulls: 'UserCharBannerPulls',
  UserWeaponBannerPulls: 'UserWeaponBannerPulls',
  GlobalBannerTimeline: 'GlobalBannerTimeline',
  GlobalPityDistribution: 'GlobalPityDistribution',
  GlobalItemStats: 'GlobalItemStats',
  ImportError: 'ImportError'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\Users\\makiv\\Desktop\\ArknightProject\\goyfield-backend\\generated\\prisma-v2",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "C:\\Users\\makiv\\Desktop\\ArknightProject\\goyfield-backend\\prisma\\v2\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../.env"
  },
  "relativePath": "../../prisma/v2",
  "clientVersion": "5.19.0",
  "engineVersion": "5fe21811a6ba0b952a3bc71400666511fe3b902f",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider = \"prisma-client-js\"\n  output   = \"../../generated/prisma-v2\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel FirebaseUser {\n  firebaseUid String   @id\n  createdAt   DateTime @default(now())\n\n  user User?\n}\n\nmodel User {\n  uid             BigInt   @id @default(autoincrement())\n  publicUid       String   @unique\n  firebaseUid     String?  @unique\n  isPrivate       Boolean  @default(false)\n  avatarId        String?\n  backgroundId    String?\n  displayAvatar   Boolean  @default(true)\n  uploadCount     Int      @default(0)\n  lastUploadReset DateTime @default(now())\n  createdAt       DateTime @default(now())\n  updatedAt       DateTime @updatedAt\n\n  firebaseUser FirebaseUser? @relation(fields: [firebaseUid], references: [firebaseUid], onDelete: Cascade)\n\n  userGameProfiles UserGameProfile[]\n\n  @@index([firebaseUid])\n  @@index([publicUid])\n}\n\nmodel UserGameProfile {\n  gameUid         String  @id\n  serverId        String\n  uid             BigInt\n  level           Int\n  data            String // json\n  bannerProfileId BigInt? @unique\n\n  user              User               @relation(fields: [uid], references: [uid], onDelete: Cascade)\n  userBannerProfile UserBannerProfile? @relation(fields: [bannerProfileId], references: [profileId])\n\n  userContractLeaderboards UserContractLeaderboard[]\n  userMonumentLeaderboards UserMonumentLeaderboard[]\n  userMonumentGroups       UserMonumentGroup[]\n\n  @@index([uid, serverId])\n  @@index([bannerProfileId])\n}\n\nmodel UserContractLeaderboard {\n  id             String   @id @default(uuid())\n  recordId       String   @unique\n  gameUid        String\n  contractId     String\n  indicatorCount Int\n  clearTimeSec   Int\n  data           String // json\n  updatedAt      DateTime @updatedAt\n\n  userGameProfile UserGameProfile @relation(fields: [gameUid], references: [gameUid], onDelete: Cascade)\n\n  userContractCharacters UserContractCharacter[]\n\n  @@index([gameUid, contractId])\n  @@index([contractId])\n  @@index([recordId])\n}\n\nmodel UserContractCharacter {\n  userRecordId String\n  charId       String\n\n  userContractLeaderboard UserContractLeaderboard @relation(fields: [userRecordId], references: [id], onDelete: Cascade)\n\n  @@id([userRecordId, charId])\n}\n\nmodel UserMonumentLeaderboard {\n  id           String   @id @default(uuid())\n  userGroupId  String\n  gameUid      String\n  dungeonId    String\n  groupId      String\n  isHard       Boolean\n  clearTimeSec Int\n  data         String // json\n  updatedAt    DateTime @updatedAt\n\n  userGameProfile   UserGameProfile   @relation(fields: [gameUid], references: [gameUid], onDelete: Cascade)\n  userMonumentGroup UserMonumentGroup @relation(fields: [userGroupId], references: [id])\n\n  userMonumentCharacters UserMonumentCharacter[]\n\n  @@unique([gameUid, dungeonId])\n  @@index([gameUid, dungeonId])\n  @@index([dungeonId])\n  @@index([groupId, isHard])\n  @@index([userGroupId])\n}\n\nmodel UserMonumentGroup {\n  id      String  @id @default(uuid())\n  gameUid String\n  groupId String\n  isHard  Boolean\n\n  userGameProfile UserGameProfile @relation(fields: [gameUid], references: [gameUid], onDelete: Cascade)\n\n  userMonumentLeaderboards UserMonumentLeaderboard[]\n  userMonumentCharacters   UserMonumentCharacter[]\n\n  @@unique([gameUid, groupId, isHard])\n  @@index([groupId, isHard, gameUid])\n}\n\nmodel UserMonumentCharacter {\n  recordId    String\n  userGroupId String\n  charId      String\n\n  userMonumentLeaderboard UserMonumentLeaderboard @relation(fields: [recordId], references: [id], onDelete: Cascade)\n  userMonumentGroup       UserMonumentGroup       @relation(fields: [userGroupId], references: [id], onDelete: Cascade)\n\n  @@id([recordId, charId])\n  @@index([userGroupId, charId])\n}\n\nmodel UserBannerProfile {\n  profileId BigInt   @id @default(autoincrement())\n  publicId  String   @unique @default(uuid())\n  privateId String   @unique @default(uuid())\n  version   Int      @default(2)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  userGameProfile UserGameProfile?\n\n  userBannerStats         UserBannerStat[]\n  userCharBannerTypePulls UserCharBannerTypePulls[]\n  userCharBannerPulls     UserCharBannerPulls[]\n  userWeaponBannerPulls   UserWeaponBannerPulls[]\n  bannerTokenIds          BannerTokenId[]\n  bannerPullsIds          BannerPullsId[]\n\n  @@index([publicId])\n  @@index([privateId])\n}\n\nmodel BannerTokenId {\n  id        String   @id\n  profileId BigInt\n  createdAt DateTime @default(now())\n\n  bannerProfile UserBannerProfile @relation(fields: [profileId], references: [profileId])\n}\n\nmodel BannerPullsId {\n  id        String   @id\n  period    Int\n  profileId BigInt\n  createdAt DateTime @default(now())\n\n  bannerProfile UserBannerProfile @relation(fields: [profileId], references: [profileId])\n}\n\nmodel UserBannerStat {\n  profileId   BigInt\n  bannerId    String\n  bannerType  String\n  unfreePulls Int      @default(0)\n  total6      Int      @default(0)\n  total5      Int      @default(0)\n  won5050     Int      @default(0)\n  total5050   Int      @default(0)\n  freePulls   Int      @default(0)\n  free6       Int      @default(0)\n  free5       Int      @default(0)\n  freeWin5050 Int      @default(0)\n  updatedAt   DateTime @updatedAt\n\n  bannerProfile         UserBannerProfile      @relation(fields: [profileId], references: [profileId])\n  userCharBannerPulls   UserCharBannerPulls?\n  userWeaponBannerPulls UserWeaponBannerPulls?\n\n  @@id([profileId, bannerId])\n  @@index([bannerId])\n  @@index([bannerType, profileId])\n}\n\nmodel UserCharBannerTypePulls {\n  profileId       BigInt\n  bannerType      String\n  last6Pull       Int      @default(0) // unfree\n  last5Pull       Int      @default(0) // unfree\n  lastWin5050Pull Int      @default(0) // unfree\n  lastPullTimeTs  BigInt   @default(0)\n  updatedAt       DateTime @updatedAt\n\n  bannerProfile UserBannerProfile @relation(fields: [profileId], references: [profileId])\n\n  @@id([profileId, bannerType])\n}\n\nmodel UserCharBannerPulls {\n  profileId        BigInt\n  bannerId         String\n  last6LimitedPull Int      @default(0) // unfree\n  updatedAt        DateTime @updatedAt\n\n  bannerProfile UserBannerProfile @relation(fields: [profileId], references: [profileId])\n  bannerStat    UserBannerStat    @relation(fields: [profileId, bannerId], references: [profileId, bannerId])\n\n  @@id([profileId, bannerId])\n}\n\nmodel UserWeaponBannerPulls {\n  profileId       BigInt\n  bannerId        String\n  last6Pull       Int      @default(0)\n  last5Pull       Int      @default(0)\n  lastWin5050Pull Int      @default(0) // фактически используется как last6LimitedPull\n  lastPullTimeTs  BigInt   @default(0)\n  updatedAt       DateTime @updatedAt\n\n  bannerProfile UserBannerProfile @relation(fields: [profileId], references: [profileId])\n  bannerStat    UserBannerStat    @relation(fields: [profileId, bannerId], references: [profileId, bannerId])\n\n  @@id([profileId, bannerId])\n}\n\nmodel GlobalBannerTimeline {\n  bannerId        String\n  date            String // \"YYYY-MM-DD\"\n  totalPullsCount Int    @default(0)\n  freePullsCount  Int    @default(0)\n\n  @@id([bannerId, date])\n}\n\nmodel GlobalPityDistribution {\n  bannerId String\n  pity     Int\n  rarity   Int\n  count    Int    @default(0)\n\n  @@id([bannerId, pity, rarity])\n}\n\nmodel GlobalItemStats {\n  bannerId String\n  itemId   String\n  rarity   Int\n  count    Int    @default(0)\n\n  @@id([bannerId, itemId])\n  @@index([bannerId, rarity])\n}\n\nmodel ImportError {\n  id        Int      @id @default(autoincrement())\n  createdAt DateTime @default(now())\n  url       String\n  message   String\n  stack     String?\n  serverId  String?\n  solved    Boolean  @default(false)\n}\n",
  "inlineSchemaHash": "0922862a97d26d9dc78ca04cc57e833b7d9dd33ea0be194eae1b06c6efa3d16f",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "generated/prisma-v2",
    "prisma-v2",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"FirebaseUser\":{\"dbName\":null,\"fields\":[{\"name\":\"firebaseUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"FirebaseUserToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"User\":{\"dbName\":null,\"fields\":[{\"name\":\"uid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publicUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"firebaseUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isPrivate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"avatarId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"backgroundId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"displayAvatar\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"uploadCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastUploadReset\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"firebaseUser\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FirebaseUser\",\"relationName\":\"FirebaseUserToUser\",\"relationFromFields\":[\"firebaseUid\"],\"relationToFields\":[\"firebaseUid\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userGameProfiles\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserGameProfile\",\"relationName\":\"UserToUserGameProfile\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserGameProfile\":{\"dbName\":null,\"fields\":[{\"name\":\"gameUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"serverId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"uid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"level\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bannerProfileId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToUserGameProfile\",\"relationFromFields\":[\"uid\"],\"relationToFields\":[\"uid\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userBannerProfile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserBannerProfile\",\"relationName\":\"UserBannerProfileToUserGameProfile\",\"relationFromFields\":[\"bannerProfileId\"],\"relationToFields\":[\"profileId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userContractLeaderboards\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserContractLeaderboard\",\"relationName\":\"UserContractLeaderboardToUserGameProfile\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userMonumentLeaderboards\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMonumentLeaderboard\",\"relationName\":\"UserGameProfileToUserMonumentLeaderboard\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userMonumentGroups\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMonumentGroup\",\"relationName\":\"UserGameProfileToUserMonumentGroup\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserContractLeaderboard\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recordId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gameUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contractId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"indicatorCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clearTimeSec\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"userGameProfile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserGameProfile\",\"relationName\":\"UserContractLeaderboardToUserGameProfile\",\"relationFromFields\":[\"gameUid\"],\"relationToFields\":[\"gameUid\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userContractCharacters\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserContractCharacter\",\"relationName\":\"UserContractCharacterToUserContractLeaderboard\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserContractCharacter\":{\"dbName\":null,\"fields\":[{\"name\":\"userRecordId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userContractLeaderboard\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserContractLeaderboard\",\"relationName\":\"UserContractCharacterToUserContractLeaderboard\",\"relationFromFields\":[\"userRecordId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"userRecordId\",\"charId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserMonumentLeaderboard\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userGroupId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gameUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dungeonId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"groupId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isHard\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clearTimeSec\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"data\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"userGameProfile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserGameProfile\",\"relationName\":\"UserGameProfileToUserMonumentLeaderboard\",\"relationFromFields\":[\"gameUid\"],\"relationToFields\":[\"gameUid\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userMonumentGroup\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMonumentGroup\",\"relationName\":\"UserMonumentGroupToUserMonumentLeaderboard\",\"relationFromFields\":[\"userGroupId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userMonumentCharacters\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMonumentCharacter\",\"relationName\":\"UserMonumentCharacterToUserMonumentLeaderboard\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"gameUid\",\"dungeonId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"gameUid\",\"dungeonId\"]}],\"isGenerated\":false},\"UserMonumentGroup\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gameUid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"groupId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isHard\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userGameProfile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserGameProfile\",\"relationName\":\"UserGameProfileToUserMonumentGroup\",\"relationFromFields\":[\"gameUid\"],\"relationToFields\":[\"gameUid\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userMonumentLeaderboards\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMonumentLeaderboard\",\"relationName\":\"UserMonumentGroupToUserMonumentLeaderboard\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userMonumentCharacters\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMonumentCharacter\",\"relationName\":\"UserMonumentCharacterToUserMonumentGroup\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"gameUid\",\"groupId\",\"isHard\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"gameUid\",\"groupId\",\"isHard\"]}],\"isGenerated\":false},\"UserMonumentCharacter\":{\"dbName\":null,\"fields\":[{\"name\":\"recordId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userGroupId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userMonumentLeaderboard\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMonumentLeaderboard\",\"relationName\":\"UserMonumentCharacterToUserMonumentLeaderboard\",\"relationFromFields\":[\"recordId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userMonumentGroup\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMonumentGroup\",\"relationName\":\"UserMonumentCharacterToUserMonumentGroup\",\"relationFromFields\":[\"userGroupId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"recordId\",\"charId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserBannerProfile\":{\"dbName\":null,\"fields\":[{\"name\":\"profileId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publicId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"privateId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":2,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"userGameProfile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserGameProfile\",\"relationName\":\"UserBannerProfileToUserGameProfile\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userBannerStats\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserBannerStat\",\"relationName\":\"UserBannerProfileToUserBannerStat\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userCharBannerTypePulls\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserCharBannerTypePulls\",\"relationName\":\"UserBannerProfileToUserCharBannerTypePulls\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userCharBannerPulls\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserCharBannerPulls\",\"relationName\":\"UserBannerProfileToUserCharBannerPulls\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userWeaponBannerPulls\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserWeaponBannerPulls\",\"relationName\":\"UserBannerProfileToUserWeaponBannerPulls\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bannerTokenIds\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BannerTokenId\",\"relationName\":\"BannerTokenIdToUserBannerProfile\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bannerPullsIds\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BannerPullsId\",\"relationName\":\"BannerPullsIdToUserBannerProfile\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"BannerTokenId\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"profileId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bannerProfile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserBannerProfile\",\"relationName\":\"BannerTokenIdToUserBannerProfile\",\"relationFromFields\":[\"profileId\"],\"relationToFields\":[\"profileId\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"BannerPullsId\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"period\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"profileId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bannerProfile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserBannerProfile\",\"relationName\":\"BannerPullsIdToUserBannerProfile\",\"relationFromFields\":[\"profileId\"],\"relationToFields\":[\"profileId\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserBannerStat\":{\"dbName\":null,\"fields\":[{\"name\":\"profileId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bannerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bannerType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unfreePulls\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total6\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total5\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"won5050\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total5050\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"freePulls\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"free6\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"free5\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"freeWin5050\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"bannerProfile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserBannerProfile\",\"relationName\":\"UserBannerProfileToUserBannerStat\",\"relationFromFields\":[\"profileId\"],\"relationToFields\":[\"profileId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userCharBannerPulls\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserCharBannerPulls\",\"relationName\":\"UserBannerStatToUserCharBannerPulls\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userWeaponBannerPulls\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserWeaponBannerPulls\",\"relationName\":\"UserBannerStatToUserWeaponBannerPulls\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"profileId\",\"bannerId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserCharBannerTypePulls\":{\"dbName\":null,\"fields\":[{\"name\":\"profileId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bannerType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last6Pull\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last5Pull\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastWin5050Pull\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastPullTimeTs\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":\"0\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"bannerProfile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserBannerProfile\",\"relationName\":\"UserBannerProfileToUserCharBannerTypePulls\",\"relationFromFields\":[\"profileId\"],\"relationToFields\":[\"profileId\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"profileId\",\"bannerType\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserCharBannerPulls\":{\"dbName\":null,\"fields\":[{\"name\":\"profileId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bannerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last6LimitedPull\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"bannerProfile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserBannerProfile\",\"relationName\":\"UserBannerProfileToUserCharBannerPulls\",\"relationFromFields\":[\"profileId\"],\"relationToFields\":[\"profileId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bannerStat\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserBannerStat\",\"relationName\":\"UserBannerStatToUserCharBannerPulls\",\"relationFromFields\":[\"profileId\",\"bannerId\"],\"relationToFields\":[\"profileId\",\"bannerId\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"profileId\",\"bannerId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserWeaponBannerPulls\":{\"dbName\":null,\"fields\":[{\"name\":\"profileId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bannerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last6Pull\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last5Pull\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastWin5050Pull\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastPullTimeTs\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":\"0\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"bannerProfile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserBannerProfile\",\"relationName\":\"UserBannerProfileToUserWeaponBannerPulls\",\"relationFromFields\":[\"profileId\"],\"relationToFields\":[\"profileId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bannerStat\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserBannerStat\",\"relationName\":\"UserBannerStatToUserWeaponBannerPulls\",\"relationFromFields\":[\"profileId\",\"bannerId\"],\"relationToFields\":[\"profileId\",\"bannerId\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"profileId\",\"bannerId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"GlobalBannerTimeline\":{\"dbName\":null,\"fields\":[{\"name\":\"bannerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalPullsCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"freePullsCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"bannerId\",\"date\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"GlobalPityDistribution\":{\"dbName\":null,\"fields\":[{\"name\":\"bannerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rarity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"bannerId\",\"pity\",\"rarity\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"GlobalItemStats\":{\"dbName\":null,\"fields\":[{\"name\":\"bannerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rarity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"bannerId\",\"itemId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ImportError\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stack\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"serverId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"solved\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "query_engine-windows.dll.node");
path.join(process.cwd(), "generated/prisma-v2/query_engine-windows.dll.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "generated/prisma-v2/schema.prisma")
