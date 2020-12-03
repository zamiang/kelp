import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Link from 'next/link';
import React from 'react';
import { IPerson } from '../store/person-store';

interface IProps {
  people: IPerson[];
  shouldDisplayNone?: boolean;
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
  if (props.people.filter((p) => !p.isCurrentUser).length < 1) {
    if (props.shouldDisplayNone) {
      return <Typography>None</Typography>;
    }
    return null;
  }
  return (
    <AvatarGroup max={5}>
      {props.people.map((person) => {
        if (!person) {
          return null;
        }
        if (person.isCurrentUser) {
          return null;
        }
        return (
          <Avatar key={person.id} src={person.imageUrl || ''} className={classes.avatar}>
            <Link key={person.id} href={`?tab=people&slug=${person.id}`}>
              {(person.name || person.id)[0]}
            </Link>
          </Avatar>
        );
      })}
    </AvatarGroup>
  );
};

export default AvatarList;
