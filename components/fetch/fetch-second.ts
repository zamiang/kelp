import { useAsyncAbortable } from 'react-async-hook';
import fetchDriveActivityForDocumentIds from './fetch-drive-activity';

interface IProps {
  googleDocIds: string[];
  isLoading: boolean;
}
/**
 * Fetches 2nd layer of information.
 */
const FetchSecond = (props: IProps) => {
  const activityResponse = useAsyncAbortable(
    () => fetchDriveActivityForDocumentIds(props.googleDocIds),
    [props.googleDocIds.length] as any, // unsure why this type is a failure
  );
  return {
    driveActivity: activityResponse.result ? activityResponse.result.activity : [],
    refetchDriveActivity: activityResponse.execute,
    isLoading: activityResponse.loading,
    error: activityResponse.error,
  };
};

export default FetchSecond;
