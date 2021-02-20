import { useAsyncAbortable } from 'react-async-hook';
import fetchDriveActivityForDocumentIds from './fetch-drive-activity';

interface IProps {
  readonly googleDocIds: string[];
  readonly googleOauthToken: string;
}
/**
 * Fetches 2nd layer of information.
 */
const FetchDriveActivity = (props: IProps) => {
  console.log('fetching drive activity', props.googleDocIds);
  // The goal is to only fetch if loading is false
  const activityResponse = useAsyncAbortable(
    () => fetchDriveActivityForDocumentIds(props.googleDocIds, props.googleOauthToken),
    [props.googleDocIds.length.toString()] as any, // unsure why this type is a failure
  );
  return {
    driveActivity: activityResponse.result ? activityResponse.result.activity : [],
    refetchDriveActivity: activityResponse.execute,
    driveActivityLoading: activityResponse.loading,
    error: activityResponse.error,
  };
};

export default FetchDriveActivity;
