import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import useRowStyles from '../shared/row-styles';
import { IPerson } from '../store/person-store';

const PersonRow = (props: { selectedPersonId: string | null; person: IPerson }) => {
  const classes = useRowStyles();
  return (
    <ListItem
      button={true}
      className={clsx(
        'ignore-react-onclickoutside',
        classes.row,
        props.selectedPersonId === props.person.id && classes.orangeBackground,
      )}
    >
      <Link href={`?tab=people&slug=${props.person.id}`}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            {props.person.imageUrl ? (
              <Avatar className={classes.avatar} src={props.person.imageUrl} />
            ) : (
              <Avatar className={classes.avatar}>
                {(props.person.name || props.person.id)[0]}
              </Avatar>
            )}
          </Grid>
          <Grid item style={{ flex: 1, overflow: 'hidden' }}>
            <Typography>{props.person.name || props.person.id}</Typography>
          </Grid>
        </Grid>
      </Link>
    </ListItem>
  );
};

export default PersonRow;
