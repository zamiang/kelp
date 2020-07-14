import { Avatar, Grid, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import { IRouteProps } from '../dashboard';
import useRowStyles from '../shared/row-styles';
import { IPerson } from '../store/person-store';

const PersonRow = (
  props: {
    setSelectedPersonId: (id: string) => void;
    selectedPersonId: string | null;
    person: IPerson;
  } & IRouteProps,
) => {
  const rowStyles = useRowStyles();
  return (
    <ListItem
      button={true}
      className={clsx(
        rowStyles.row,
        props.selectedPersonId === props.person.id && rowStyles.rowPrimaryMain,
      )}
      onClick={() => props.setSelectedPersonId(props.person.id)}
    >
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
    </ListItem>
  );
};

export default PersonRow;
