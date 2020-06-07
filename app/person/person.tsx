import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import { IProps } from '../dashboard';
import Title from '../shared/title';
import DocsForPerson from './docs-for-person';

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
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
}));

interface IPersonProps extends IProps {
  routeId: string | null;
}

const Person = (props: IPersonProps) => {
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const person = props.personDataStore.getPersonByEmail(props.routeId!);
  return (
    <Container maxWidth="lg" className={classes.container}>
      <Title>{person.name || person.emailAddress}</Title>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={9}>
          <Paper className={fixedHeightPaper}>{person.id}</Paper>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <Paper className={fixedHeightPaper}>Other stuff</Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <DocsForPerson {...props} person={person} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Person;
