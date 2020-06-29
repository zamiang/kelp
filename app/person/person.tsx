import { Avatar, Box, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { IRouteProps } from '../dashboard';
import DriveActivityList from '../docs/drive-activity-list';
import panelStyles from '../shared/panel-styles';

const useStyles = makeStyles((theme) => ({
  title: {
    paddingTop: 5,
    paddingLeft: theme.spacing(2),
  },
  avatar: {
    height: 77,
    width: 77,
  },
}));

const Person = (props: IRouteProps) => {
  const classes = useStyles();
  const person = props.personDataStore.getPersonByEmail(props.routeId!);
  const panelClasses = panelStyles();
  if (!person) {
    return null;
  }
  return (
    <Grid item xs={12} className={panelClasses.panel}>
      <Box flexDirection="row" alignItems="flex-start" display="flex">
        {person.imageUrl ? (
          <Avatar className={classes.avatar} src={person.imageUrl} />
        ) : (
          <Avatar className={classes.avatar}>{(person.name || person.id)[0]}</Avatar>
        )}
        <Typography className={classes.title} variant="h2" color="textPrimary" gutterBottom>
          {props.personDataStore.getPersonDisplayName(person)}
        </Typography>
      </Box>
      <DriveActivityList
        driveActivityIds={person.driveActivityIds}
        driveActivityStore={props.driveActivityStore}
        personStore={props.personDataStore}
        docStore={props.docDataStore}
      />
    </Grid>
  );
};

export default Person;
