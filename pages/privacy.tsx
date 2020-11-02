import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Footer from '../components/homepage/footer';
import LoginButton from '../components/homepage/login-button';
import config from '../constants/config';
import { useStyles } from './index';

const Terms = () => {
  const classes = useStyles();
  return (
    <div className={clsx(classes.root, classes.container)}>
      <Head>
        <title>Privacy Policy - Kelp</title>
        <meta name="description">
          Kelp does not own your data, nor do we sell it to others or use it for advertising. It’s
          your data, period.
        </meta>
      </Head>
      <style jsx global>{`
        html body {
          background-color: ${config.BLUE_BACKGROUND};
        }
      `}</style>
      <div className={classes.containerWidth}>
        <Grid container className={clsx(classes.hero, classes.heroNoMarginTop)} alignItems="center">
          <Grid item sm={7}>
            <Container maxWidth="sm">
              <div className={classes.loginButton}>
                <LoginButton />
              </div>
              <Link href="/">
                <Image alt="key" height={120} width={120} src="/icons/key-line.svg" />
              </Link>
              <Typography variant="h3" className={classes.heading}>
                Privacy Policy
              </Typography>
              <p id="1bad6135-8468-452b-932d-9f512d6cbdc9">
                Kelp does not own your data, nor do we sell it to others or use it for advertising.
                It’s your data, period.
              </p>
              <p id="175c5e55-fb44-4180-8772-a757f28f13e9">
                This policy applies to all information collected or submitted on Kelp’s website and
                any other devices and platforms.
              </p>
              <h1 id="b5b682cf-0692-42d0-bde1-9d55882b101c">
                <strong>Information we collect</strong>
              </h1>
              <p id="c549f30c-5e94-4571-8959-45ac04d93553">
                When creating an account, you will be asked to Sign in with Auth0. Email addresses
                are <strong>only</strong> used for logging in, password resets, responding to emails
                that you initiate, notifications that you request and notifying you about product
                updates or changes.
              </p>
              <p id="d3ea54f1-2b64-4bb5-8ec6-258f2f92177d">
                After account creation, you will be asked to connect external accounts like email,
                calendar and contacts. These integrations are optional. Each integration has special
                protections to ensure Kelp only uses data that is necessary for the product, and
                that sensitive fields are protected.
              </p>
              <h1 id="01bd148c-b374-4295-9bb8-208d2459ad12">
                <strong>Calendar</strong>
              </h1>
              <p id="ef4e0c22-d3f4-4d6f-a0a2-b8b9d50f2d99">
                <strong>What does Kelp do with my calendar?</strong>
              </p>
              <p id="09b745da-affa-46ee-8292-d39436c1b33b">
                Connected calendars are <strong>only</strong> used to create contacts and show your
                meeting history.
              </p>
              <p id="ae3782c6-a69b-4734-989b-183ed8cb3187">
                <strong>How do you protect my privacy?</strong>
              </p>
              <ul id="b0e2be77-3dce-4208-aa1e-1e1a4dba7de1">
                <li>
                  Kelp asks for the most restricted access that Google allows, which is read-only.
                  Kelp cannot create new events, change any existing events, delete your calendar,
                  or access any other data within your Google account, including Gmail.
                </li>
                <li>
                  Calendar data does not pass through Kelp. Your device requests the data directly
                  from Google.
                </li>
                <li>
                  You can revoke access to your calendar at any time at{' '}
                  <a href="https://myaccount.google.com/permissions">
                    https://myaccount.google.com/permissions
                  </a>
                </li>
              </ul>
              <h1 id="c2551862-e727-47b8-a878-ccc96523fcc2">
                <strong>Contacts</strong>
              </h1>
              <p id="15872062-ecc0-4221-bf64-5a3c4f537e0f">
                <strong>What does Kelp do with my contacts?</strong>
              </p>
              <p id="0d6975f5-495c-4755-8784-320b88e3955a">
                Connected contacts are <strong>only</strong> used to display names and photos from
                contacts from your calendar events and documents.
              </p>
              <p id="09b5bca9-a374-47ed-8483-cf7d6e7fa551">
                <strong>How do you protect my privacy?</strong>
              </p>
              <ul id="45abd295-c77e-421a-a8ec-26ed8c0f4cdb">
                <li>
                  Kelp asks for the most restricted access that Google allows, which is read-only.
                  Kelp cannot create new contacts, change any existing contacts, delete your
                  contacts, or access any other data within your Google account, including Gmail.
                </li>
                <li>
                  Optioanlly, you can enable write access to contacts which Kelp uses to allow you
                  to edit your contact notes from Kelp. Kelp does not edit any other contact related
                  data.
                </li>
                <li>
                  Contacts data does not pass through Kelp. Your device requests the data directly
                  from Google.
                </li>
                <li>
                  You can revoke access to your contacts at any time at{' '}
                  <a href="https://myaccount.google.com/permissions">
                    https://myaccount.google.com/permissions
                  </a>
                </li>
              </ul>
              <h1 id="7f19518d-04b6-457a-98fe-7049fb370236">Documents</h1>
              <p id="21ab180a-481a-474f-bd00-bede3cfa5f0c">
                <strong>What does Kelp do with my documents?</strong>
              </p>
              <p id="a3c5643a-84ff-492a-8d05-692d5c8c294e">
                Documents are <strong>only</strong> used to display them with associated upcoming
                meetings.
              </p>
              <p id="206c1cc7-788c-41d3-9474-f6df6ea8b407">
                <strong>How do you protect my privacy?</strong>
              </p>
              <ul id="9cbf1b19-4699-4995-9412-3939029cb0cf">
                <li>
                  Kelp asks for the most restricted access that Google allows, which is read-only.
                  Kelp cannot create new documents, change any existing documents, delete your
                  documents, or access any other data within your Google account, including Gmail.
                </li>
                <li>
                  Documents data does not pass through Kelp. Your device requests the data directly
                  from Google.
                </li>
                <li>
                  You can revoke access to your documents at any time at{' '}
                  <a href="https://myaccount.google.com/permissions">
                    https://myaccount.google.com/permissions
                  </a>
                </li>
              </ul>
              <h1 id="d886474f-e8b8-4e94-b279-cfe945e16baf">
                <strong>Technical basics</strong>
              </h1>
              <p id="6c786247-64ea-4614-9efd-dfae890576fe">
                If you enable notifications, we must store a token to send them. We{' '}
                <strong>never</strong> use notifications for marketing.
              </p>
              <p id="195f56fa-033c-494c-8bd9-c325b309e456">
                We use cookies on the site to keep you logged in. Our server software may also store
                basic technical information, such as your IP address, in temporary memory or logs.
              </p>
              <p id="8f45e739-b057-4e75-939c-d683894dd797">
                For performance and overload protection, we direct your traffic through Vercel. They
                have access to some basic technical information to perform this role, such as your
                IP address.{' '}
                <a href="https://vercel.com/legal/privacy-policy">Vercel&#x27;s Privacy Policy.</a>
              </p>
              <h1 id="874e477a-d0cd-4ad9-ad1d-9085a3560063">Registration and authentication</h1>
              <p id="bc4e2c32-bc8f-4edb-950c-9fe93c52554f">
                Third parties may provide registration and authentication services. In this case,
                they will be able to access some data, stored by these third-party services, for
                registration or identification purposes. The services listed below may also collect
                Personal Data for targeting and profiling purposes; to find out more, please refer
                to the description of each service.
              </p>
              <p id="d37abe70-0c94-413a-b48b-e9daa6925b6a">
                <strong>Google OAuth (Google LLC)</strong>
              </p>
              <p id="a8aa06a4-f296-4461-a4c4-82db4b328e6c">
                Google OAuth is a registration and authentication service provided by Google LLC and
                is connected to the Google network. Personal Data processed: various types of Data
                as specified in the privacy policy of the service.
              </p>
              <p>
                Place of processing: United States –{' '}
                <a href="https://policies.google.com/privacy">Privacy Policy</a>. Privacy Shield
                participant.
              </p>
              <p id="d9869bc8-c2dd-4f17-86d5-cce71738bd4e">
                <strong>Auth0 (Auth0, Inc)</strong>
              </p>
              <p id="2b0333d9-d95c-4efe-aa47-3088e1548dce">
                Auth0 is a registration and authentication service provided by Auth0, Inc. To
                simplify the registration and authentication process, Auth0 can make use of
                third-party identity providers and save the information on its platform. Personal
                Data processed: Cookies; email address; first name; last name; password; picture;
                various types of Data as specified in the privacy policy of the service.
              </p>
              <p>
                Place of processing: United States –{' '}
                <a href="https://auth0.com/privacy">Privacy Policy</a>. Privacy Shield participant.
              </p>
              <h1 id="f69625a1-ef0e-40cb-af26-74a4b3db82d6">Email Marketing</h1>
              <p id="c0ed4c51-ef08-4fd1-82d3-8f38095094ca">
                We may to contact you with product updates. You may opt-out of receiving any, or
                all, of these communications from Kelp by following the unsubscribe link or
                instructions provided in any email we send or by contacting us. We may use Email
                Marketing Service Providers to manage and send emails to you.
              </p>
              <p id="47fe45d0-c532-4a9b-9407-bce45855cd3f">
                <strong>Flodesk</strong> (Flodesk Inc)
              </p>
              <p id="ab868a21-4ef7-4821-86dc-c4441ff6d243">
                <a href="https://help.flodesk.com/en/articles/3186402-flodesk-terms-of-service">
                  Privacy Policy
                </a>
              </p>
              <h2 id="df0204d4-a810-457c-b59c-b77aa5fc00e5">Payments</h2>
              <p id="f4b8401e-30f6-4ba3-aba7-ed358b3ff0a3">
                We may provide paid products within Kelp. In that case, we may use third-party
                services for payment processing (e.g. payment processors).
              </p>
              <p id="d2250a4c-b192-4203-877a-2996e270c143">
                We will not store or collect your payment card details. That information is provided
                directly to our third-party payment processors whose use of your personal
                information is governed by their Privacy Policy. These payment processors adhere to
                the standards set by PCI-DSS as managed by the PCI Security Standards Council, which
                is a joint effort of brands like Visa, Mastercard, American Express and Discover.
                PCI-DSS requirements help ensure the secure handling of payment information.
              </p>
              <p id="7f328583-f1a8-464e-8bb0-3b6e6670d547">
                <strong>Stripe</strong>
              </p>
              <p id="9db05fda-9420-460f-b379-d4823e5a48af">
                <a href="https://stripe.com/us/privacy">Privacy Policy</a>
              </p>
              <h1 id="fcd1c65f-76f7-4611-a7dd-965c8d872e4f">
                <strong>Ads and analytics</strong>
              </h1>
              <p id="abe6ab68-85ae-45b5-9d8d-af53fc51e150">
                The Kelp web apps collect various usage metrics, such as the percentage of users who
                use particular features or when users sign in,
                <strong>for the sole purpose</strong> of improving the app.
              </p>
              <h1 id="0fc13a51-23f6-4270-a678-50615bd94b64">
                <strong>Information usage</strong>
              </h1>
              <p id="8a00172b-1f81-4809-b6be-bbd1f974e784">
                We use the information we collect to operate and improve our website, apps, and
                customer support.
              </p>
              <p id="e529f888-2741-4efd-bfcd-e5e914ba2b15">
                We do not share personal information with outside parties except to the extent
                necessary to accomplish Kelp’s functionality.
              </p>
              <p id="d7528e36-63e5-48b7-936c-6ab6f6fe689e">
                We may disclose your information in response to subpoenas, court orders, or other
                legal requirements; to exercise our legal rights or defend against legal claims; to
                investigate, prevent, or take action regarding illegal activities, suspected fraud
                or abuse, violations of our policies; or to protect our rights and property.
              </p>
              <p id="f5afc65e-d5d1-47be-a3dd-44ed47be109d">
                In the future, we may sell to, buy, merge with, or partner with other businesses. In
                such transactions, user information may be among the transferred assets.
              </p>
              <h1 id="eda19e62-5c24-484d-aa5e-5ae445f8b010">
                <strong>Information isolation</strong>
              </h1>
              <p id="e6c29dd6-3050-43b5-bb4e-394883f3b910">
                Contact information (i.e. an email address) is <strong>only</strong> accessible to a
                user who explicitly added that information, either via one of the above integrations
                or manually. This information isolation is reinforced with software safeguards to
                ensure contact information has appropriate visibility.
              </p>
              <h1 id="b3f3c10d-3b54-4189-bea8-51ca899c50e7">
                <strong>Security Vulnerability Disclosure</strong>
              </h1>
              <p id="9b935272-c9b1-4a9d-9567-064135514702">
                If you believe you have discovered a security or privacy vulnerability that affects
                Kelp’s software, please report it to us. We welcome reports from everyone, including
                security researchers, developers, and customers.
              </p>
              <p id="e7f2691f-4747-4daf-9daf-ad397de219ef">
                You can report a security or privacy vulnerability:
              </p>
              <ul id="d2f61506-d94d-4672-9c1b-26294ef29e1e">
                <li>
                  Email us at <a href="mailto:security@kelp.nyc">security@kelp.nyc</a>
                </li>
              </ul>
              <p id="1514f8e0-db44-43b6-a742-7f4b7d99e049">In your message, please include:</p>
              <ul id="1baaa435-7ef2-4162-92c6-a5e87b5de52f">
                <li>The specific product and software version(s) which you believe are affected</li>
                <li>
                  A description of the behavior you observed as well as the behavior that you
                  expected
                </li>
                <li>
                  A numbered list of steps required to reproduce the issue and a video
                  demonstration, if the steps may be hard to follow
                </li>
              </ul>
              <p id="de721faa-d496-45af-80fa-4e4ce3ae727b">
                You’ll receive a reply from us to acknowledge that we received your report, and
                we’ll contact you if we need more information.
              </p>
              <p id="042e72c2-3eb0-4a15-a597-ce571ac5ef43">
                For the protection of our members, Kelp doesn’t disclose, discuss, or confirm
                security issues until our investigation is complete and any necessary updates are
                generally available.
              </p>
              <h1 id="e0c09afd-b7d0-4625-9a4e-62972cc898af">
                <strong>Accessing, changing, or deleting information</strong>
              </h1>
              <p id="056e16f1-72ac-48be-812b-39b5f11a7a50">
                You may access or change your information or delete your account by emailing
                <a href="mailto:support@kelp.nyc">support@kelp.nyc</a>.
              </p>
              <p id="600357df-16ba-46fd-b4e5-6fe855298c5f">
                Kelp may delete your information at any time and for any reason, such as technical
                needs, legal concerns, abuse prevention, removal of idle accounts, data loss, or any
                other reason.
              </p>
              <h1 id="0141dfc4-f540-44b0-9e97-1019ab7b4404">
                <strong>Third-party links and content</strong>
              </h1>
              <p id="d1611218-4ef7-46b3-81ed-e7f16524fa13">
                Kelp displays content from third-party social sites and APIs. These have their own
                independent privacy policies, and we have no responsibility or liability for their
                content or activities.
              </p>
              <h1 id="daa04e5a-3574-48e2-a3f6-d255c58a44c1">
                <strong>California Online Privacy Protection Act Compliance</strong>
              </h1>
              <p id="a45ff7b0-a478-498a-9594-7f17ca94724a">
                We comply with the California Online Privacy Protection Act. We therefore will not
                distribute your personal information to outside parties without your consent.
              </p>
              <h1 id="d755d216-50e2-412d-b36a-923fcaaba76d">
                <strong>Children’s Online Privacy Protection Act Compliance</strong>
              </h1>
              <p id="245f989e-9972-4ff4-b207-d4e295520df4">
                We never collect or maintain information at our website from those we actually know
                are under 13, and no part of our website is structured to attract anyone under 13.
              </p>
              <h1 id="0fd7430b-dcb8-4a65-a2dd-e315529499db">
                <strong>Information for European Union Customers</strong>
              </h1>
              <p id="63309640-4427-4a27-b83f-87e039c4caaa">
                By using Kelp and providing your information, you authorize us to collect, use, and
                store your information outside of the European Union.
              </p>
              <h1 id="631d6c68-f828-4444-9ab1-7db47f36f241">
                <strong>International Transfers of Information</strong>
              </h1>
              <p id="46af72ee-a037-4d27-9b36-d77257a5225a">
                Information may be processed, stored, and used outside of the country in which you
                are located. Data privacy laws vary across jurisdictions, and different laws may be
                applicable to your data depending on where it is processed, stored, or used.
              </p>
              <h1 id="2616777b-303a-40c1-b0ef-62845040b17d">
                <strong>Your Consent</strong>
              </h1>
              <p id="5823bba9-df2f-4199-90c3-113955076c2b">
                By using our site, you consent to our privacy policy.
              </p>
              <h1 id="be5afb20-3d37-4a14-af63-69f56b1110dc">
                <strong>Changes to this policy</strong>
              </h1>
              <p id="c1fa4772-2575-42ed-ae31-b18536848782">
                If we decide to change our privacy policy, we will post those changes on this page.
                Summary of changes so far:
              </p>
              <ul id="464a1252-24fc-4da2-b1f2-0297ea1214a2">
                <li>
                  November<strong> 2, 2020:</strong> Add ability to optionally edit Google Contact
                  notes from Kelp.
                </li>
                <li>
                  October<strong> 11, 2020:</strong> First published.
                </li>
              </ul>
              <h1 id="81987b8c-86ff-47af-8b01-a7bfbe08eb9c">
                <strong>Questions or Concerns</strong>
              </h1>
              <p id="60849061-52e9-4e86-bed3-85020714d06f">
                If you have questions or concerns regarding these terms, privacy, or security,
                please contact us at <a href="mailto:support@kelp.nyc">support@kelp.nyc.</a>
              </p>
              <Footer shouldAlignLeft={true} />
            </Container>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Terms;
