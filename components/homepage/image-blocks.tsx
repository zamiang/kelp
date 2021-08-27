import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Image from 'next/image';
import React from 'react';
import meetingGif from '../../public/animations/meetings.gif';
import pinGif from '../../public/animations/pin.gif';
import tagGif from '../../public/animations/tags.gif';

export const useStyles = makeStyles((theme) => ({
  image: {
    margin: '0px auto',
    display: 'block',
    borderRadius: 20,
    maxWidth: '100%',
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
          <Image
            src={meetingGif}
            className={classes.image}
            alt="If you view a web apge during a meeting, it will be associated with the meetings"
          />
        </Grid>
        <Grid item>
          <Typography variant="h4" className={classes.heading}>
            Smart tags that automatically group web pages
          </Typography>
          <Image
            src={tagGif}
            className={classes.image}
            alt="Use smart tags to automatically group web pages"
          />
        </Grid>
        <Grid item>
          <Typography variant="h4" className={classes.heading}>
            Reorder as needed
          </Typography>
          <Image
            src={pinGif}
            className={classes.image}
            alt="Reorder webpages by clicking the pin icon"
          />
        </Grid>
      </Grid>
    </Container>
  );
};
