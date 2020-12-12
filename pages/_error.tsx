import React from 'react';
import Rollbar from 'rollbar';

function Error({ statusCode }: any) {
  return (
    <p>
      {statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}
    </p>
  );
}

Error.getInitialProps = ({ req, res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  // Only require Rollbar and report error if we're on the server
  if (!(process as any).browser) {
    console.log('Reporting error to Rollbar...');
    const rollbar = new Rollbar({
      accessToken: process.env.ROLLBAR_SERVER_TOKEN,
      environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
      captureIp: 'anonymize',
      captureUncaught: true,
      captureUnhandledRejections: true,
    });

    rollbar.error(err, req, (rollbarError: any) => {
      if (rollbarError) {
        console.error('Rollbar error reporting failed:');
        console.error(rollbarError);
        return;
      }
      console.log('Reported error to Rollbar');
    });
  }
  return { statusCode };
};

export default Error;
