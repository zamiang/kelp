import { useAsyncAbortable } from 'react-async-hook';
import { fetchDriveFilesById } from './fetch-drive-files';

interface IProps {
  readonly missingGoogleDocIds: string[];
  readonly googleOauthToken: string;
  readonly limit: any;
}

const FetchMissingGoogleDocs = (props: IProps) => {
  const missingGoogleDocs = useAsyncAbortable(
    () => fetchDriveFilesById(props.missingGoogleDocIds, props.googleOauthToken, props.limit),
    [props.missingGoogleDocIds.length.toString()] as any,
  );
  return {
    missingDriveFiles: missingGoogleDocs.result ? missingGoogleDocs.result : [],
    missingGoogleDocsLoading: missingGoogleDocs.loading,
    missingGoogleDocsError: missingGoogleDocs.error,
  };
};

export default FetchMissingGoogleDocs;
