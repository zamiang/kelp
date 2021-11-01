import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import Head from 'next/head';
import React from 'react';
import InstallUiBlocks from '../components/homepage/install-ui-blocks';
import { Root, classes } from './index';

const App = () => (
  <Root className={classes.container}>
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
          Install Kelp
        </Typography>
        <Typography className={classes.subheading}>
          Review the permissions used and our security practices below.
        </Typography>
        <Container className={classes.buttonContainer}>
          <Button
            variant="contained"
            size="large"
            color="primary"
            className={classes.login}
            disableElevation={true}
            startIcon={
              <img src="/icons/chrome.svg" width={config.ICON_SIZE} height={config.ICON_SIZE} />
            }
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
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
    <Container maxWidth="md" className={classes.installButtonContainer}>
      <Grid container alignItems="center" justifyContent="center">
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
              startIcon={
                <img src="/icons/chrome.svg" width={config.ICON_SIZE} height={config.ICON_SIZE} />
              }
              href="https://chrome.google.com/webstore/detail/kelp/onkkkcfnlbkoialleldfbgodakajfpnl"
            >
              Add to Chrome
            </Button>
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
              <div className={classes.emojiIcon}>💻</div>
              <ListItemText>
                Kelp is a chrome extension that runs entirely on your computer
              </ListItemText>
            </ListItem>
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
  </Root>
);
export default App;
