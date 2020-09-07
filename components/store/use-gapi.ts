import { useEffect, useState } from 'react';

const googleAPIRefs = [
  'https://www.googleapis.com/discovery/v1/apis/people/v1/rest',
  'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  'https://www.googleapis.com/discovery/v1/apis/driveactivity/v2/rest',
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
];

const useGAPI = () => {
  const [isLoaded, setStatus] = useState(false);

  useEffect(() => {
    const loadLibraries = async () => {
      await gapi.client.init({
        discoveryDocs: googleAPIRefs,
      });
      setStatus(true);
    };
    gapi.load('client', loadLibraries as any);
  }, []);

  return { isLoaded };
};

export default useGAPI;
