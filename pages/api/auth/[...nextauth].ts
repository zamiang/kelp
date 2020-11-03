import { Response } from 'express';
import NextAuth from 'next-auth';
import config from '../../../constants/config';

const options = {
  pages: {
    signIn: '/auth/signin',
  },
  database: process.env.MONGO_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    encryption: true,
    signingKey: process.env.JWT_SIGNING_KEY,
    encryptionKey: process.env.JWT_ENCRYPTION_KEY,
  },
  callbacks: {
    session: async (session: any, user: any) =>
      Promise.resolve({ ...session, slackOauthToken: user.slackOauthToken }),
    jwt: async (token: any, _user: any, account: any) => {
      const result = { ...token };
      if (account && account.provider === 'slack') {
        result.slackOauthToken = account.accessToken;
      }
      return Promise.resolve(result);
    },
  },
  providers: [
    {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      version: '2.0',
      scope: config.GOOGLE_SCOPES.join(' '),
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
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
  ],
};

export default (req: any, res: Response) => NextAuth(req, res, options);
