import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import React from 'react';
import tagGif from '../../public/animations/tag-group.gif';
import meetingGif from '../../public/animations/tag-meeting.gif';
import pinGif from '../../public/animations/tag-nav.gif';
import '../../styles/components/homepage/image-blocks.css';

export const ImageBlocks = () => (
  <Container maxWidth="md">
    <Box
      display="flex"
      flexDirection="column"
      className="image-blocks__section"
      alignItems="center"
      gap={10}
    >
      <Box>
        <Typography variant="h4" className="image-blocks__heading">
          Smart tags automatically group web pages
        </Typography>
        <Image
          src={tagGif}
          className="image-blocks__image"
          alt="Use smart tags to automatically group web pages"
        />
      </Box>
      <Box>
        <Typography variant="h4" className="image-blocks__heading">
          Associate web pages with meetings
        </Typography>
        <Image
          src={meetingGif}
          className="image-blocks__image"
          alt="If you view a web apge during a meeting, it will be associated with the meetings"
        />
      </Box>
      <Box>
        <Typography variant="h4" className="image-blocks__heading">
          Easily find what you are looking for
        </Typography>
        <Image
          src={pinGif}
          className="image-blocks__image"
          alt="Reorder webpages by clicking the pin icon"
        />
      </Box>
    </Box>
  </Container>
);
