import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import React from 'react';
import { StyledContainer, classes } from './ui-blocks';

const InstallUiBlocks = () => (
  <StyledContainer maxWidth="md">
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
          This allows Kelp to know the title and link your documents. Kelp cannot access the content
          of documents in you or your company Drive.
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
          <div className={classes.dot}></div>Read Calendar Events
        </Typography>
        <Typography>
          This allows your Kelp application to see your upcoming meetings and then match them with
          relevant websites.
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
  </StyledContainer>
);

export default InstallUiBlocks;
