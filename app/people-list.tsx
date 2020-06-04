import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import React from 'react';

interface IProps {
  people?:
    | {
        id: string;
        name?: string;
      }[]
    | null;
}

const People = (props: IProps) => {
  const peopleHtml = (props.people || []).map((person) => (
    <React.Fragment key={person.id}>
      <Divider />
      <List>{person.name}</List>
    </React.Fragment>
  ));

  return <React.Fragment>{peopleHtml}</React.Fragment>;
};

export default People;
