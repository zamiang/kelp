import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import { uniqBy } from 'lodash';
import React from 'react';
import useExpandStyles from '../shared/expand-styles';
import PersonList from '../shared/person-list';
import { IStore } from '../store/use-store';

const ExpandedDocument = (props: IStore & { documentId: string }) => {
  const classes = useExpandStyles();
  const document = props.docDataStore.getByLink(props.documentId);
  if (!document) {
    return null;
  }
  const activity = props.driveActivityStore.getDriveActivityForDocument(document.link || '') || [];

  const people = uniqBy(activity, 'actorPersonId')
    .filter((activity) => activity.actorPersonId)
    .map((activity) => props.personDataStore.getPersonById(activity.actorPersonId!)!);
  return (
    <div className={classes.container}>
      {document.link && (
        <MuiLink className={classes.link} target="_blank" href={document.link}>
          See in Google Drive
        </MuiLink>
      )}
      <Typography variant="h3" color="textPrimary" gutterBottom noWrap>
        {document.name || '(no title)'}
      </Typography>
      {document.updatedAt && (
        <Typography variant="subtitle2" gutterBottom>
          <i>Updated {format(document.updatedAt, 'EEEE, MMMM d p')}</i>
        </Typography>
      )}
      <Grid container spacing={3} className={classes.content}>
        <Grid item xs={7}>
          {people.length > 0 && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                People
              </Typography>
              <PersonList people={people} personStore={props.personDataStore} />
            </React.Fragment>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default ExpandedDocument;
