import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
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
        <Grid container spacing={1}>
          <Grid item>
            <ListItemIcon>
              {props.person.imageUrl ? (
                <Avatar className={classes.avatar} src={props.person.imageUrl} />
              ) : (
                <Avatar className={classes.avatar}>
                  {(props.person.name || props.person.id)[0]}
                </Avatar>
              )}
            </ListItemIcon>
          </Grid>
          <Grid item style={{ flex: 1, overflow: 'hidden' }}>
            <ListItemText primary={props.person.name || props.person.id} />
          </Grid>
        </Grid>
      </Link>
    </ListItem>
  );
};

export default PersonRow;
