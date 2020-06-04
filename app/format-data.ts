import { IProps as FetchProps, formattedEmail } from './fetch-second';

interface IProps extends FetchProps {
  emails?: formattedEmail[];
}

const FormatData = (props: IProps) => {
  const peopleWithItems = props.personStore;
  const eventsWithItems = {};

  //
  // props.driveActivity
  // props.calendarEvents

  return { peopleWithItems, eventsWithItems };
};

export default FormatData;
