import { useAsyncAbortable } from 'react-async-hook';
import { fetchDriveFilesById } from './fetch-drive-files';

interface IProps {
  readonly missingGoogleDocIds: string[];
  readonly isLoading: boolean;
}
/**
 * Fetches 4th layer of information.
 */
const FetchFourth = (props: IProps) => {
  // The goal is to only fetch if loading is false
  console.log(props.missingGoogleDocIds.length.toString(), props.isLoading, 'watch this!');
  const missingGoogleDocs = useAsyncAbortable(
    () => fetchDriveFilesById(props.isLoading ? [] : props.missingGoogleDocIds),
    [props.isLoading, props.missingGoogleDocIds.length.toString()] as any,
  );
  return {
    missingDriveFiles: missingGoogleDocs.result ? missingGoogleDocs.result : [],
    refetchMissingDriveFiles: missingGoogleDocs.execute,
    isLoading: missingGoogleDocs.loading,
    error: missingGoogleDocs.error,
  };
};

export default FetchFourth;
