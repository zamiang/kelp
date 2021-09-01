import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';

export const useStyles = makeStyles((theme) => ({
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
  image: {
    maxWidth: 290,
    margin: '0px auto',
    display: 'block',
  },
  greyContainer: {
    width: '100%',
  },
  heading: {
    fontSize: 24,
    marginBottom: theme.spacing(3),
  },
  textSection: {
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4),
    textAlign: 'center',
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
      paddingTop: 0,
      paddingBottom: theme.spacing(3),
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
  section: {
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
  },
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
}));

const UiBlocks = () => {
  const classes = useStyles();
  return (
    <Container maxWidth="md">
      <Grid container className={classes.section} alignItems="center">
        <Grid item md={6} sm={12} className={classes.sectionText}>
          <Typography variant="h4" className={classes.heading}>
            <div className={classes.dot}></div>Made for humans
          </Typography>
          <Typography>
            Kelp meets you where you are. It doesn’t ask you to change how you organize information
            or collaborate.
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
    </Container>
  );
};

export default UiBlocks;
