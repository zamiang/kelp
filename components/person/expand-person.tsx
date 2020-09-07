import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import DriveActivity from '../shared/drive-activity';
import { IStore } from '../store/use-store';

const useStyles = makeStyles((theme) => ({
  title: {
    paddingTop: 5,
    paddingLeft: theme.spacing(2),
  },
  container: {
    padding: theme.spacing(5),
    margin: 0,
    width: 'auto',
  },
  avatar: {
    height: 77,
    width: 77,
  },
  smallHeading: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    fontSize: theme.typography.body2.fontSize,
    textTransform: 'uppercase',
  },
}));

const ExpandPerson = (props: IStore & { personId: string }) => {
  const classes = useStyles();
  const person = props.personDataStore.getPersonById(props.personId);

  if (!person) {
    return null;
  }
  return (
    <div className={classes.container}>
      <Box flexDirection="row" alignItems="flex-start" display="flex">
        <Avatar className={classes.avatar} src={person.imageUrl || ''}>
          {(person.name || person.id)[0]}
        </Avatar>
        <Typography className={classes.title} variant="h3" color="textPrimary" gutterBottom noWrap>
          {props.personDataStore.getPersonDisplayName(person)}
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={7}>
          {person.driveActivityIds.length > 0 && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Active Documents
              </Typography>
              <DriveActivity
                driveActivityIds={person.driveActivityIds}
                driveActivityStore={props.driveActivityStore}
                personStore={props.personDataStore}
                docStore={props.docDataStore}
              />
            </React.Fragment>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default ExpandPerson;
