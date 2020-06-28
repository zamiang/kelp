import { Avatar, Grid, Typography } from '@material-ui/core';
import { sortBy } from 'lodash';
import React from 'react';
import { IPerson } from '../store/person-store';

interface IProps {
  handlePersonClick: (id: string) => void;
  people?: IPerson[] | null;
}

const PeopleRow = (people: IPerson[], handlePersonClick: (id: string) => void) =>
  people.map((person) => (
    <Grid item xs={12} key={person.id} onClick={() => handlePersonClick(person.emailAddress)}>
      <Grid container alignItems="center">
        <Grid item xs={2}>
          <Avatar style={{ height: 24, width: 24 }} src={person.imageUrl || ''}>
            {(person.name || person.id)[0]}
          </Avatar>
        </Grid>
        <Grid item xs zeroMinWidth>
          <Typography variant="subtitle2" noWrap>
            {person.name || person.id}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  ));

/**
const PeopleGrid = (people: IPerson[], handlePersonClick: (id: string) => void) =>
  chunk(people, ROW_COUNT).map((personRow, index) => (
    <Grid key={index} container item xs={12} spacing={3}>
      {PeopleRow(personRow, handlePersonClick)}
    </Grid>
  ));
 */
const PeopleList = (props: IProps) => (
  <Grid container spacing={2}>
    {PeopleRow(props.people ? sortBy(props.people, 'name') : [], props.handlePersonClick)}
  </Grid>
);

export default PeopleList;
