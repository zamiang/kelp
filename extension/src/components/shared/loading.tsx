import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React from 'react';

const PREFIX = 'Loading';

const classes = {
  backdrop: `${PREFIX}-backdrop`,
};

const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
  [`&.${classes.backdrop}`]: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

const Loading = (props: { isOpen: boolean; message: string }) => (
  <StyledBackdrop className={`${classes.backdrop} loading__backdrop`} open={props.isOpen}>
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <Box className="loading__progress-container">
        <CircularProgress color="inherit" />
      </Box>
      <Box>
        <Typography variant="h5">{props.message}</Typography>
      </Box>
    </Box>
  </StyledBackdrop>
);

export default Loading;
