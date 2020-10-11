import Avatar from '@material-ui/core/Avatar';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React from 'react';
import Footer from '../components/homepage/footer';
import HomepageTopBar from '../components/homepage/homepage-top-bar';
import { useStyles } from './index';

const About = () => {
  const classes = useStyles();
  return (
    <div className={clsx(classes.root, classes.container)}>
      <div className={classes.containerWidth}>
        <HomepageTopBar color="about" />
        <Grid
          container
          className={clsx(classes.hero, classes.orangeBackground)}
          alignItems="center"
        >
          <Container>
            <img
              src="/icons/success-line.svg"
              className={clsx(classes.heroImage, classes.heroImageIcon)}
            />
            <Typography variant="h2" className={classes.center}>
              Information at your fingertips
              <br />
              &hellip;but actually
            </Typography>
          </Container>
        </Grid>
        <Grid
          container
          className={classes.info}
          alignItems="center"
          alignContent="center"
          justify="center"
        >
          <Grid item xs={6}>
            <Container maxWidth="sm">
              <img style={{ maxWidth: 120, margin: '0 auto', display: 'block' }} src="kelp.svg" />
              <Typography variant="h3" className={classes.center}>
                About Kelp
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Much like a fixer-upper house, where the true value of the home is unclear, our
                personal data is not rennovated for our use. We have communication tools separate
                from collaboration tools separate from scheduling tools. Each of these individual
                tools could benefit from information in the other tools.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Messages both contain information, are signals about relationships and link a person
                and a piece of information together. Events serve as an organizing principal as they
                have a topic, and involve a group of people working to produce some artifact. The
                meeting name and attendees are signals in addition to the artifacts created. A
                collaborative document, piece of code or design have both people and information
                attached.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                The mission of Kelp is to figure out how to link that information together in a way
                that provides value to working professionals.
              </Typography>
            </Container>
          </Grid>
        </Grid>
        <Grid
          container
          className={classes.info}
          alignItems="center"
          alignContent="center"
          justify="center"
        >
          <Grid item xs={6}>
            <Container maxWidth="sm">
              <Avatar alt="Brennan Moore" src="/brennan.jpg" className={classes.largeAvatar} />
              <Typography variant="h3" className={classes.center}>
                About Me
              </Typography>
              <Typography variant="h6" className={classes.body}>
                My name is{' '}
                <a href="http://www.zamiang.com/" target="_blank" rel="noreferrer">
                  Brennan Moore
                </a>
                . I&rsquo;ve been professionally building software on the internet for the past 12
                years. I&rsquo;ve built tools for non-profits, art collectors, bike share companies,
                e-commerce startups and for healthcare enterprise.
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
            </Container>
          </Grid>
        </Grid>
        <Footer />
      </div>
    </div>
  );
};

export default About;
