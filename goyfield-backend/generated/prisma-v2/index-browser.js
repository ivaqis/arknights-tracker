
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime
} = require('./runtime/index-browser.js')


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

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

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
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
