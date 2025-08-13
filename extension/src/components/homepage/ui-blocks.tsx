import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import React from 'react';
import '../../styles/componenui-blocks.css';

const UiBlocks = () => (
  <Container maxWidth="md">
    <Box display="flex" className="ui-blocks__section" alignItems="center" flexWrap="wrap">
      <Box
        flex="1 1 50%"
        sx={{ '@media (max-width: 900px)': { flex: '1 1 100%' } }}
        className="ui-blocks__section-text"
      >
        <Typography variant="h4" className="ui-blocks__heading">
          <div className="ui-blocks__dot"></div>Made for humans
        </Typography>
        <Typography>
          Kelp meets you where you are. It doesn't ask you to change how you organize information or
          collaborate.
        </Typography>
      </Box>
      <Box
        flex="1 1 50%"
        sx={{ '@media (max-width: 900px)': { flex: '1 1 100%' } }}
        className={clsx('ui-blocks__section-image-right-top', 'ui-blocks__grey-container')}
      >
        <img src="images/meeting.svg" style={{ maxHeight: 212, maxWidth: '100%' }} />
      </Box>
    </Box>
  </Container>
);

export default UiBlocks;
