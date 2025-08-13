import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';
import '../../styles/components/shared/loading.css';

const Loading = (props: { isOpen: boolean; message: string }) => (
  <Backdrop className="loading-backdrop loading__backdrop" open={props.isOpen}>
    <div className="loading-content">
      <Box className="loading__progress-container">
        <CircularProgress color="inherit" />
      </Box>
      <Box>
        <Typography variant="h5" className="loading-message">
          {props.message}
        </Typography>
      </Box>
    </div>
  </Backdrop>
);

export default Loading;
