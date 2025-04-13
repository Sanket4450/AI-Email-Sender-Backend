
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
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

exports.Prisma.CompanyScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  location: 'location',
  isDeleted: 'isDeleted',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContactScalarFieldEnum = {
  id: 'id',
  name: 'name',
  position: 'position',
  email: 'email',
  phone: 'phone',
  linkedInUrl: 'linkedInUrl',
  location: 'location',
  companyId: 'companyId',
  isDeleted: 'isDeleted',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContactEventScalarFieldEnum = {
  id: 'id',
  contactId: 'contactId',
  eventType: 'eventType',
  createdAt: 'createdAt'
};

exports.Prisma.EmailScalarFieldEnum = {
  id: 'id',
  subject: 'subject',
  body: 'body',
  messageId: 'messageId',
  contactId: 'contactId',
  isBounced: 'isBounced',
  isSpamReported: 'isSpamReported',
  senderId: 'senderId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmailEventScalarFieldEnum = {
  id: 'id',
  emailId: 'emailId',
  eventType: 'eventType',
  createdAt: 'createdAt'
};

exports.Prisma.FollowUpScalarFieldEnum = {
  id: 'id',
  subject: 'subject',
  body: 'body',
  emailId: 'emailId',
  scheduledAt: 'scheduledAt',
  isBounced: 'isBounced',
  isSpamReported: 'isSpamReported',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FollowUpEventScalarFieldEnum = {
  id: 'id',
  followUpId: 'followUpId',
  eventType: 'eventType',
  createdAt: 'createdAt'
};

exports.Prisma.DraftScalarFieldEnum = {
  id: 'id',
  subject: 'subject',
  body: 'body',
  scheduledAt: 'scheduledAt',
  senderId: 'senderId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DraftContactScalarFieldEnum = {
  draftId: 'draftId',
  contactId: 'contactId'
};

exports.Prisma.LLMLogScalarFieldEnum = {
  id: 'id',
  prompt: 'prompt',
  response: 'response',
  isError: 'isError',
  createdAt: 'createdAt'
};

exports.Prisma.WebhookLogScalarFieldEnum = {
  id: 'id',
  platform: 'platform',
  body: 'body',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  emailId: 'emailId',
  type: 'type',
  isRead: 'isRead',
  isDeleted: 'isDeleted',
  createdAt: 'createdAt'
};

exports.Prisma.PurposeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  isDeleted: 'isDeleted',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DraftPurposeScalarFieldEnum = {
  draftId: 'draftId',
  purposeId: 'purposeId'
};

exports.Prisma.EmailPurposeScalarFieldEnum = {
  emailId: 'emailId',
  purposeId: 'purposeId'
};

exports.Prisma.SenderScalarFieldEnum = {
  id: 'id',
  displayName: 'displayName',
  name: 'name',
  email: 'email',
  apiKey: 'apiKey',
  esp: 'esp',
  priority: 'priority',
  target: 'target',
  sentCount: 'sentCount',
  isDeleted: 'isDeleted',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TagScalarFieldEnum = {
  id: 'id',
  title: 'title',
  isDeleted: 'isDeleted'
};

exports.Prisma.CompanyTagScalarFieldEnum = {
  companyId: 'companyId',
  tagId: 'tagId'
};

exports.Prisma.ContactTagScalarFieldEnum = {
  contactId: 'contactId',
  tagId: 'tagId'
};

exports.Prisma.PurposeTagScalarFieldEnum = {
  purposeId: 'purposeId',
  tagId: 'tagId'
};

exports.Prisma.DraftTagScalarFieldEnum = {
  draftId: 'draftId',
  tagId: 'tagId'
};

exports.Prisma.EmailTagScalarFieldEnum = {
  emailId: 'emailId',
  tagId: 'tagId'
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
exports.ContactEventType = exports.$Enums.ContactEventType = {
  notContacted: 'notContacted',
  emailSent: 'emailSent',
  rejected: 'rejected',
  pending: 'pending',
  replied: 'replied'
};

exports.EmailEventType = exports.$Enums.EmailEventType = {
  processed: 'processed',
  delivered: 'delivered',
  opened: 'opened',
  clicked: 'clicked'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  reply: 'reply'
};

exports.Prisma.ModelName = {
  Company: 'Company',
  Contact: 'Contact',
  ContactEvent: 'ContactEvent',
  Email: 'Email',
  EmailEvent: 'EmailEvent',
  FollowUp: 'FollowUp',
  FollowUpEvent: 'FollowUpEvent',
  Draft: 'Draft',
  DraftContact: 'DraftContact',
  LLMLog: 'LLMLog',
  WebhookLog: 'WebhookLog',
  Notification: 'Notification',
  Purpose: 'Purpose',
  DraftPurpose: 'DraftPurpose',
  EmailPurpose: 'EmailPurpose',
  Sender: 'Sender',
  Tag: 'Tag',
  CompanyTag: 'CompanyTag',
  ContactTag: 'ContactTag',
  PurposeTag: 'PurposeTag',
  DraftTag: 'DraftTag',
  EmailTag: 'EmailTag'
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
