import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import Head from 'next/head';
import React from 'react';
import Footer from '../components/homepage/footer';
import Header from '../components/homepage/header';
import { Root, classes } from './index';

const About = () => (
  <Root className={classes.container}>
    <Head>
      <title>About - Kelp</title>
      <meta
        name="description"
        content="Kelp organizes your documents, events and contacts to make work make sense."
      />
    </Head>
    <style jsx global>{`
      html body {
        background-color: #faf5eb;
      }
    `}</style>
    <div>
      <Header />
      <Grid container className={clsx(classes.subpage)} alignItems="center" justifyContent="center">
        <Grid item sm={7}>
          <Container maxWidth="sm">
            <Typography variant="h3">About Kelp</Typography>
            <Typography className={classes.body}>
              Today, we are trapped by tools that impose physical limitations on digital tools.
              Nested into folders, our information is hidden from view.
            </Typography>
            <Typography className={classes.body}>
              Kelp gets you the documents you need when you need them by passively organizing
              information. It uses data signals, like if a document is edited during a meeting, to
              make that document easier to find. Kelp then serves that document to you
              automatically.
            </Typography>
            <Typography className={classes.body}>
              Kelp meets you where you are. You don&rsquo;t need to adopt some new tagging system or
              spend hours moving files around.
            </Typography>
            <Typography className={classes.body}>Install Kelp. Done.</Typography>
            <br />
            <Divider />
            <div className={classes.section}>
              <Typography variant="h4">Your privacy is first</Typography>
              <Typography className={classes.body}>
                Everything you do in Kelp is anonymous and your data stays on your computer. The
                application is deployed &ldquo;on-prem&rdquo; and is fully hosted on your computer.
              </Typography>
              <Typography className={classes.body}>
                Kelp does not operate intermediary servers to process or store your data. None of
                the data fetched from third party services leaves your computer. Data is fetched
                when you have Kelp open and cached on your computer for 12 hours to ensure the
                application is fast.
              </Typography>
              <Typography className={classes.body}>
                Kelp does not track any sensitive data. We record completely anonymous usage
                statistics and error logs. We interpret the usage data in order to improve Kelp.
                None of the data is sold and we don’t use it for advertisements.
              </Typography>
              <Typography className={classes.body}>
                Kelp puts your privacy and security first. We deeply believe that limiting Kelp’s
                access to your data is both our best interest and your best interest and hope to be
                an example of privacy forward companies.
              </Typography>
            </div>
            <Divider />
            <div className={classes.section}>
              <Typography variant="h4">We value security</Typography>
              <Typography className={classes.body}>
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
            </div>
            <Divider />
            <div className={classes.section}>
              <Typography variant="h4">We are building for the long term</Typography>
              <Typography className={classes.body}>
                We are self funded with the goal of building a sustainable product. Our vision is to
                create a useful tool with an active community paired with a clear business model.
              </Typography>
              <Typography className={classes.body}>
                During our public beta, Kelp is free to use. Eventually, we’ll add paid features and
                integrations. The clear monetization guarantees that we are able to maintain the
                tool for the long term.
              </Typography>
            </div>
            <Divider />
            <div className={classes.section}>
              <Typography variant="h4">About Me</Typography>
              <Typography className={classes.body}>
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
                . That research with Max, combined with my work experience is what inspired the
                creation of Kelp.
              </Typography>
              <Typography className={classes.body}>
                Across all of those experiences, I&rsquo;ve made a lot of simple mistakes.
                I&rsquo;ve lost documents, missed emails, created events with the missing attendees
                and I&rsquo;ve had coworker relationships languish. While we are responsible for our
                actions, humans are not well suited to dealing with the amount of information and
                notifications we receive every day across an increasingly vast set of sources.
              </Typography>
              <Typography className={classes.body}>
                I hope to use my experience to build tools that help people take back their time and
                attention to focus on what is most important rather than what appears urgent.
              </Typography>
            </div>
          </Container>
        </Grid>
      </Grid>
      <Footer />
    </div>
  </Root>
);

export default About;
