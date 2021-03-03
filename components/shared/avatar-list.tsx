import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { IPerson } from '../store/models/person-model';

interface IProps {
  people: IPerson[];
  maxAvatars?: number;
}

const useStyles = makeStyles((theme) => ({
  person: {
    transition: 'background 0.3s, border-color 0.3s, opacity 0.3s',
    opacity: 1,
    '& > *': {
      borderBottom: 'unset',
    },
    '&.MuiListItem-button:hover': {
      opacity: 0.8,
    },
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    cursor: 'pointer',
    opacity: 1,
    transition: 'opacity 0.3s',
    borderColor: theme.palette.background.paper,
    '&:hover': {
      opacity: 0.9,
    },
  },
}));

const AvatarList = (props: IProps) => {
  const classes = useStyles();
  const router = useHistory();
  if (props.people.filter((p) => !p.isCurrentUser).length < 1) {
    return null;
  }
  return (
    <AvatarGroup max={props.maxAvatars || 5}>
      {props.people.map((person) => {
        if (!person) {
          return null;
        }
        return (
          <Tooltip key={person.id} title={person.name || person.emailAddresses}>
            <Avatar
              onClick={() => router.push(`/people/${encodeURIComponent(person.id)}`)}
              src={person.imageUrl || ''}
              className={classes.avatar}
            >
              {(person.name || person.id)[0]}
            </Avatar>
          </Tooltip>
        );
      })}
    </AvatarGroup>
  );
};

export default AvatarList;
