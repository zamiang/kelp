import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React from 'react';
import { useStyles } from './ui-blocks';

const InstallUiBlocks = () => {
  const classes = useStyles();
  return (
    <Container maxWidth="md">
      <div className={classes.textSection}>
        <br />
        <br />
        <Typography variant="h4" style={{ fontSize: 24 }}>
          Your Kelp application uses these data sources
        </Typography>
      </div>
      <Grid container className={classes.section} alignItems="center">
        <Grid item md={6} sm={12} className={classes.sectionText}>
          <Typography variant="h4" className={classes.heading}>
            <div className={classes.dot}></div>Read Contacts
          </Typography>
          <Typography>
            This allows your Kelp application to associate document activity with meetings.
          </Typography>
        </Grid>
        <Grid
          item
          md={6}
          sm={12}
          className={clsx(classes.sectionImageRightTop, classes.greyContainer)}
          justify="center"
        >
          <img src="google-permissions/contacts.png" className={classes.image} />
        </Grid>
      </Grid>
      <Grid container className={classes.section} alignItems="center">
        <Grid item md={6} sm={12} className={classes.sectionText}>
          <Typography variant="h4" className={classes.heading}>
            <div className={classes.dot}></div>Read Document Metadata
          </Typography>
          <Typography>
            This allows Kelp to know the title of your documents and easily link you to documents.
            Kelp cannot access the content of documents in you or your companies drive folder.
          </Typography>
        </Grid>
        <Grid
          item
          md={6}
          sm={12}
          className={clsx(classes.sectionImageRightTop, classes.greyContainer)}
        >
          <img src="google-permissions/drive.png" className={classes.image} />
        </Grid>
      </Grid>
      <Grid container className={classes.section} alignItems="center">
        <Grid item md={6} sm={12} className={classes.sectionText}>
          <Typography variant="h4" className={classes.heading}>
            <div className={classes.dot}></div>Create Smart Meeting Notes
          </Typography>
          <Typography>
            Kelp can create smart notes for your upcoming meetings that automatically include
            relevant documents and attendees.
          </Typography>
        </Grid>
        <Grid
          item
          md={6}
          sm={12}
          className={clsx(classes.sectionImageRightTop, classes.greyContainer)}
        >
          <img src="google-permissions/drive-kelp.png" className={classes.image} />
        </Grid>
      </Grid>
      <Grid container className={classes.section} alignItems="center">
        <Grid item md={6} sm={12} className={classes.sectionText}>
          <Typography variant="h4" className={classes.heading}>
            <div className={classes.dot}></div>Read Calendar Events
          </Typography>
          <Typography>
            This allows your Kelp application to see your upcoming meetings and then match them with
            documents, document events and attendees.
          </Typography>
        </Grid>
        <Grid
          item
          md={6}
          sm={12}
          className={clsx(classes.sectionImageRightTop, classes.greyContainer)}
        >
          <img src="google-permissions/calendar.png" className={classes.image} />
        </Grid>
      </Grid>
      <Grid container className={classes.section} alignItems="center">
        <Grid item md={6} sm={12} className={classes.sectionText}>
          <Typography variant="h4" className={classes.heading}>
            <div className={classes.dot}></div>Read Document Events
          </Typography>
          <Typography>
            This allows Kelp minimal access to event data like if someone edits or comments on a
            document.
          </Typography>
        </Grid>
        <Grid
          item
          md={6}
          sm={12}
          className={clsx(classes.sectionImageRightBottom, classes.greyContainer)}
          justify="center"
        >
          <img src="google-permissions/activity.png" className={classes.image} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default InstallUiBlocks;
