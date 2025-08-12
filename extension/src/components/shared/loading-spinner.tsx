import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import '../../styles/components/shared/loading-spinner.css';

export const LoadingSpinner = () => (
  <div className="loading-spinner">
    <CircularProgress color="inherit" />
  </div>
);
