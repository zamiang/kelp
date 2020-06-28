import { Grid, Typography } from '@material-ui/core';
import React from 'react';
import { IRouteProps } from '../dashboard';
import PeopleList from '../nav/people-list';
import panelStyles from '../shared/panel-styles';

const People = (props: IRouteProps) => {
  const styles = panelStyles();
  const people = props.personDataStore.getPeople();
  return (
    <Grid item xs={12} className={styles.panel}>
      <Typography variant="h2" color="textPrimary" gutterBottom>
        People
      </Typography>
      <PeopleList people={people} handlePersonClick={props.handlePersonClick} />
    </Grid>
  );
};

export default People;
