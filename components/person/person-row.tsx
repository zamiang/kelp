import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import useRowStyles from '../shared/row-styles';
import { IPerson } from '../store/person-store';

const useStyles = makeStyles(() => ({
  name: { minWidth: 300 },
  email: { minWidth: 200 },
}));

const PersonRow = (props: { selectedPersonId: string | null; person: IPerson }) => {
  const classes = useStyles();
  const rowStyles = useRowStyles();
  return (
    <ListItem
      button={true}
      className={clsx(
        'ignore-react-onclickoutside',
        rowStyles.row,
        props.selectedPersonId === props.person.id && rowStyles.orangeBackground,
      )}
    >
      <Link href={`?tab=people&slug=${props.person.id}`}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            {props.person.imageUrl ? (
              <Avatar className={rowStyles.avatar} src={props.person.imageUrl} />
            ) : (
              <Avatar className={rowStyles.avatar}>
                {(props.person.name || props.person.id)[0]}
              </Avatar>
            )}
          </Grid>
          <Grid item className={classes.name} zeroMinWidth>
            <Typography variant="body2" noWrap>
              <b>{props.person.name || props.person.id}</b>
            </Typography>
          </Grid>
          <Grid item className={classes.email}>
            <Typography variant="body2" noWrap>
              {props.person.emailAddress}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" noWrap>
              {props.person.notes}
            </Typography>
          </Grid>
        </Grid>
      </Link>
    </ListItem>
  );
};

export default PersonRow;
