import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import AssignmentIcon from '@material-ui/icons/Assignment';
import React from 'react';

interface IProps {
  handlePersonClick: (id: string) => void;
  people?:
    | {
        id: string;
        name?: string;
      }[]
    | null;
}

const People = (props: IProps) => {
  const peopleHtml = (props.people || []).map((person) => (
    <ListItem button key={person.id} onClick={() => props.handlePersonClick(person.id)}>
      <ListItemIcon>
        <AssignmentIcon />
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
