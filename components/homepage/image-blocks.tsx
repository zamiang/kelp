import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';

export const useStyles = makeStyles((theme) => ({
  image: {
    margin: '0px auto',
    display: 'block',
    borderRadius: 20,
  },
  heading: {
    fontSize: 24,
    marginBottom: theme.spacing(3),
    textAlign: 'center',
  },
  textSection: {
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4),
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing(6),
    marginTop: theme.spacing(6),
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
  },
}));

export const ImageBlocks = () => {
  const classes = useStyles();
  return (
    <Container maxWidth="md">
      <Grid container className={classes.section} alignItems="center" spacing={10}>
        <Grid item>
          <Typography variant="h4" className={classes.heading}>
            Automatically associate web pages with meetings
          </Typography>
          <img src="/animations/meetings.gif" className={classes.image} />
        </Grid>
        <Grid item>
          <Typography variant="h4" className={classes.heading}>
            Smart tags that automatically group web pages
          </Typography>
          <img src="/animations/tags.gif" className={classes.image} />
        </Grid>
        <Grid item>
          <Typography variant="h4" className={classes.heading}>
            Reorder as needed
          </Typography>
          <img src="/animations/pin.gif" className={classes.image} />
        </Grid>
      </Grid>
    </Container>
  );
};
