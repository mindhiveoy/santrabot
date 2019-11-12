/**
 * Database typings for Santrabot system
 *
 * @author Ville Venäläinen / Mindhive Oy
 */

/**
 * Schema definition of Firebase database
 */
export const enum Schema {
  /**
   * Sub collection under organization listing organization's bots
   */
  BOTS = "bots",

  /**
   * Chat message docs defined as answer-response pairs with ChatMessagePair
   */
  CHAT_MESSAGES = "chat-messages",
  /**
   * Chat sessions done under a single organization. Documents are described with ChatSession interface.
   */
  CHAT_SESSIONS = "chat-sessions",

  /**
   * Organization info documents. Single document is described in Organization -interface
   */
  ORGANIZATIONS = "organizations",

  /**
   * User's defined to system, but are not yet signed in themselves. Single document is described by PendingUserInfo
   */
  PENDING_USERS = "pending-users",

  /**
   * Map of user emails used to check existance of user based on email. This data can be only read form back end functions
   */
  USER_EMAILS = "user-emails",
  /**
   * Sub collection under bots listing specific bot's scripts
   */
  SCRIPTS = "scripts",

  /**
   * User info documents.
   *
   * At root levet this, whill list a documents with User -interface.
   * Under organization, this will list users with UserOrganizatioInfo -interface
   */
  USERS = "users"
}

/**
 * A single chat message
 */
export interface ChatMessage {
  /**
   * Unique id for the message
   */
  id?: string;
  /**
   * Text content
   */
  content: string;
  /**
   * User id is the user's anonymous session id or "santra", when the message is created by the bot
   */
  user: string;
  /**
   * Universal time stamp indicating the creation moment of the message
   */
  date: number;
}

/**
 * Single message pair between user and bot
 */
export interface ChatMessagePair {
  user: ChatMessage;
  bot: ChatMessage;
  buttonMessage?: boolean;
}

export interface ChatMessageResponse extends ChatMessagePair {
  user: ChatMessage;
  bot: ChatMessage;
  userVariables: Variable[];
}

export function newMessage(
  message: string,
  user: string,
  id: string,
  date: number
): ChatMessage {
  return {
    id: id || Math.random() * 1000000 + "_id",
    user,
    content: message,
    date
  };
}

export type UserId = string;

export type OrganizationId = string;

// dull pass by for problem with compiler: https://github.com/kulshekhar/ts-jest/issues/527
// export enum UserRole {
/**
 * User account is closed and user has no access to organization's data
 */
export const USERROLE_CLOSED = "c";
/**
 * Basic user rights to review chats
 */
export const USERROLE_USER = "u";
/**
 * Rights to review chats and modify aiml code
 */
export const USERROLE_DEVELOPER = "d";
/**
 * Full rights for a single organization. In addition to Developer role, admin can
 * grant other users an access to organization and generate embed code for chat.
 */
export const USERROLE_ADMIN = "a";
/**
 * Special role for creating new organizations
 */
export const USERROLE_SYSTEM_ADMIN = "s";

export interface ShortUserInfo {
  id?: UserId;
  displayName: string;
  email: string;
  photoURL: string;
}

export interface OrgPendingUserInfo {
  email: string;
  pending: true;
}

export interface WithUserRole {
  role: UserRole;
}

export interface WithUserId {
  id: UserId;
}

export interface ShortUserInfoWithRole extends WithUserRole {
  id: UserId;
  displayName: string;
  email: string;
  photoURL: string;
}
export interface ShortUserInfoRead extends ShortUserInfo {
  id: UserId;
}
/**
 *
 */
export interface PendingUserInfo {
  organizations?: {
    [organizationId: string]: UserRole;
  };
}

export interface UserOrganizations {
  [organizationId: string]: UserOrganizatioInfo;
}

export interface User extends ShortUserInfo {
  organizations?: UserOrganizations;
  systemAdmin?: true;
}

export interface UserRead extends ShortUserInfoRead {
  organizations: UserOrganizations;
  systemAdmin?: true;
}

export interface ChatSession {
  started: number | object;
  ended?: number;
}

export interface WithId {
  id: string;
}

export interface ChatSessionWithId extends ChatSession {
  id: string;
}

export enum UserRole {
  CLOSED = "c",
  ADMIN = "a",
  SYSTEM_ADMIN = "s",
  USER = "u",
  DISABLED = "d",
  PENDING = "p"
}

export interface UserOrganizatioInfo {
  /**
   * Name of the organization
   */
  name: string;
  role: UserRole;
  modified?: number;
  created?: number;
}

export interface UserVariables {
  [key: string]: string;
}

export interface StartChatSessionResponse {
  sessionToken: string;
  userVBariables: UserVariables;
}

export interface BotBrains {
  reply(userName: string, message: string): Promise<string>;
}
/**
 * Single script file defining a part of bot's brains
 */
export interface Script {
  name: string;
  data: string;
  modified?: number;
  created?: number;
}

export const USER_SUFFIX = "_u";
export const BOT_SUFFIX = "_b";

/**
 * Current version's all bots are named santra. This naming is used
 * to for future extendability.
 */
export const DEFAULT_BOT_NAME: string = "santra";

export interface ChatBubbleTheme {
  color: string;
  background: string;
  dateColor: string;
  fontFace?: string;
  margin?: number;
  padding?: number;
}

export const defaultChatConfiguration: ChatConfiguration = {
  user: {
    color: "black",
    background: "lightgreen",
    dateColor: "#333",
    margin: 8
  },
  bot: {
    color: "black",
    background: "lightblue",
    dateColor: "#333",
    margin: 8
  },
  headerBackground: "blue",
  headerPadding: 8,
  headerColor: "white",
  color: "black",
  background: "white",
  borderRadius: 4,
  bubbleBorderRadius: 4,
  boxShadow: "-10px 0 37px -2px rgba(0, 0, 0, 0.63)",
  margin: 4
};

/**
 * Configuration to set the look and feel for embedded chat
 */
export interface ChatConfiguration {
  user: ChatBubbleTheme;
  bot: ChatBubbleTheme;

  avatarUri?: string;

  headerBackground: string;
  headerPadding: number;
  headerColor: string;
  background: string;
  color: string;

  margin?: number;
  borderRadius?: number;
  bubbleBorderRadius?: number;

  /** Chat-ikkunan leveys pikseleinä */
  chatWindowWidth?: number;

  boxShadow?: string;

  /**
   * Orientation text visible on ready -state
   */
  orientationText?: string;

  headerText?: string;

  /**
   * Quide text shown on the top of chat-text
   */
  chatGuideText?: string;

  /**
   * Placeholder text for chat
   */
  chatInputPlaceHolder?: string;
}

/**
 * Descriprtor for a single bot. Organization can have multiple bots
 */
export interface Bot {
  name: string;
  configuration: ChatConfiguration;
  scripts: {
    [name: string]: Script;
  };
}

export interface Users {
  [UserId: string]: ShortUserInfo;
}
export interface Organization {
  id: OrganizationId;
  name: string;
  users?: Users;
  /**
   * Set of admin user's emails for an organization
   */
  admins?: {
    [email: string]: true;
  };
  /**
   * Set defining user roles in organization
   */
  roles?: {
    [uid: string]: UserRole;
  };
  bots?: {
    [botId: string]: Bot;
  };
}
export type SessionToken = string;

export interface Variable {
  key: string;
  value: string;
}

export interface SendMessageGraphQL {
  /**
   * Message content
   */
  message: string;
  /**
   * Unique session token to identify chat converstation
   */
  sessionToken: SessionToken;
  /**
   * Organization id
   */
  organizationId: OrganizationId;

  userVariables: Variable[];
}

export interface StartSessionResponse {
  sessionToken: SessionToken;
  userVariables: Variable[];
}

export interface StartSessionInfo {
  organizationId: OrganizationId;
}

export interface SucceedResponse {
  succeed: boolean;
  errorMessage?: string;
}

export interface DeleteChatSessionInfo {
  organizationId: OrganizationId;
  sessionId: string;
}

export interface EndSessionInfo {
  sessionToken: SessionToken;
  organizationId: OrganizationId;
}

export interface GraphQLLocation {
  line: number;
  column: number;
}

export enum SantraGraphQLErrorCode {
  /**
   * Unexpected exception on back end
   */
  INTERNAL_ERROR = 500,

  /**
   * No organization found with given id
   */
  ORGANIZATION_NOT_FOUND = 1000
}
export interface GraphQLError {
  errorCode?: SantraGraphQLErrorCode;
  message: string;
  locations?: GraphQLLocation[];
}

export interface GraphQLSucceedResponse<T> {
  data: T;
}

/**
 * Generic structure of GraphQL response
 *
 * @param T Data response type
 */
export interface GraphQLResponse<T> {
  data: T | null;
  errors?: GraphQLError;
}

export interface EchoMessage {
  message: string;
}
/**
 * GraphQL api interface for backend operations
 */
export interface SantraChatGraphQL {
  echo: (message: EchoMessage) => string;
  /**
   * Send a single message to bot.
   */
  sendMessage: (args: SendMessageGraphQL) => Promise<ChatMessageResponse>;

  startSession: (args: StartSessionInfo) => Promise<StartSessionResponse>;

  deleteChatSession: (args: DeleteChatSessionInfo) => Promise<SucceedResponse>;

  endSession: (args: EndSessionInfo) => boolean;
}

export type UserAdminOperation =
  | UserAdminAddOperation
  | UserAdminUpdateOperation
  | UserAdminDeleteOperation;

export interface UserAdminAddOperation {
  type: "add";
  userData: {
    email: string;
    role: UserRole;
  };
}

export interface UserAdminDeleteOperation {
  type: "delete";
  userData: {
    /** uid used with authenticated user */
    uid?: string;
    /** email used with pending user */
    email?: string;
  };
}

export interface UserAdminUpdateOperation {
  type: "update";
  userData: {
    /** uid used with authenticated user */
    uid?: string;
    /** email used with pending user */
    email?: string;
    role: UserRole;
  };
}

export interface UserAdminMessage {
  oid: OrganizationId;
  operations: UserAdminOperation[];
}

/**
 * Encode a name to qualified firestore field name. Lodash and all unsuported
 * characters will be coded to for _CHAR_CODE_.
 * @param name Field to be encoded
 */
export function encodeToFieldName(name: string): string {
  let result = "";
  for (const char of name) {
    if (char.match(/[0-9a-zA-Z]/i)) {
      result += char;
    } else {
      result += `_${char.charCodeAt(0)}_`;
    }
  }
  return result;
}
