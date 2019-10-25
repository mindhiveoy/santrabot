import { SantraChatGraphQL } from '@shared/schema';
import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';

import deleteChatSession from './methods/deleteChatSession';
import sendMessage from './methods/sendMessage';
import startSession from './methods/startSession';

// Construct a schema, using GraphQL schema language
const graphQLSchema = buildSchema(
  `
    type Query {
      echo(message: String): String
    }

    input UserVariableInput {
      key: String!,
      value: String
    }

    type Mutation {

      sendMessage(
        message: String!,
        sessionToken: String!,
        organizationId: String!,
        userVariables: [UserVariableInput]
      ): ChatMessageResponse

      startSession(organizationId: String!): SessionInfo

      deleteChatSession(organizationId: String!, sessionId: String!): SucceedInfo

      echo(message: String!): String

      endSession(
        organizationId: String!,
        sessionToken: String!
      ): Boolean
    }

    type SucceedInfo {
      succeed: Boolean!
      errorMessage: String
    }

    type UserVariable {
      key: String!
      value: String
    }

    type SessionInfo {
      sessionToken: String,
      userVariables: [UserVariable]
    }

    type ChatMessagePair {
      user: ChatMessage!
      bot: ChatMessage!
    }

    type ChatMessageResponse {
      user: ChatMessage!
      bot: ChatMessage!
      userVariables: [UserVariable]
    }

    type ChatMessage {
      id: ID!
      content: String!
      user: String!
      date: Float!
    }
  `,
);

const root: SantraChatGraphQL = {
  echo: ({ message }) => {
    console.log(`graphql echo: ${message}`);
    return message;
  },
  sendMessage,
  startSession,
  deleteChatSession,
  endSession: ({ organizationId, sessionToken }) => {
    return true;
  },
};

const graphqlApi = graphqlHTTP({
  schema: graphQLSchema as any,
  rootValue: root,
  graphiql: process.env.NODE_ENV === 'development',
} as any);

export default graphqlApi;
