import { Response } from 'express';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import PostgressConnectionStringParser from 'pg-connection-string';
import config from '../../../constants/config';

const connectionOptions = PostgressConnectionStringParser.parse(process.env.DATABASE_URL!);

const options = {
  pages: {
    signIn: '/auth/signin',
  },
  database: {
    type: 'postgres',
    host: connectionOptions.host,
    port: connectionOptions.port,
    username: connectionOptions.user,
    password: connectionOptions.password,
    database: connectionOptions.database,
    ssl: Boolean(process.env.SSL_ENABLED),
    extra: process.env.SSL_ENABLED
      ? {
          ssl: { rejectUnauthorized: false },
        }
      : null,
  },
  session: {
    jwt: true,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    encryption: true,
    signingKey: process.env.JWT_SIGNING_KEY,
    encryptionKey: process.env.JWT_ENCRYPTION_KEY,
  },
  /*
  callbacks: {
    session: async (session: any, user: any) =>
      Promise.resolve({
        ...session,
        slackOauthToken: user.slackOauthToken,
        googleOauthToken: user.googleOauthToken,
      }),
    jwt: async (token: any, user: any, account: any) => {
      const isSignIn = user ? true : false;
      console.log(user, token);
      // https://github.com/nextauthjs/next-auth/issues/625
      if (isSignIn) {
        token.user = { id: user.id };
      }
      if (account && account.provider === 'slack') {
        token.slackOauthToken = account.accessToken;
      }
      if (account && account.provider === 'google') {
        token.googleOauthToken = account.accessToken;
      }
      // Add auth_time to token on signin in
      if (isSignIn) {
        token.auth_time = Math.floor(Date.now() / 1000);
      }
      return Promise.resolve(token);
    },
  },
  */
  providers: [
    Providers.Google({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scope: config.GOOGLE_SCOPES.join(' '),
      state: false,
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code',
    }),
    /*

    {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      version: '2.0',
      params: { grant_type: 'authorization_code' },
      accessTokenUrl: 'https://accounts.google.com/o/oauth2/token',
      requestTokenUrl: 'https://accounts.google.com/o/oauth2/auth',
      authorizationUrl: 'https://accounts.google.com/o/oauth2/auth?response_type=code',
      profileUrl: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
      profile: (profile: any) => {
        const user = {
          id: profile.id,
          email: profile.email,
          image: profile.picture,
        } as any;
        if (profile.name) {
          user.name = profile.name;
        }
        return user;
      },
      state: false,
    },
    {
      id: 'slack',
      name: 'Slack',
      type: 'oauth',
      version: '2.0',
      scope: 'channels:history channels:read groups:history groups:read',
      params: { grant_type: 'authorization_code' },
      accessTokenUrl: 'https://slack.com/api/oauth.access',
      authorizationUrl: 'https://slack.com/oauth/authorize?response_type=code',
      profileUrl: 'https://slack.com/api/users.identity',
      profile: (profile: any) => {
        const { user } = profile;
        return {
          id: user.id,
          name: user.name,
          image: user.image_512,
          email: user.email,
        };
      },
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
    },
    */
  ],
};

export default (req: any, res: Response) => NextAuth(req, res, options as any);
