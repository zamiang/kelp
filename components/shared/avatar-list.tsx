import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Link from 'next/link';
import React from 'react';
import PersonDataStore, { IPerson } from '../store/person-store';

interface IProps {
  people: IPerson[];
  personStore: PersonDataStore;
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
    '&:hover': {
      opacity: 0.6,
    },
  },
}));

const AvatarRow = (props: IProps) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      {props.people.map((person) => {
        if (!person) {
          return null;
        }
        if (person.isCurrentUser) {
          return null;
        }
        return (
          <Link key={person.id} href={`?tab=people&slug=${person.id}`}>
            <Grid item>
              <Avatar
                style={{ height: 32, width: 32 }}
                src={person.imageUrl || ''}
                className={classes.avatar}
              >
                {(person.name || person.id)[0]}
              </Avatar>
            </Grid>
          </Link>
        );
      })}
    </React.Fragment>
  );
};

const AvatarList = (props: IProps) => {
  if (props.people.filter((p) => !p.isCurrentUser).length < 1) {
    return <Typography>None</Typography>;
  }
  return (
    <Grid container spacing={1}>
      <AvatarRow {...props} />
    </Grid>
  );
};

export default AvatarList;
