import Avatar from '@material-ui/core/Avatar';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
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
            <Typography variant="h2" className={clsx(classes.center, classes.heading)}>
              Information at your fingertips
              <br />
              &hellip;but actually
            </Typography>
          </Container>
        </Grid>
        <Container maxWidth="md">
          <Grid container className={classes.info} justify="flex-start">
            <Grid item>
              <img
                style={{ width: 120, margin: '-38px auto 0', display: 'block' }}
                src="kelp.svg"
              />
            </Grid>
            <Grid item sm={10}>
              <Typography variant="h3">Kelp</Typography>
              <Typography variant="h6" className={classes.body}>
                Kelp organizes your documents, events and contacts to make work make sense.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                It is difficult for working professionals to quickly gather the information they
                need to be effective across an increasingly vast set of information sources.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Kelp solves this problem through passively organizing information. This passive
                organization reduces the time working professionals spend searching for information
                and helps them see bigger picture. This stands in stark contrast to the arduous
                process of folder organization and tagging that is hopeless in most collaborative
                environments and ROI negative for most individuals.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Use your data to help you do your job rather than to sell you things you don't need.
              </Typography>
            </Grid>
          </Grid>
          <Grid container className={classes.info}>
            <Grid item>
              <img
                style={{ width: 120, margin: '-38px auto 0', display: 'block' }}
                src="kelp.svg"
              />
            </Grid>
            <Grid item sm={10}>
              <Typography variant="h4">
                Our data can be used for so much more than selling us stuff we don't need
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Much like a fixer-upper house, our data is not renovated for our use — it has mostly
                been used to sell us products. Our communication tools are separate from our
                collaboration tools which are separate from our scheduling tools. Each of these
                individual tools could benefit from information in the other but there is also data
                in each that we just don't yet use.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                For example, a Slack message contains the text and serves as a signal about
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
            </Grid>
          </Grid>
          <Grid container className={classes.info}>
            <Grid item>
              <img
                style={{ width: 120, margin: '-38px auto 0', display: 'block' }}
                src="kelp.svg"
              />
            </Grid>
            <Grid item sm={10}>
              <Typography variant="h4">We put your privacy first</Typography>
              <Typography variant="h6" className={classes.body}>
                Everything you do in Kelp is anonymous and your data stays on your computer.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                The credentials for third party services are stored securely in Auth0. All
                extensions communicate directly via HTTPS over TLS to third party APIs. Kelp does
                not operate intermediary servers to process or store your data. We use OAuth for
                authentication and authorization where possible and access as little information as
                necessary. None of the data fetched from third party services leaves your computer.
                Data is fetched when you have Kelp open and gone when you close Kelp.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Kelp does not don’t track any sensitive data. Only completely anonymous usage
                statistics and error logging are sent to us. We interpret the usage data in order to
                improve Kelp. None of the data is sold and we don’t use it for advertisement.
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Kelp puts your privacy and security first. We deeply believe that limiting Kelp’s
                access to your data is both our best interest and your best interest and hope to be
                an example of privacy forward companies.
              </Typography>
            </Grid>
          </Grid>
          <Grid container className={classes.info}>
            <Grid item>
              <img
                style={{ width: 120, margin: '-38px auto 0', display: 'block' }}
                src="/icons/Relax.svg"
              />
            </Grid>
            <Grid item sm={10}>
              <Typography variant="h4">We value secuirty</Typography>
              <Typography variant="h6" className={classes.body}>
                Neither Kelp or Auth0 store your passwords or personal data. We take security
                seriously and apply experience from e-commerce, and healthcare data security. Kelp’s
                security practices include but are not limited to
              </Typography>
              <List>
                <ListItem disableGutters={true}>
                  <ListItemIcon>
                    <img className={classes.smallIcon} src="/icons/positive-color.svg" />
                  </ListItemIcon>
                  <ListItemText
                    classes={{
                      primary: classes.largeListItemText,
                    }}
                    primary="Static code analysis"
                  />
                </ListItem>
                <ListItem disableGutters={true}>
                  <ListItemIcon>
                    <img className={classes.smallIcon} src="/icons/positive-color.svg" />
                  </ListItemIcon>
                  <ListItemText
                    classes={{
                      primary: classes.largeListItemText,
                    }}
                    primary="Static dependency checking"
                  />
                </ListItem>
                <ListItem disableGutters={true}>
                  <ListItemIcon>
                    <img className={classes.smallIcon} src="/icons/positive-color.svg" />
                  </ListItemIcon>
                  <ListItemText
                    classes={{
                      primary: classes.largeListItemText,
                    }}
                    primary="Web vulnerability scanning"
                  />
                </ListItem>
                <ListItem disableGutters={true}>
                  <ListItemIcon>
                    <img className={classes.smallIcon} src="/icons/positive-color.svg" />
                  </ListItemIcon>
                  <ListItemText
                    classes={{
                      primary: classes.largeListItemText,
                    }}
                    primary="End to end encryption"
                  />
                </ListItem>
                <ListItem disableGutters={true}>
                  <ListItemIcon>
                    <img className={classes.smallIcon} src="/icons/positive-color.svg" />
                  </ListItemIcon>
                  <ListItemText
                    classes={{
                      primary: classes.largeListItemText,
                    }}
                    primary="Security Bug Bounty program"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          <Grid container className={classes.info}>
            <Grid item>
              <Avatar alt="Brennan Moore" src="/brennan.jpg" className={classes.largeAvatar} />
            </Grid>
            <Grid item sm={10}>
              <Typography variant="h3">About Me</Typography>
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
            </Grid>
          </Grid>
        </Container>
        <Footer />
      </div>
    </div>
  );
};

export default About;
