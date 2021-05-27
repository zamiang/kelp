const ErrorTracking = (() => {
  const logErrorInfo = (info: string) => {
    console.info(info);
  };

  const logErrorInRollbar = (error: string) => {
    console.error(error);
  };

  return { logErrorInfo, logErrorInRollbar };
})();

export default ErrorTracking;
