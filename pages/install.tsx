import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import Head from 'next/head';
import React from 'react';
import InstallUiBlocks from '../components/homepage/install-ui-blocks';
import { useStyles } from './index';

const App = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Head>
        <title>Kelp - How does Kelp Work?</title>
        <meta name="description" content="Guide for installing Kelp." />
      </Head>
      <style jsx global>{`
        html body {
          background-color: #faf5eb;
        }
      `}</style>
      <div className={classes.hero}>
        <Container maxWidth="md">
          <img style={{ width: 100 }} src="/kelp.svg" alt="Kelp logo" />
          <Typography variant="h1" className={classes.heading}>
            How does kelp work?
          </Typography>
          <Typography className={classes.subheading}>
            Kelp is an application that you run on your computer.
          </Typography>
          <Container className={classes.buttonContainer}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              className={classes.login}
              disableElevation={true}
              style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'block',
                textAlign: 'center',
              }}
              href="https://chrome.google.com/webstore/detail/kelp/onkkkcfnlbkoialleldfbgodakajfpnl"
            >
              Add to Chrome
            </Button>
          </Container>
        </Container>
      </div>
      <Divider />
      <InstallUiBlocks />
      <Divider />
      <Container maxWidth="md">
        <Grid container alignItems="center" justify="center">
          <Grid sm={12} md={6} item>
            <Typography variant="h4" className={classes.quote}>
              Ready to get started?
            </Typography>
            <div className={classes.buttonContainer}>
              <Button
                variant="contained"
                size="large"
                color="primary"
                className={classes.login}
                disableElevation={true}
                href="https://chrome.google.com/webstore/detail/kelp/onkkkcfnlbkoialleldfbgodakajfpnl"
              >
                Add to Chrome
              </Button>
              <br />
              <br />
              or <Link href="/dashboard">try out Kelp in your browser</Link>.
            </div>
          </Grid>
          <Grid
            sm={12}
            md={6}
            item
            className={clsx(classes.bodyCopySection, classes.loginButtonContainer)}
          >
            <List disablePadding className={classes.list}>
              <ListItem disableGutters>
                <div className={classes.emojiIcon}>🛑 </div>
                <ListItemText>Kelp does not send your data to third parties</ListItemText>
              </ListItem>
              <ListItem disableGutters>
                <div className={classes.emojiIcon}>🔐</div>
                <ListItemText>Kelp does not record your email or Google Profile</ListItemText>
              </ListItem>
              <ListItem disableGutters>
                <div className={classes.emojiIcon}>🛤</div>
                <ListItemText>Kelp does not include analytics or tracking tools</ListItemText>
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};
export default App;