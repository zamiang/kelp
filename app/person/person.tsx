import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { IProps } from '../dashboard';
import DriveActivityList from '../docs/drive-activity-list';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(4),
    background: theme.palette.primary.main,
  },
  title: {
    paddingTop: 5,
    paddingLeft: theme.spacing(2),
  },
  avatar: {
    height: 77,
    width: 77,
  },
}));

interface IPersonProps extends IProps {
  routeId: string | null;
}

const Person = (props: IPersonProps) => {
  const classes = useStyles();
  const person = props.personDataStore.getPersonByEmail(props.routeId!);
  return (
    <Grid item xs={12} className={classes.container}>
      <Box flexDirection="row" alignItems="flex-start" display="flex">
        {person.imageUrl ? (
          <Avatar className={classes.avatar} src={person.imageUrl} />
        ) : (
          <Avatar className={classes.avatar}>{(person.name || person.id)[0]}</Avatar>
        )}
        <Typography className={classes.title} variant="h2" color="textPrimary" gutterBottom>
          {person.name || person.emailAddress}
        </Typography>
      </Box>
      <DriveActivityList
        driveActivity={person.driveActivity}
        personStore={props.personDataStore}
        docStore={props.docDataStore}
      />
    </Grid>
  );
};

export default Person;
