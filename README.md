# Kelp: Your information filtration system

Kelp brings your data together in one place. Pivot your meetings by what documents the attendees have edited recently. By associating person, a time slot and documents together, Kelp makes information easier to find.

- https://chrome.google.com/webstore/devconsole/54522bcf-fc90-4948-a383-4e65c5514ba3/onkkkcfnlbkoialleldfbgodakajfpnl/edit?hl=en
- https://dashboard.render.com/web/srv-bv8ngnrlc6ck61fvgl8g

This aspires to do a few things with instant value:

- help you find what you need when you need it
- provide the ‘right information at the right time’
- be easy to understand (no 'black box' recommendation)

In the future it will also do things that are more 'vitamin' like

- Stay accountable to what you want to be doing
- Help separate from work
- Show information about relationships over time

## Getting started

First create a [Google Oauth] app and enable the APIs you want to use. Currently, those are

- [Google Drive API]
- [Google Calendar API]

Then proceed with your node setup steps. Ensure you are using node 14 or greater. Start the extension in dev mode:

    npm install
    npm run dev:extension

Starting the website in dev mode (if needed)

    npm run dev

[google oauth]: https://developers.google.com/identity/protocols/oauth2
[google drive api]: https://developers.google.com/drive
[google calendar api]: https://developers.google.com/calendar
[.env.local]: https://nextjs.org/docs/basic-features/environment-variables
