import { Response } from 'express';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import config from '../../../constants/config';

const options = {
  jwt: {
    secret: process.env.JWT_SECRET,
    encryption: true,
    signingKey: process.env.JWT_SIGNING_KEY,
    encryptionKey: process.env.JWT_ENCRYPTION_KEY,
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
      profile: (profile: any) => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }),
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    Providers.Slack({
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
    }),
  ],
};

export default (req: any, res: Response) => NextAuth(req, res, options);
