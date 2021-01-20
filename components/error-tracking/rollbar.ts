import Rollbar from 'rollbar';

const RollbarErrorTracking = (() => {
  console.log(process.env.NODE_ENV, '<<<<<<<<<<<<');
  const RollbarObj = new Rollbar({
    accessToken: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
    captureIp: 'anonymize',
    enabled: process.env.NODE_ENV === 'production',
  });

  const logErrorInfo = (info: string) => {
    RollbarObj.info(info);
  };

  const logErrorInRollbar = (error: string) => {
    throw new Error(error);
  };

  return { logErrorInfo, logErrorInRollbar };
})();

export default RollbarErrorTracking;
