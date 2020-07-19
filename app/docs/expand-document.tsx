import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';
import { uniqBy } from 'lodash';
import React from 'react';
import PersonList from '../shared/person-list';
import DocDataStore, { IDoc } from '../store/doc-store';
import DriveActivityDataStore from '../store/drive-activity-store';
import EmailDataStore from '../store/email-store';
import PersonDataStore from '../store/person-store';

const useStyles = makeStyles((theme) => ({
  // todo move into theme
  container: {
    padding: theme.spacing(5),
    margin: 0,
    width: 'auto',
  },
  heading: {
    borderBottom: `2px solid ${theme.palette.secondary.main}`,
    marginBottom: theme.spacing(2),
    display: 'inline-block',
    marginLeft: theme.spacing(1),
  },
  smallHeading: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    fontSize: theme.typography.body2.fontSize,
    textTransform: 'uppercase',
  },
}));

const ExpandedDocument = (props: {
  document: IDoc;
  personStore: PersonDataStore;
  docStore: DocDataStore;
  driveActivityStore: DriveActivityDataStore;
  emailStore: EmailDataStore;
  handlePersonClick: (email?: string) => void;
}) => {
  const classes = useStyles();
  const activity =
    props.driveActivityStore.getDriveActivityForDocument(props.document.link || '') || [];

  const people = uniqBy(activity, 'actorPersonId')
    .filter((activity) => activity.actorPersonId)
    .map((activity) => props.personStore.getPersonById(activity.actorPersonId!)!);
  return (
    <div className={classes.container}>
      {props.document.link && (
        <Link color="secondary" target="_blank" href={props.document.link}>
          See in Google Drive
        </Link>
      )}
      <Typography variant="h3" color="textPrimary" gutterBottom noWrap>
        {props.document.name || '(no title)'}
      </Typography>
      {props.document.updatedAt && (
        <Typography variant="subtitle2" gutterBottom>
          <i>Updated {format(props.document.updatedAt, 'EEEE, MMMM d p')}</i>
        </Typography>
      )}
      <Grid container spacing={3}>
        <Grid item xs={7}>
          {people.length > 0 && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                People
              </Typography>
              <PersonList
                handlePersonClick={props.handlePersonClick}
                people={people}
                personStore={props.personStore}
              />
            </React.Fragment>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default ExpandedDocument;
