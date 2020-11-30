import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import Footer from '../components/homepage/footer';
import LoginButton from '../components/homepage/login-button';
import config from '../constants/config';
import { useStyles } from './index';

const About = () => {
  const classes = useStyles();
  return (
    <div className={clsx(classes.root, classes.container)}>
      <Head>
        <title>About - Kelp</title>
        <meta
          name="description"
          content="Why we are building another piece of software what Kelp stands for."
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
                <img alt="Kelp logo" style={{ maxWidth: 120, marginLeft: -32 }} src="/kelp.svg" />
              </Link>
              <Typography variant="h3" className={classes.heading}>
                About Kelp
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Kelp organizes your documents, events and contacts to make work make sense.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                We are trying to help working professionals to quickly gather the information they
                need to be effective across an increasingly vast set of information sources.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                We believe that we can help by meeting people where they are instead of asking them
                to adopt yet another organizational scheme. Our strategy is to find novel approaches
                to passive information organization in order to reduce the time working
                professionals spend searching for information and help them see the bigger picture.
              </Typography>
              <br />
              <Divider />
              <br />
              <Typography variant="h4">We make your data work for you</Typography>
              <br />
              <Typography variant="h6">
                <b>
                  Our data can be used for so much more than selling us stuff we don&rsquo;t need.
                </b>
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Much like a fixer-upper house, our data is not renovated for our use. Our data has
                mostly been used to sell us products. Our communication tools are separate from our
                collaboration tools which are separate from our scheduling tools. Each of these
                individual tools could benefit from information in the other but there is also data
                in each that we just don&rsquo;t yet use.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                For example, a Slack message contains the text and serves as a signal about the
                relationship between two people, a piece of information and a point in time. Events
                organize information as they have a topic, and involve a group of people working to
                produce some artifact. The meeting name and attendees are signals in addition to the
                artifacts created. A collaborative document, piece of code or design have people,
                information and time attached to them.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                The mission of Kelp is to figure out how to link that information together in a way
                that provides meaningful value to working professionals.
              </Typography>
              <br />
              <Divider />
              <br />
              <Typography variant="h4">We put your privacy first</Typography>
              <Typography variant="h6" className={classes.body}>
                Everything you do in Kelp is anonymous and your data stays on your computer.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                The credentials for third party services are stored securely. All extensions
                communicate directly via{' '}
                <MuiLink
                  href="https://en.wikipedia.org/wiki/HTTPS"
                  target="_blank"
                  className={classes.link}
                >
                  HTTPS
                </MuiLink>{' '}
                over{' '}
                <MuiLink
                  href="https://en.wikipedia.org/wiki/Transport_Layer_Security"
                  className={classes.link}
                  target="_blank"
                >
                  TLS{' '}
                </MuiLink>{' '}
                to third party APIs. Kelp does not operate intermediary servers to process or store
                your data. We use{' '}
                <MuiLink href="https://oauth.net/" target="_blank" className={classes.link}>
                  OAuth
                </MuiLink>{' '}
                for authentication and authorization where possible and access as little information
                as necessary. None of the data fetched from third party services leaves your
                computer. Data is fetched when you have Kelp open and gone when you close Kelp.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Kelp does not don’t track any sensitive data. Only completely anonymous usage
                statistics and error logging are sent to us. We interpret the usage data in order to
                improve Kelp. None of the data is sold and we don’t use it for advertisements.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                We deeply believe that limiting Kelp’s access to your data is both our best interest
                and your best interest and hope to be an example of privacy forward companies.
              </Typography>
              <br />
              <Divider />
              <br />
              <Typography variant="h4">We value security</Typography>
              <Typography variant="h6" className={classes.body}>
                Kelp does not store your passwords or personal data. We take security seriously and
                apply experience from e-commerce, and healthcare data security. Kelp’s security
                practices include but are not limited to:{' '}
                <MuiLink
                  className={classes.link}
                  target="_blank"
                  href="https://en.wikipedia.org/wiki/Static_program_analysis"
                >
                  static code analysis
                </MuiLink>
                ,{' '}
                <MuiLink
                  className={classes.link}
                  target="_blank"
                  href="https://docs.github.com/en/free-pro-team@latest/github/managing-security-vulnerabilities/about-alerts-for-vulnerable-dependencies"
                >
                  static dependency checking
                </MuiLink>
                ,{' '}
                <MuiLink
                  className={classes.link}
                  target="_blank"
                  href="https://en.wikipedia.org/wiki/Vulnerability_scanner"
                >
                  web vulnerability scanning
                </MuiLink>
                ,{' '}
                <MuiLink
                  href="https://en.wikipedia.org/wiki/Transport_Layer_Security"
                  className={classes.link}
                  target="_blank"
                >
                  end-to-end encryption
                </MuiLink>
                , and a{' '}
                <MuiLink href="mailto:security@kelp.nyc" className={classes.link} target="_blank">
                  bug bounty program
                </MuiLink>
                .
              </Typography>
              <br />
              <Divider />
              <br />
              <Typography variant="h4">We are building a business for the long term</Typography>
              <Typography variant="h6" className={classes.body}>
                We are self funded with the goal of building a sustainable product. Our vision is to
                create a useful tool with an active community paired with a clear business model.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                During our public beta, Kelp is free to use. Eventually, we’ll add paid features and
                integrations. The clear monetization guarantees that we are able to maintain the
                tool for the long term.
              </Typography>
              <br />
              <Divider />
              <br />
              <Typography variant="h4">About Me</Typography>
              <Typography variant="h6" className={classes.body}>
                My name is{' '}
                <MuiLink href="http://www.zamiang.com/" target="_blank" className={classes.link}>
                  Brennan Moore
                </MuiLink>
                . I&rsquo;ve been professionally building software on the internet for the past 12
                years. I&rsquo;ve built tools for non-profits, art collectors, bike share companies,
                e-commerce startups and for healthcare enterprise. Before being a professional
                software engineer, I collaborated with{' '}
                <MuiLink
                  href="https://www.cs.ox.ac.uk/people/max.vankleek/"
                  target="_blank"
                  className={classes.link}
                >
                  Max Van Kleek
                </MuiLink>{' '}
                and others at the{' '}
                <MuiLink
                  href="http://haystack.csail.mit.edu/"
                  target="_blank"
                  className={classes.link}
                >
                  MIT CSAIL Haystack group
                </MuiLink>{' '}
                building tools to automate tasks{' '}
                <sup>
                  <MuiLink
                    target="_blank"
                    className={classes.link}
                    href="http://people.csail.mit.edu/emax/papers/atomate-www2010.pdf"
                  >
                    pdf
                  </MuiLink>
                </sup>{' '}
                and assist self reflection{' '}
                <sup>
                  <MuiLink
                    target="_blank"
                    className={classes.link}
                    href="https://chi2010.personalinformatics.org/publications/515"
                  >
                    pdf
                  </MuiLink>
                </sup>
                .
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Across all of those experiences, I&rsquo;ve made a lot of simple mistakes.
                I&rsquo;ve lost documents, missed emails, created events with the wrong attendees
                and I&rsquo;ve had coworker relationships languish. While we are responsible for our
                actions, we are not well suited to dealing with the amount of information and
                notifications we receive every day across an increasingly vast set of sources.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                I hope to use my experience to build tools that help people take back their time and
                attention to focus on what is most important rather than what appears urgent.
              </Typography>
              <Footer shouldAlignLeft={true} />
            </Container>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default About;
