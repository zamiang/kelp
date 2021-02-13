import { useAsyncAbortable } from 'react-async-hook';
import fetchDriveActivityForDocumentIds from './fetch-drive-activity';
import { fetchDriveFilesById } from './fetch-drive-files';

interface IProps {
  readonly googleDocIds: string[];
  readonly missingGoogleDocIds: string[];
  readonly isLoading: boolean;
}
/**
 * Fetches 2nd layer of information.
 */
const FetchSecond = (props: IProps) => {
  // The goal is to only fetch if loading is false
  const activityResponse = useAsyncAbortable(
    () => fetchDriveActivityForDocumentIds(props.isLoading ? [] : props.googleDocIds),
    [props.isLoading, props.googleDocIds.length.toString()] as any, // unsure why this type is a failure
  );
  const missingGoogleDocs = useAsyncAbortable(
    () => fetchDriveFilesById(props.isLoading ? [] : props.missingGoogleDocIds),
    [props.isLoading, props.googleDocIds.length.toString()] as any,
  );
  return {
    missingDriveFiles: missingGoogleDocs.result ? missingGoogleDocs.result : [],
    driveActivity: activityResponse.result ? activityResponse.result.activity : [],
    refetchDriveActivity: activityResponse.execute,
    isLoading: missingGoogleDocs.loading || activityResponse.loading,
    error: activityResponse.error || activityResponse.error,
  };
};

export default FetchSecond;
