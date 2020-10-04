# Kelp: Your information filtration system

Kelp brings your data together in one place. Pivot your meetings by what documents the attendees have edited recently. By associating person, a time slot and documents together, Kelp infers associations between information, making the information easier to find. Prepare for your next meeting in a flash!

This aspires to do a few things with instant value:

- help you find what you need when you need it
- provide the ‘right information at the right time’
- be easy to understand (no 'black box' recommendation)

In the future it will also do things that are more 'vitamin' like

- Stay accountable to what you want to be doing
- Help separate from work
- Show information about relationships over time

## Open Source

I want this to be open source and free but with paid services on top. Simply put, a free version you can run in your browser that maintains no 'state' and a paid version that has secure database and is easily accessible across devices.

## Getting started

First create a [Google Oauth] app and enable the APIs you want to use. Currently, those are

- [Google Drive API]
- [GMail API]
- [Google Calendar API]
- [Google Drive Activity API]

Second, create an [Auth0] single page React app via the Auth0 console.

Then proceed with your node setup steps. Ensure you are using node 14 or greater

    npm install

Add your google oauth app and Auth0 tokens to [.env.local]

    NEXT_PUBLIC_AUTH0_DOMAIN=foo.us.auth0.com
    NEXT_PUBLIC_AUTH0_CLIENT_ID=foo
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=foo-bar-baz.apps.googleusercontent.com
    (optional if not at localhost:3000) NEXT_PUBLIC_AUTH0_REDIRECT_URI=http://localhost:8080/dashboard

When starting the app in development mode

    npm run dev

[google oauth]: https://developers.google.com/identity/protocols/oauth2
[google drive api]: https://developers.google.com/drive
[gmail api]: https://developers.google.com/gmail/api
[google calendar api]: https://developers.google.com/calendar
[google drive activity api]: https://developers.google.com/drive/activity/v2
[.env.local]: https://nextjs.org/docs/basic-features/environment-variables
[auth0]: https://auth0.com/docs/quickstart/spa/react
