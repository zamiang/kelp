import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import React, { useState } from 'react';
import Copyright from './copyright';
import Docs from './docs';
import { IProps as FetchProps } from './fetch-second';
import LeftDrawer from './left-drawer';
import TopBar from './top-bar';

interface IProps extends FetchProps {
  emails?: any;
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
        people={Object.values(props.personStore)}
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
                <Docs docs={props.driveFiles} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <b>activity</b>
                {JSON.stringify(props.driveActivity)}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <b>emails</b>
                {JSON.stringify(props.emails)}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <b>calendar</b>
                {JSON.stringify(props.calendarEvents)}
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
