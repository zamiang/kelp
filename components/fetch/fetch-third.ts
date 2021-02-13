import { useAsyncAbortable } from 'react-async-hook';
import { batchFetchPeople } from './fetch-people';

interface IProps {
  readonly peopleIds: string[];
  readonly isLoading: boolean;
}

/**
 * Fetches people
 * This layer requires the person store to be completely setup before fetching
 */
const FetchThird = (props: IProps) => {
  // this has a sideffect of updating the store
  const peopleResponse = useAsyncAbortable(
    () => batchFetchPeople(props.isLoading ? [] : props.peopleIds),
    [props.isLoading, props.peopleIds.length.toString()] as any,
  );
  const error = peopleResponse ? peopleResponse.error : undefined;

  return {
    isLoading: peopleResponse.loading,
    error,
    personList: peopleResponse.result ? peopleResponse.result : [],
    refetchPersonList: peopleResponse.execute,
  };
};

export default FetchThird;
