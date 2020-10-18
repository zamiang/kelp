import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import { uniqBy } from 'lodash';
import React from 'react';
import useExpandStyles from '../shared/expand-styles';
import PersonList from '../shared/person-list';
import { IPerson } from '../store/person-store';
import { IStore } from '../store/use-store';

const ExpandedDocument = (props: IStore & { documentId: string }) => {
  const classes = useExpandStyles();
  const document = props.docDataStore.getByLink(props.documentId);
  if (!document) {
    return null;
  }
  const activity = props.driveActivityStore.getDriveActivityForDocument(document.link || '') || [];
  const people = uniqBy(activity, 'actorPersonId')
    .filter((activity) => !!activity.actorPersonId)
    .map((activity) => props.personDataStore.getPersonById(activity.actorPersonId!))
    .filter((person) => person && person.id) as IPerson[];
  return (
    <div className={classes.container}>
      {document.link && (
        <MuiLink className={classes.link} target="_blank" href={document.link}>
          See in Google Drive
        </MuiLink>
      )}
      <Typography variant="h3" color="textPrimary" gutterBottom>
        {document.name || '(no title)'}
      </Typography>
      <Grid container spacing={3} className={classes.content}>
        <Grid item sm={7}></Grid>
        <Grid item sm={5}>
          {document.updatedAt && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Last Edited
              </Typography>
              <div>{format(document.updatedAt, 'EEEE, MMMM d p')}</div>
            </React.Fragment>
          )}
          {people.length > 0 && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Participants
              </Typography>
              <PersonList personStore={props.personDataStore} people={people} />
            </React.Fragment>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default ExpandedDocument;
