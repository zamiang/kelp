import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import React, { useState } from 'react';
import { styles } from './app';
import Copyright from './copyright';
import Docs from './docs';
import LeftDrawer from './left-drawer';
import TopBar from './top-bar';

interface IProps {
  classes: styles;
  accessToken: string;
}

const Dashboard = (props: IProps) => {
  const classes = props.classes;
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [isOpen, setOpen] = useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <TopBar classes={classes} handleDrawerOpen={handleDrawerOpen} isOpen={isOpen} />
      <LeftDrawer
        classes={classes}
        handleDrawerClose={handleDrawerClose}
        isOpen={isOpen}
        people={Object.values(personStore)}
      />
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8} lg={9}>
              <Paper className={fixedHeightPaper}>foo</Paper>
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <Paper className={fixedHeightPaper}>Other stuff</Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <b>activity</b>
                {driveResponse.loading && <div>Loading</div>}
                <Docs docs={driveResponse} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <b>activity</b>
                {activityResponse.loading && <div>Loading</div>}
                {JSON.stringify(activityResponse)}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <b>gmail</b>
                {gmailResponse.loading && <div>Loading</div>}
                {JSON.stringify(gmailResponse)}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <b>people</b>
                {peopleResponse.loading && <div>Loading</div>}
                {JSON.stringify(peopleResponse)}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <b>calendar</b>
                {calendarResponse.loading && <div>Loading</div>}
                {JSON.stringify(calendarResponse)}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <b>email</b>
                {emailsResponse.loading && <div>Loading</div>}
                {JSON.stringify(emailsResponse)}
              </Paper>
            </Grid>
          </Grid>
          <Box pt={4}>
            <Copyright />
          </Box>
        </Container>
      </main>
    </React.Fragment>
  );
};

export default Dashboard;
