import React from 'react';
import ErrorTracking from './error-tracking';

interface CatchState {
  error: Error | undefined;
}

export default function Catch(component: any, errorHandler?: any) {
  return class CatchErrorBoundary extends React.Component<any, CatchState> {
    constructor(props: any) {
      super(props);
      this.state = {
        error: undefined,
      };
    }

    static getDerivedStateFromError(error: Error) {
      return { error };
    }

    componentDidCatch(error: any, info: any) {
      if (errorHandler) {
        ErrorTracking.logErrorInfo(info);
        ErrorTracking.logError(error);
        errorHandler(error, info);
      }
    }

    render() {
      const { error } = this.state;
      return component(this.props, error);
    }
  };
}
