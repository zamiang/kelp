import { useAsyncAbortable } from 'react-async-hook';
import fetchDriveActivityForDocumentIds from './fetch-drive-activity';

interface IProps {
  readonly googleDocIds: string[];
  readonly isLoading: boolean;
}
/**
 * Fetches 2nd layer of information.
 */
const FetchSecond = (props: IProps) => {
  // The goal is to only fetch if loading is false
  console.log(props.googleDocIds.length.toString(), props.isLoading, 'watch this!');
  const activityResponse = useAsyncAbortable(
    () => fetchDriveActivityForDocumentIds(props.isLoading ? [] : props.googleDocIds),
    [props.isLoading, props.googleDocIds.length.toString()] as any, // unsure why this type is a failure
  );
  return {
    driveActivity: activityResponse.result ? activityResponse.result.activity : [],
    refetchDriveActivity: activityResponse.execute,
    isLoading: activityResponse.loading,
    error: activityResponse.error,
  };
};

export default FetchSecond;
