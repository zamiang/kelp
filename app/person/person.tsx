import { Avatar, Box, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { IRouteProps } from '../dashboard';
import DriveActivity from '../shared/drive-activity';
import { IPerson } from '../store/person-store';

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

const Person = (props: IRouteProps & { person: IPerson }) => {
  const classes = useStyles();
  if (!props.person) {
    return null;
  }
  return (
    <div className={classes.container}>
      <Box flexDirection="row" alignItems="flex-start" display="flex">
        <Avatar className={classes.avatar} src={props.person.imageUrl || ''}>
          {(props.person.name || props.person.id)[0]}
        </Avatar>
        <Typography className={classes.title} variant="h3" color="textPrimary" gutterBottom>
          {props.personDataStore.getPersonDisplayName(props.person)}
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={7}>
          <Typography variant="h6" className={classes.smallHeading}>
            Active Documents
          </Typography>
          <DriveActivity
            driveActivityIds={props.person.driveActivityIds}
            driveActivityStore={props.driveActivityStore}
            personStore={props.personDataStore}
            docStore={props.docDataStore}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default Person;
