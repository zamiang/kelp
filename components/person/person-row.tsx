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
import { IStore } from '../store/use-store';

const PersonRow = (
  props: {
    selectedPersonId: string | null;
    person: IPerson;
  } & IStore,
) => {
  const rowStyles = useRowStyles();
  return (
    <ListItem
      button={true}
      className={clsx(
        rowStyles.row,
        props.selectedPersonId === props.person.id && rowStyles.rowPrimaryMain,
      )}
    >
      <Link href={`?tab=people&slug=${props.person.id}`}>
        <Grid container spacing={1}>
          <Grid
            item
            className={clsx(
              rowStyles.border,
              rowStyles.borderSecondaryMain,
              props.selectedPersonId === props.person.id && rowStyles.borderInfoMain,
            )}
          ></Grid>
          <Grid item>
            <ListItemIcon>
              {props.person.imageUrl ? (
                <Avatar src={props.person.imageUrl} />
              ) : (
                <Avatar>{(props.person.name || props.person.id)[0]}</Avatar>
              )}
            </ListItemIcon>
          </Grid>
          <Grid item style={{ flex: 1 }}>
            <ListItemText primary={props.person.name || props.person.id} />
          </Grid>
        </Grid>
      </Link>
    </ListItem>
  );
};

export default PersonRow;
