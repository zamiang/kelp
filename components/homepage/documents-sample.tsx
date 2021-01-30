import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
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
  const [driveActivity, setDriveActivity] = useState<IFormattedDriveActivity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (meetingId) {
        // TODO: Set drive activity for document
        setDriveActivity([]);
      }
    };
    void fetchData();
  }, [meetingId]);

  return (
    <div className={classes.summary}>
      <Typography variant="h6">Documents you may need</Typography>
      <DriveActivityList
        driveActivity={driveActivity}
        docStore={props.store.documentDataStore}
        personStore={props.store.personDataStore}
      />
    </div>
  );
};

export default Documents;
