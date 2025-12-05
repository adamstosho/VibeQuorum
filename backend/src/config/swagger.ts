import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'VibeQuorum API',
    version: '1.0.0',
    description:
      'Backend API for VibeQuorum - A Web3 Q&A platform with AI assistance and on-chain token rewards',
    contact: {
      name: 'VibeQuorum Team',
    },
  },
  servers: [
    {
      url: process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL.replace('3000', '4000')}`
        : 'http://localhost:4000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      WalletAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-wallet-address',
        description: 'Wallet address for authentication',
      },
      SignatureAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-signature',
        description: 'Signature for request verification',
      },
      TimestampAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-timestamp',
        description: 'Timestamp for request verification',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'Error message',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          walletAddress: { type: 'string' },
          displayName: { type: 'string' },
          avatarUrl: { type: 'string' },
          profileBio: { type: 'string' },
          reputation: { type: 'number' },
          tokenBalanceCached: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Question: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          author: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['open', 'answered', 'closed'] },
          acceptedAnswerId: { type: 'string' },
          votesCount: { type: 'number' },
          answersCount: { type: 'number' },
          viewsCount: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Answer: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          questionId: { type: 'string' },
          author: { type: 'string' },
          content: { type: 'string' },
          upvotes: { type: 'number' },
          downvotes: { type: 'number' },
          aiGenerated: { type: 'boolean' },
          isAccepted: { type: 'boolean' },
          txHashes: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  security: [
    {
      WalletAuth: [],
      SignatureAuth: [],
      TimestampAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);



