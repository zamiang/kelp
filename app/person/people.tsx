import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { IProps } from '../dashboard';
import PeopleList from '../nav/people-list';
import panelStyles from '../shared/panel-styles';

const People = (props: IProps) => {
  const styles = panelStyles();
  const people = props.personDataStore.getPeople();
  return (
    <Grid item xs={12} className={styles.panel}>
      <Typography variant="h2" color="textPrimary" gutterBottom>
        People
      </Typography>
      <List>
        <PeopleList people={people} handlePersonClick={props.handlePersonClick} />
      </List>
    </Grid>
  );
};

export default People;
