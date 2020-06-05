import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import { IProps } from './dashboard';
import Docs from './docs';
import Title from './title';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
}));

interface IPersonProps extends IProps {
  personEmail: string;
}

const Person = (props: IPersonProps) => {
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const person = props.personDataStore.getPersonByEmail(props.personEmail);
  return (
    <React.Fragment>
      <Title>{person.name || person.emailAddress}</Title>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={9}>
          <Paper className={fixedHeightPaper}>{props.personEmail}</Paper>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <Paper className={fixedHeightPaper}>Other stuff</Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Docs {...props} />
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default Person;
