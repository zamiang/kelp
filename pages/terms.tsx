import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import Head from 'next/head';
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
        <title>Terms And Conditions - Kelp</title>
        <meta
          name="description"
          content="Please read these terms and conditions carefully before using Our Service."
        />
      </Head>
      <style jsx global>{`
        html body {
          background-color: ${config.BLUE_BACKGROUND};
        }
      `}</style>
      <div className={classes.containerWidth}>
        <Grid container className={clsx(classes.hero, classes.heroNoMarginTop)} alignItems="center">
          <Grid item sm={7}>
            <Container maxWidth="md">
              <div className={classes.loginButton}>
                <LoginButton />
              </div>
              <Link href="/">
                <img alt="Kelp logo" style={{ maxWidth: 120, marginLeft: -32 }} src="kelp.svg" />
              </Link>
              <Typography variant="h3" className={classes.heading}>
                Terms And Conditions
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Last updated: October 02, 2020
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Please read these terms and conditions carefully before using Our Service.
              </Typography>
              <h1>Interpretation and Definitions</h1>
              <h2>Interpretation</h2>
              <Typography variant="h6" className={classes.body}>
                The words of which the initial letter is capitalized have meanings defined under the
                following conditions. The following definitions shall have the same meaning
                regardless of whether they appear in singular or in plural.
              </Typography>
              <h2>Definitions</h2>
              <Typography variant="h6" className={classes.body}>
                For the purposes of these Terms and Conditions:
              </Typography>
              <ul>
                <li>
                  <Typography variant="h6" className={classes.body}>
                    <strong>Application</strong> means the software program provided by the Company
                    downloaded by You on any electronic device, named Kelp
                  </Typography>
                </li>
                <li>
                  <Typography variant="h6" className={classes.body}>
                    <strong>Application Store</strong> means the digital distribution service
                    operated and developed by Apple Inc. (Apple App Store) or Google Inc. (Google
                    Play Store) in which the Application has been downloaded.
                  </Typography>
                </li>
                <li>
                  <Typography variant="h6" className={classes.body}>
                    <strong>Affiliate</strong> means an entity that controls, is controlled by or is
                    under common control with a party, where &quot;control&quot; means ownership of
                    50% or more of the shares, equity interest or other securities entitled to vote
                    for election of directors or other managing authority.
                  </Typography>
                </li>
                <li>
                  <Typography variant="h6" className={classes.body}>
                    <strong>Country</strong> refers to: New York, United States
                  </Typography>
                </li>
                <li>
                  <Typography variant="h6" className={classes.body}>
                    <strong>Company</strong> (referred to as either &quot;the Company&quot;,
                    &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Agreement) refers to
                    Kelp.
                  </Typography>
                </li>
                <li>
                  <Typography variant="h6" className={classes.body}>
                    <strong>Device</strong> means any device that can access the Service such as a
                    computer, a cellphone or a digital tablet.
                  </Typography>
                </li>
                <li>
                  <Typography variant="h6" className={classes.body}>
                    <strong>Feedback</strong> means feedback, innovations or suggestions sent by You
                    regarding the attributes, performance or features of our Service.
                  </Typography>
                </li>
                <li>
                  <Typography variant="h6" className={classes.body}>
                    <strong>Free Trial</strong> refers to a limited period of time that may be free
                    when purchasing a Subscription.
                  </Typography>
                </li>
                <li>
                  <Typography variant="h6" className={classes.body}>
                    <strong>Service</strong> refers to the Application or the Website or both.
                  </Typography>
                </li>
                <li>
                  <Typography variant="h6" className={classes.body}>
                    <strong>Subscriptions</strong> refer to the services or access to the Service
                    offered on a subscription basis by the Company to You.
                  </Typography>
                </li>
                <li>
                  <Typography variant="h6" className={classes.body}>
                    <strong>Terms and Conditions</strong> (also referred as &quot;Terms&quot;) mean
                    these Terms and Conditions that form the entire agreement between You and the
                    Company regarding the use of the Service.
                  </Typography>
                </li>
                <li>
                  <Typography variant="h6" className={classes.body}>
                    <strong>Third-party Social Media Service</strong> means any services or content
                    (including data, information, products or services) provided by a third-party
                    that may be displayed, included or made available by the Service.
                  </Typography>
                </li>
                <li>
                  <Typography variant="h6" className={classes.body}>
                    <strong>Website</strong> refers to Kelp, accessible from{' '}
                    <a
                      href="https://www.kelp.nyc"
                      rel="external nofollow noopener noreferrer"
                      target="_blank"
                    >
                      https://www.kelp.nyc
                    </a>
                  </Typography>
                </li>
                <li>
                  <Typography variant="h6" className={classes.body}>
                    <strong>You</strong> means the individual accessing or using the Service, or the
                    company, or other legal entity on behalf of which such individual is accessing
                    or using the Service, as applicable.
                  </Typography>
                </li>
              </ul>
              <h1>Acknowledgment</h1>
              <Typography variant="h6" className={classes.body}>
                These are the Terms and Conditions governing the use of this Service and the
                agreement that operates between You and the Company. These Terms and Conditions set
                out the rights and obligations of all users regarding the use of the Service.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Your access to and use of the Service is conditioned on Your acceptance of and
                compliance with these Terms and Conditions. These Terms and Conditions apply to all
                visitors, users and others who access or use the Service.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                By accessing or using the Service You agree to be bound by these Terms and
                Conditions. If You disagree with any part of these Terms and Conditions then You may
                not access the Service.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                You represent that you are over the age of 18. The Company does not permit those
                under 18 to use the Service.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Your access to and use of the Service is also conditioned on Your acceptance of and
                compliance with the Privacy Policy of the Company. Our Privacy Policy describes Our
                policies and procedures on the collection, use and disclosure of Your personal
                information when You use the Application or the Website and tells You about Your
                privacy rights and how the law protects You. Please read Our Privacy Policy
                carefully before using Our Service.
              </Typography>
              <h1>Subscriptions</h1>
              <h2>Subscription period</h2>
              <Typography variant="h6" className={classes.body}>
                The Service or some parts of the Service are available only with a paid
                Subscription. You will be billed in advance on a recurring and periodic basis (such
                as daily, weekly, monthly or annually), depending on the type of Subscription plan
                you select when purchasing the Subscription.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                At the end of each period, Your Subscription will automatically renew under the
                exact same conditions unless You cancel it or the Company cancels it.
              </Typography>
              <h2>Subscription cancellations</h2>
              <Typography variant="h6" className={classes.body}>
                You may cancel Your Subscription renewal either through Your Account settings page
                or by contacting the Company. You will not receive a refund for the fees You already
                paid for Your current Subscription period and You will be able to access the Service
                until the end of Your current Subscription period.
              </Typography>
              <h2>Billing</h2>
              <Typography variant="h6" className={classes.body}>
                You shall provide the Company with accurate and complete billing information
                including full name, address, state, zip code, telephone number, and a valid payment
                method information.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Should automatic billing fail to occur for any reason, the Company will issue an
                electronic invoice indicating that you must proceed manually, within a certain
                deadline date, with the full payment corresponding to the billing period as
                indicated on the invoice.
              </Typography>
              <h2>Fee Changes</h2>
              <Typography variant="h6" className={classes.body}>
                The Company, in its sole discretion and at any time, may modify the Subscription
                fees. Any Subscription fee change will become effective at the end of the
                then-current Subscription period.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                The Company will provide You with reasonable prior notice of any change in
                Subscription fees to give You an opportunity to terminate Your Subscription before
                such change becomes effective.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Your continued use of the Service after the Subscription fee change comes into
                effect constitutes Your agreement to pay the modified Subscription fee amount.
              </Typography>
              <h2>Refunds</h2>
              <Typography variant="h6" className={classes.body}>
                Except when required by law, paid Subscription fees are non-refundable.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Certain refund requests for Subscriptions may be considered by the Company on a
                case-by-case basis and granted at the sole discretion of the Company.
              </Typography>
              <h2>Free Trial</h2>
              <Typography variant="h6" className={classes.body}>
                The Company may, at its sole discretion, offer a Subscription with a Free trial for
                a limited period of time.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                You may be required to enter Your billing information in order to sign up for the
                Free trial.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                If You do enter Your billing information when signing up for a Free Trial, You will
                not be charged by the Company until the Free trial has expired. On the last day of
                the Free Trial period, unless You cancelled Your Subscription, You will be
                automatically charged the applicable Subscription fees for the type of Subscription
                You have selected.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                At any time and without notice, the Company reserves the right to (i) modify the
                terms and conditions of the Free Trial offer, or (ii) cancel such Free trial offer.
              </Typography>
              <h1>Intellectual Property</h1>
              <Typography variant="h6" className={classes.body}>
                The Service and its original content (excluding Content provided by You or other
                users), features and functionality are and will remain the exclusive property of the
                Company and its licensors.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                The Service is protected by copyright, trademark, and other laws of both the Country
                and foreign countries.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Our trademarks and trade dress may not be used in connection with any product or
                service without the prior written consent of the Company.
              </Typography>
              <h1>Your Feedback to Us</h1>
              <Typography variant="h6" className={classes.body}>
                You assign all rights, title and interest in any Feedback You provide the Company.
                If for any reason such assignment is ineffective, You agree to grant the Company a
                non-exclusive, perpetual, irrevocable, royalty free, worldwide right and license to
                use, reproduce, disclose, sub-license, distribute, modify and exploit such Feedback
                without restriction.
              </Typography>
              <h1>Links to Other Websites</h1>
              <Typography variant="h6" className={classes.body}>
                Our Service may contain links to third-party web sites or services that are not
                owned or controlled by the Company.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                The Company has no control over, and assumes no responsibility for, the content,
                privacy policies, or practices of any third party web sites or services. You further
                acknowledge and agree that the Company shall not be responsible or liable, directly
                or indirectly, for any damage or loss caused or alleged to be caused by or in
                connection with the use of or reliance on any such content, goods or services
                available on or through any such web sites or services.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                We strongly advise You to read the terms and conditions and privacy policies of any
                third-party web sites or services that You visit.
              </Typography>
              <h1>Termination</h1>
              <Typography variant="h6" className={classes.body}>
                We may terminate or suspend Your access immediately, without prior notice or
                liability, for any reason whatsoever, including without limitation if You breach
                these Terms and Conditions.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Upon termination, Your right to use the Service will cease immediately.
              </Typography>
              <h1>Limitation of Liability</h1>
              <Typography variant="h6" className={classes.body}>
                Notwithstanding any damages that You might incur, the entire liability of the
                Company and any of its suppliers under any provision of this Terms and Your
                exclusive remedy for all of the foregoing shall be limited to the amount actually
                paid by You through the Service or 100 USD if You haven&apos;t purchased anything
                through the Service.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                To the maximum extent permitted by applicable law, in no event shall the Company or
                its suppliers be liable for any special, incidental, indirect, or consequential
                damages whatsoever (including, but not limited to, damages for loss of profits, loss
                of data or other information, for business interruption, for personal injury, loss
                of privacy arising out of or in any way related to the use of or inability to use
                the Service, third-party software and/or third-party hardware used with the Service,
                or otherwise in connection with any provision of this Terms), even if the Company or
                any supplier has been advised of the possibility of such damages and even if the
                remedy fails of its essential purpose.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Some states do not allow the exclusion of implied warranties or limitation of
                liability for incidental or consequential damages, which means that some of the
                above limitations may not apply. In these states, each party&apos;s liability will
                be limited to the greatest extent permitted by law.
              </Typography>
              <h1>&quot;AS IS&quot; and &quot;AS AVAILABLE&quot; Disclaimer</h1>
              <Typography variant="h6" className={classes.body}>
                The Service is provided to You &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; and
                with all faults and defects without warranty of any kind. To the maximum extent
                permitted under applicable law, the Company, on its own behalf and on behalf of its
                Affiliates and its and their respective licensors and service providers, expressly
                disclaims all warranties, whether express, implied, statutory or otherwise, with
                respect to the Service, including all implied warranties of merchantability, fitness
                for a particular purpose, title and non-infringement, and warranties that may arise
                out of course of dealing, course of performance, usage or trade practice. Without
                limitation to the foregoing, the Company provides no warranty or undertaking, and
                makes no representation of any kind that the Service will meet Your requirements,
                achieve any intended results, be compatible or work with any other software,
                applications, systems or services, operate without interruption, meet any
                performance or reliability standards or be error free or that any errors or defects
                can or will be corrected.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Without limiting the foregoing, neither the Company nor any of the company&apos;s
                provider makes any representation or warranty of any kind, express or implied: (i)
                as to the operation or availability of the Service, or the information, content, and
                materials or products included thereon; (ii) that the Service will be uninterrupted
                or error-free; (iii) as to the accuracy, reliability, or currency of any information
                or content provided through the Service; or (iv) that the Service, its servers, the
                content, or e-mails sent from or on behalf of the Company are free of viruses,
                scripts, trojan horses, worms, malware, timebombs or other harmful components.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Some jurisdictions do not allow the exclusion of certain types of warranties or
                limitations on applicable statutory rights of a consumer, so some or all of the
                above exclusions and limitations may not apply to You. But in such a case the
                exclusions and limitations set forth in this section shall be applied to the
                greatest extent enforceable under applicable law.
              </Typography>
              <h1>Governing Law</h1>
              <Typography variant="h6" className={classes.body}>
                The laws of the Country, excluding its conflicts of law rules, shall govern this
                Terms and Your use of the Service. Your use of the Application may also be subject
                to other local, state, national, or international laws.
              </Typography>
              <h1>Disputes Resolution</h1>
              <Typography variant="h6" className={classes.body}>
                If You have any concern or dispute about the Service, You agree to first try to
                resolve the dispute informally by contacting the Company.
              </Typography>
              <h1>For European Union (EU) Users</h1>
              <Typography variant="h6" className={classes.body}>
                If You are a European Union consumer, you will benefit from any mandatory provisions
                of the law of the country in which you are resident in.
              </Typography>
              <h1>United States Federal Government End Use Provisions</h1>
              <Typography variant="h6" className={classes.body}>
                If You are a U.S. federal government end user, our Service is a &quot;Commercial
                Item&quot; as that term is defined at 48 C.F.R. §2.101.
              </Typography>
              <h1>United States Legal Compliance</h1>
              <Typography variant="h6" className={classes.body}>
                You represent and warrant that (i) You are not located in a country that is subject
                to the United States government embargo, or that has been designated by the United
                States government as a &quot;terrorist supporting&quot; country, and (ii) You are
                not listed on any United States government list of prohibited or restricted parties.
              </Typography>
              <h1>Severability and Waiver</h1>
              <h2>Severability</h2>
              <Typography variant="h6" className={classes.body}>
                If any provision of these Terms is held to be unenforceable or invalid, such
                provision will be changed and interpreted to accomplish the objectives of such
                provision to the greatest extent possible under applicable law and the remaining
                provisions will continue in full force and effect.
              </Typography>
              <h2>Waiver</h2>
              <Typography variant="h6" className={classes.body}>
                Except as provided herein, the failure to exercise a right or to require performance
                of an obligation under this Terms shall not effect a party&apos;s ability to
                exercise such right or require such performance at any time thereafter nor shall be
                the waiver of a breach constitute a waiver of any subsequent breach.
              </Typography>
              <h1>Translation Interpretation</h1>
              <Typography variant="h6" className={classes.body}>
                These Terms and Conditions may have been translated if We have made them available
                to You on our Service. You agree that the original English text shall prevail in the
                case of a dispute.
              </Typography>
              <h1>Changes to These Terms and Conditions</h1>
              <Typography variant="h6" className={classes.body}>
                We reserve the right, at Our sole discretion, to modify or replace these Terms at
                any time. If a revision is material We will make reasonable efforts to provide at
                least 30 days&apos; notice prior to any new terms taking effect. What constitutes a
                material change will be determined at Our sole discretion.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                By continuing to access or use Our Service after those revisions become effective,
                You agree to be bound by the revised terms. If You do not agree to the new terms, in
                whole or in part, please stop using the website and the Service.
              </Typography>
              <h1>Contact Us</h1>
              <Typography variant="h6" className={classes.body}>
                If you have any questions about these Terms and Conditions, You can contact us:
              </Typography>
              <ul>
                <li>By email: support@kelp.nyc</li>
              </ul>
              <Footer shouldAlignLeft={true} />
            </Container>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Terms;
