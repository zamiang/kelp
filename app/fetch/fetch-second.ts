import { useAsync } from 'react-async-hook';
import fetchDriveActivityForDocumentIds from './fetch-drive-activity';

export interface IProps {
  googleDocIds: string[];
  accessToken: string;
}
/**
 * Fetches 2nd layer of information.
 */
const FetchSecond = (props: IProps) => {
  const activityResponse = useAsync(() => fetchDriveActivityForDocumentIds(props.googleDocIds), [
    props.accessToken,
  ]);
  return {
    driveActivity: activityResponse.result ? activityResponse.result.activity : [],
    isLoading: activityResponse.loading,
  };
};

export default FetchSecond;
