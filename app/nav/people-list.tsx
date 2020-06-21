import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { chunk, sortBy } from 'lodash';
import React from 'react';
import { IPerson } from '../store/person-store';

const ROW_COUNT = 3;

interface IProps {
  handlePersonClick: (id: string) => void;
  people?: IPerson[] | null;
}

const renderPeopleRow = (people: IPerson[], handlePersonClick: (id: string) => void) =>
  people.map((person) => (
    <Grid item xs={4} key={person.id} onClick={() => handlePersonClick(person.emailAddress)}>
      <ListItem button>
        <ListItemIcon>
          {person.imageUrl ? (
            <Avatar src={person.imageUrl} />
          ) : (
            <Avatar>{(person.name || person.id)[0]}</Avatar>
          )}
        </ListItemIcon>
        <ListItemText primary={person.name || person.id} />
      </ListItem>
    </Grid>
  ));

const renderPeopleGrid = (people: IPerson[], handlePersonClick: (id: string) => void) =>
  chunk(people, ROW_COUNT).map((personRow, index) => (
    <Grid key={index} container item xs={12} spacing={3}>
      {renderPeopleRow(personRow, handlePersonClick)}
    </Grid>
  ));

const PeopleList = (props: IProps) => (
  <Grid container spacing={1}>
    {renderPeopleGrid(props.people ? sortBy(props.people, 'name') : [], props.handlePersonClick)}
  </Grid>
);

export default PeopleList;
