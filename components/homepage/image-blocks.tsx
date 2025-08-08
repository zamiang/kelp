import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import React from 'react';
import tagGif from '../../public/animations/tag-group.gif';
import meetingGif from '../../public/animations/tag-meeting.gif';
import pinGif from '../../public/animations/tag-nav.gif';

const PREFIX = 'ImageBlocks';

const classes = {
  image: `${PREFIX}-image`,
  heading: `${PREFIX}-heading`,
  textSection: `${PREFIX}-textSection`,
  section: `${PREFIX}-section`,
};

const StyledContainer = styled(Container)(({ theme }) => ({
  [`& .${classes.image}`]: {
    margin: '0px auto',
    display: 'block',
    borderRadius: 20,
    maxWidth: '100%',
  },

  [`& .${classes.heading}`]: {
    fontSize: 24,
    marginBottom: theme.spacing(3),
    textAlign: 'center',
  },

  [`& .${classes.textSection}`]: {
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4),
    textAlign: 'center',
  },

  [`& .${classes.section}`]: {
    marginBottom: theme.spacing(6),
    marginTop: theme.spacing(6),
    [theme.breakpoints.down('md')]: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
  },
}));

export const ImageBlocks = () => (
  <StyledContainer maxWidth="md">
    <Box
      display="flex"
      flexDirection="column"
      className={classes.section}
      alignItems="center"
      gap={10}
    >
      <Box>
        <Typography variant="h4" className={classes.heading}>
          Smart tags automatically group web pages
        </Typography>
        <Image
          src={tagGif}
          className={classes.image}
          alt="Use smart tags to automatically group web pages"
        />
      </Box>
      <Box>
        <Typography variant="h4" className={classes.heading}>
          Associate web pages with meetings
        </Typography>
        <Image
          src={meetingGif}
          className={classes.image}
          alt="If you view a web apge during a meeting, it will be associated with the meetings"
        />
      </Box>
      <Box>
        <Typography variant="h4" className={classes.heading}>
          Easily find what you are looking for
        </Typography>
        <Image
          src={pinGif}
          className={classes.image}
          alt="Reorder webpages by clicking the pin icon"
        />
      </Box>
    </Box>
  </StyledContainer>
);
