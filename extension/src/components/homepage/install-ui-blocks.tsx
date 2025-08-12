import Box from '@mui/material/Box';
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
    <Box display="flex" className={classes.section} alignItems="center" flexWrap="wrap">
      <Box
        flex="1 1 50%"
        sx={{ '@media (max-width: 900px)': { flex: '1 1 100%' } }}
        className={classes.sectionText}
      >
        <Typography variant="h4" className={classes.heading}>
          <div className={classes.dot}></div>Read Contacts
        </Typography>
        <Typography>
          This allows your Kelp application to associate document activity with meetings.
        </Typography>
      </Box>
      <Box
        flex="1 1 50%"
        sx={{ '@media (max-width: 900px)': { flex: '1 1 100%' } }}
        className={clsx(classes.sectionImageRightTop, classes.greyContainer)}
      >
        <img src="google-permissions/contacts.png" className={classes.image} />
      </Box>
    </Box>
    <Box display="flex" className={classes.section} alignItems="center" flexWrap="wrap">
      <Box
        flex="1 1 50%"
        sx={{ '@media (max-width: 900px)': { flex: '1 1 100%' } }}
        className={classes.sectionText}
      >
        <Typography variant="h4" className={classes.heading}>
          <div className={classes.dot}></div>Read Document Metadata
        </Typography>
        <Typography>
          This allows Kelp to know the title and link your documents. Kelp cannot access the content
          of documents in you or your company Drive.
        </Typography>
      </Box>
      <Box
        flex="1 1 50%"
        sx={{ '@media (max-width: 900px)': { flex: '1 1 100%' } }}
        className={clsx(classes.sectionImageRightTop, classes.greyContainer)}
      >
        <img src="google-permissions/drive.png" className={classes.image} />
      </Box>
    </Box>
    <Box display="flex" className={classes.section} alignItems="center" flexWrap="wrap">
      <Box
        flex="1 1 50%"
        sx={{ '@media (max-width: 900px)': { flex: '1 1 100%' } }}
        className={classes.sectionText}
      >
        <Typography variant="h4" className={classes.heading}>
          <div className={classes.dot}></div>Read Calendar Events
        </Typography>
        <Typography>
          This allows your Kelp application to see your upcoming meetings and then match them with
          relevant websites.
        </Typography>
      </Box>
      <Box
        flex="1 1 50%"
        sx={{ '@media (max-width: 900px)': { flex: '1 1 100%' } }}
        className={clsx(classes.sectionImageRightTop, classes.greyContainer)}
      >
        <img src="google-permissions/calendar.png" className={classes.image} />
      </Box>
    </Box>
  </StyledContainer>
);

export default InstallUiBlocks;
