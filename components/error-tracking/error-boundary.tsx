import Dialog from '@material-ui/core/Dialog';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import React from 'react';
import Catch from './catch';

const ErrorBoundary = Catch((props: any, error?: Error) => {
  const node = error ? (
    <Dialog maxWidth="md" open={true}>
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>Please reload the page. {error.message}
      </Alert>
    </Dialog>
  ) : (
    <React.Fragment>{props.children}</React.Fragment>
  );
  return node;
});

export default ErrorBoundary;
