import { useAsyncAbortable } from 'react-async-hook';
import { fetchDriveFilesById } from './fetch-drive-files';

interface IProps {
  readonly missingGoogleDocIds: string[];
  readonly googleOauthToken: string;
}

const FetchFourth = (props: IProps) => {
  const missingGoogleDocs = useAsyncAbortable(
    () => fetchDriveFilesById(props.missingGoogleDocIds, props.googleOauthToken),
    [props.missingGoogleDocIds.length.toString()] as any,
  );
  return {
    missingDriveFiles: missingGoogleDocs.result ? missingGoogleDocs.result : [],
    refetchMissingDriveFiles: missingGoogleDocs.execute,
    missingGoogleDocsLoading: missingGoogleDocs.loading,
    error: missingGoogleDocs.error,
  };
};

export default FetchFourth;
