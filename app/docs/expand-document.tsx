import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';
import { uniqBy } from 'lodash';
import React from 'react';
import { IProps } from '../dashboard';
import PersonList from '../shared/person-list';

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

const ExpandedDocument = (props: IProps) => {
  const classes = useStyles();
  const document = props.docDataStore.getByLink('foo')!;
  const activity = props.driveActivityStore.getDriveActivityForDocument(document.link || '') || [];

  const people = uniqBy(activity, 'actorPersonId')
    .filter((activity) => activity.actorPersonId)
    .map((activity) => props.personDataStore.getPersonById(activity.actorPersonId!)!);
  return (
    <div className={classes.container}>
      {document.link && (
        <Link color="secondary" target="_blank" href={document.link}>
          See in Google Drive
        </Link>
      )}
      <Typography variant="h3" color="textPrimary" gutterBottom noWrap>
        {document.name || '(no title)'}
      </Typography>
      {document.updatedAt && (
        <Typography variant="subtitle2" gutterBottom>
          <i>Updated {format(document.updatedAt, 'EEEE, MMMM d p')}</i>
        </Typography>
      )}
      <Grid container spacing={3}>
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
