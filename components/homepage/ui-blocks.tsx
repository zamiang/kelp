import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  container: {},
  sectionImageLeft: {
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingRight: theme.spacing(4),
    textAlign: 'right',
  },
  greyContainer: {
    width: '100%',
    backgroundColor: theme.palette.secondary.light,
  },
  sectionText: {
    padding: theme.spacing(6),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  sectionImageRightTop: {
    paddingBottom: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  sectionImageRightBottom: {
    paddingBottom: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  section: {},
  notificationContainer: {
    marginRight: 28,
    [theme.breakpoints.down('sm')]: {
      marginRight: 'auto',
    },
  },
  prepareTextRight: {
    marginLeft: 0,
    [theme.breakpoints.down('sm')]: {
      marginLeft: 'auto',
    },
  },
  manageWorkTextLeft: {
    marginRight: 0,
    [theme.breakpoints.down('sm')]: {
      marginRight: 'auto',
    },
  },
  sectionMobileReverse: {
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
    },
  },
}));

const UiBlocks = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Grid container className={classes.section}>
        <Grid item md={6} sm={12} className={classes.sectionText}>
          <Container maxWidth="xs" className={classes.manageWorkTextLeft}>
            <Typography variant="h4">Organization for humans</Typography>
            <br />
            <Typography>
              Kelp meets you where you are. It doesn’t ask you to change how you organize your work
              or how you collaborate.
            </Typography>
          </Container>
        </Grid>
        <Grid
          item
          md={6}
          sm={12}
          className={clsx(classes.sectionImageRightTop, classes.greyContainer)}
        >
          <img src="images/notice.png" style={{ maxWidth: '100%' }} />
        </Grid>
      </Grid>
      <Grid container className={clsx(classes.section, classes.sectionMobileReverse)}>
        <Grid item md={6} sm={12} className={clsx(classes.sectionImageLeft, classes.greyContainer)}>
          <img src="images/notice.png" style={{ maxWidth: '100%' }} />
        </Grid>
        <Grid item md={6} sm={12} className={classes.sectionText}>
          <Container maxWidth="xs" className={classes.prepareTextRight}>
            <Typography variant="h4">Quickly Prepare For Meetings</Typography>
            <br />
            <Typography>
              Kelp scans your calendar and documents to automatically collect the documents you
              need. It then magically annotates your calendar. Easy.
            </Typography>
          </Container>
        </Grid>
      </Grid>
      <Grid container className={classes.section}>
        <Grid item md={6} sm={12} className={classes.sectionText}>
          <Container maxWidth="xs" className={classes.manageWorkTextLeft}>
            <Typography variant="h4">Manage Work Relationships</Typography>
            <br />
            <Typography>
              Kelp infers associations between information, such as between a person, a meeting with
              the person and document edits by the person.
            </Typography>
          </Container>
        </Grid>
        <Grid
          item
          md={6}
          sm={12}
          className={clsx(classes.sectionImageRightBottom, classes.greyContainer)}
        >
          <img src="images/notice.png" style={{ maxWidth: '100%' }} />
        </Grid>
      </Grid>
    </div>
  );
};

export default UiBlocks;
