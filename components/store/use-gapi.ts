import { useEffect, useState } from 'react';

const useGAPI = () => {
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const loadLibraries = async () => {
      setStatus('loading');
      await gapi.client.init({
        discoveryDocs: [
          'https://www.googleapis.com/discovery/v1/apis/people/v1/rest',
          'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
          'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
          'https://www.googleapis.com/discovery/v1/apis/driveactivity/v2/rest',
          'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
        ],
      });
      setStatus('loaded');
    };
    if (status === 'idle') {
      gapi.load('client', loadLibraries as any);
    }
  });

  return { gapiStatus: status };
};

export default useGAPI;
