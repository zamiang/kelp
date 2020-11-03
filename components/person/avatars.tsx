import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Link from 'next/link';
import React from 'react';
import { IPerson } from '../store/person-store';

const usePersonStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
}));

const Avatars = (props: { people: IPerson[] }) => {
  const classes = usePersonStyles();
  return (
    <React.Fragment>
      {props.people.map((person) => {
        if (!person) {
          return null;
        }
        return (
          <Grid item key={person.id}>
            <Link href={`?tab=people&slug=${person.id}`} key={person.id}>
              <Avatar
                style={{ height: 24, width: 24 }}
                src={person.imageUrl || ''}
                className={classes.avatar}
              >
                {(person.name || person.id)[0]}
              </Avatar>
            </Link>
          </Grid>
        );
      })}
    </React.Fragment>
  );
};

export default Avatars;
