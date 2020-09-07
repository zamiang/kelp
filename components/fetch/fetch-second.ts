import { useAsync } from 'react-async-hook';
import fetchDriveActivityForDocumentIds from './fetch-drive-activity';

interface IProps {
  googleDocIds: string[];
}
/**
 * Fetches 2nd layer of information.
 */
const FetchSecond = (props: IProps) => {
  const activityResponse = useAsync(() => fetchDriveActivityForDocumentIds(props.googleDocIds), [
    props.googleDocIds.length,
  ]);
  return {
    driveActivity: activityResponse.result ? activityResponse.result.activity : [],
    refetchDriveActivity: activityResponse.execute,
    isLoading: activityResponse.loading,
  };
};

export default FetchSecond;
