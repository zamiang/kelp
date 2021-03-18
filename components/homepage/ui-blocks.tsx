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
    [theme.breakpoints.down('sm')]: {
      padding: 0,
    },
  },
  greyContainer: {
    width: '100%',
  },
  dot: {
    height: 12,
    width: 12,
    borderRadius: 10,
    marginRight: 22,
    background: theme.palette.primary.main,
    display: 'inline-block',
    verticalAlign: 'top',
    marginTop: 8,
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
    [theme.breakpoints.down('sm')]: {
      padding: 0,
    },
  },
  sectionImageRightBottom: {
    paddingBottom: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      padding: 0,
    },
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
    <Container maxWidth="md">
      <Grid container className={classes.section} alignItems="center">
        <Grid item md={6} sm={12} className={classes.sectionText}>
          <Typography variant="h4">
            <div className={classes.dot}></div>Organization for humans
          </Typography>
          <br />
          <Typography>
            Kelp meets you where you are. It doesn’t ask you to change how you organize your work or
            how you collaborate.
          </Typography>
        </Grid>
        <Grid
          item
          md={6}
          sm={12}
          className={clsx(classes.sectionImageRightTop, classes.greyContainer)}
        >
          <img src="images/meeting.svg" style={{ maxHeight: 212, maxWidth: '100%' }} />
        </Grid>
      </Grid>
      <Grid
        container
        className={clsx(classes.section, classes.sectionMobileReverse)}
        alignItems="center"
      >
        <Grid item md={6} sm={12} className={clsx(classes.sectionImageLeft, classes.greyContainer)}>
          <img src="images/documents.svg" style={{ maxHeight: 231, maxWidth: '100%' }} />
        </Grid>
        <Grid item md={6} sm={12} className={classes.sectionText}>
          <Typography variant="h4">
            <div className={classes.dot}></div>Quickly prepare for meetings
          </Typography>
          <br />
          <Typography>
            Kelp scans your calendar and documents to automatically collect the documents you need.
            It then magically annotates your calendar. Easy.
          </Typography>
        </Grid>
      </Grid>
      <Grid container className={classes.section} alignItems="center">
        <Grid item md={6} sm={12} className={classes.sectionText}>
          <Typography variant="h4">
            <div className={classes.dot}></div>Manage work relationships
          </Typography>
          <br />
          <Typography>
            Kelp infers associations between information, such as between a person, a meeting with
            the person and document edits by the person.
          </Typography>
        </Grid>
        <Grid
          item
          md={6}
          sm={12}
          className={clsx(classes.sectionImageRightBottom, classes.greyContainer)}
        >
          <img src="images/person.svg" style={{ maxHeight: 210, maxWidth: '100%' }} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default UiBlocks;
