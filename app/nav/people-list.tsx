import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import React from 'react';
import { IPerson } from '../store/person-store';

interface IProps {
  handlePersonClick: (id: string) => void;
  people?: IPerson[] | null;
}

const People = (props: IProps) => {
  const peopleHtml = (props.people || []).map((person) => (
    <ListItem button key={person.id} onClick={() => props.handlePersonClick(person.emailAddress)}>
      <ListItemIcon>
        {person.imageUrl ? (
          <Avatar src={person.imageUrl} />
        ) : (
          <Avatar>{(person.name || person.id)[0]}</Avatar>
        )}
      </ListItemIcon>
      <ListItemText primary={person.name || person.id} />
    </ListItem>
  ));

  return (
    <div>
      <ListSubheader inset>People</ListSubheader>
      {peopleHtml}
    </div>
  );
};

export default People;
