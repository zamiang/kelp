import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router-dom';
import { IProps } from '../dashboard';
import useRowStyles from '../shared/row-styles';
import { IPerson } from '../store/person-store';

const PersonRow = (
  props: {
    selectedPersonId: string | null;
    person: IPerson;
  } & IProps,
) => {
  const rowStyles = useRowStyles();
  return (
    <ListItem
      button={true}
      className={clsx(
        rowStyles.row,
        props.selectedPersonId === props.person.id && rowStyles.rowPrimaryMain,
      )}
      component={Link}
      to={`/dashboard/people/${props.person.id}`}
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
