const ErrorTracking = (() => {
  const logErrorInfo = (info: string) => {
    console.info(info);
  };

  const logError = (error: any) => {
    console.error(error);
  };

  return { logErrorInfo, logError };
})();

export default ErrorTracking;
