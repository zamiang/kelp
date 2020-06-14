import Link from '@material-ui/core/Link';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import { format } from 'date-fns';
import { uniqBy } from 'lodash';
import React from 'react';
import { IFormattedDriveActivity } from '../fetch/fetch-first';
import DocDataStore from '../store/doc-store';
import DriveActivityDataStore from '../store/drive-activity-store';
import PersonDataStore from '../store/person-store';

const Activity = (props: {
  activity: IFormattedDriveActivity;
  personStore: PersonDataStore;
  docStore: DocDataStore;
}) => {
  const doc = props.docStore.getByLink(props.activity.link!);
  return (
    <TableRow hover>
      <TableCell style={{ width: 40, paddingRight: 16 }}>
        <InsertDriveFileIcon />
      </TableCell>
      <TableCell>
        <Link color="textPrimary" target="_blank" href={doc.link || ''}>
          <ListItemText primary={doc.name} />
        </Link>
      </TableCell>
      <TableCell align="right">
        <Typography variant="caption" color="textSecondary">
          Last updated on {format(new Date(doc.updatedAt!), "MMMM do, yyyy 'at' hh:mm a")}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

const DriveActivityList = (props: {
  driveActivityIds: string[];
  driveActivityStore: DriveActivityDataStore;
  personStore: PersonDataStore;
  docStore: DocDataStore;
}) => {
  const driveActivity = props.driveActivityIds.map((id) => props.driveActivityStore.getById(id));
  const actions = uniqBy(
    driveActivity.filter((action) => action.link),
    'link',
  );
  if (actions.length < 1) {
    return null;
  }
  return (
    <React.Fragment>
      <ListSubheader inset>Active Documents</ListSubheader>
      <Table size="small">
        <TableBody>
          {actions.map((action) => (
            <Activity
              key={action.id}
              activity={action}
              personStore={props.personStore}
              docStore={props.docStore}
            />
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
};

export default DriveActivityList;
