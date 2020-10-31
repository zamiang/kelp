import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import PersonDataStore, { IPerson } from '../store/person-store';

interface IProps {
  people: IPerson[];
  personStore: PersonDataStore;
}

const useStyles = makeStyles(() => ({
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
  },
}));

const PersonRow = (props: IProps) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      {props.people.map((person) => {
        if (!person) {
          return null;
        }
        return (
          <ListItem button={true} key={person.id} className={clsx(classes.person)}>
            <Link href={`?tab=people&slug=${person.id}`}>
              <Grid container alignItems="center" spacing={1} wrap="nowrap">
                <Grid item>
                  <Avatar
                    style={{ height: 24, width: 24 }}
                    src={person.imageUrl || ''}
                    className={classes.avatar}
                  >
                    {(person.name || person.id)[0]}
                  </Avatar>
                </Grid>
                <Grid item xs={10}>
                  <Typography variant="subtitle2" noWrap>
                    {person.name || person.id}
                  </Typography>
                </Grid>
              </Grid>
            </Link>
          </ListItem>
        );
      })}
    </React.Fragment>
  );
};

const PersonList = (props: IProps) => (
  <Grid container spacing={2}>
    <PersonRow {...props} />
  </Grid>
);

export default PersonList;
