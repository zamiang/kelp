import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { flatten } from 'lodash';
import React from 'react';
import DriveActivityList from '../shared/documents-from-drive-activity';
import { meetingId } from '../store/use-homepage-store';
import { IStore } from '../store/use-store';

const useStyles = makeStyles((theme) => ({
  summary: {
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
  },
}));

const Documents = (props: { store: IStore }) => {
  const classes = useStyles();
  const meeting = await props.store.timeDataStore.getById(meetingId);
  if (!meeting) {
    return null;
  }
  const attendeeIds = (meeting.formattedAttendees || [])
    .filter((attendee) => !attendee.self)
    .map((attendee) => attendee.personId);
  const people = attendeeIds
    .map((id) => props.store.personDataStore.getPersonById(id)!)
    .filter((person) => !!person);

  const driveActivityFromAttendees = flatten(
    people.map((person) => Object.values(person.driveActivity)),
  );
  return (
    <div className={classes.summary}>
      <Typography variant="h6">Documents you may need</Typography>
      <DriveActivityList
        driveActivity={driveActivityFromAttendees}
        docStore={props.store.documentDataStore}
        personStore={props.store.personDataStore}
      />
    </div>
  );
};

export default Documents;
