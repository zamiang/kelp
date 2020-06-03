# Time [working title]

Time is our central organizing principal. If something matters, but you don’t spend any time on it. Does it really matter?

Imagine your all your chrome tabs, google docs, emails and notes spread across your desk. The most important thing to know about a document is whether it is in a tab, an email or a doc - not it's contents.

This aspires to do a few things with direct value:

- help you find what you need
- ‘right information right time’

In the future it will also do things that are more 'vitamin' like

- Stay accountable to what you want to be doing
- Help separate from work cleanly

## Open Source

I want this to be open source and free but with paid services on top. Simply put, a free version you can run in your browser that maintains no 'state' and a paid version that has secure database and is easily accessible across devices.

## Getting started

First create a [Google Oauth] app and enable the APIs you want to use. Currently, those are

- [Google Drive API]
- [GMail API]
- [Google Calendar API]
- [Google Drive Activity API]

Then proceed with your node setup steps. Ensure you are using node 14 or greater

    npm install
    touch secrets.json

Add your google oauth app's tokens to secrets.json

    {
      "client_id": "foo",
      "client_secret": "bar"
    }

When starting the app, in separate tabs run

    npm start
    npm run dev

[google oauth]: https://developers.google.com/identity/protocols/oauth2
[google drive api]: https://developers.google.com/drive
[gmail api]: https://developers.google.com/gmail/api
[google calendar api]: https://developers.google.com/calendar
[google drive activity api]: https://developers.google.com/drive/activity/v2
