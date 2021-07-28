import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { IPerson } from '../store/data-types';

const useStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    width: 18,
    height: 18,
    fontSize: 11,
  },
  selected: {
    background: theme.palette.divider,
  },
  rowLeft: {
    textAlign: 'center',
  },
  container: {
    cursor: 'pointer',
    transition: 'background 0.3s',
    paddingLeft: 9,
    paddingRight: 9,
    paddingTop: 9,
    paddingBottom: 9,
    overflow: 'hidden',
    borderRadius: 4,
    '&:hover': {
      backgroundColor: theme.palette.divider,
      opacity: 0.8,
    },
  },
}));

export const SmallPersonRow = (props: { person: IPerson; isTextVisible: boolean }) => {
  const styles = useStyles();
  const router = useHistory();
  const url = `/people/${encodeURIComponent(props.person.id)}`;
  const location = useLocation();
  const isSelected = location.pathname === url;

  const name = props.person.name || props.person.id;
  return (
    <Grid
      container
      alignItems="center"
      wrap="nowrap"
      className={clsx(styles.container, isSelected && styles.selected)}
      onClick={(event) => {
        event.stopPropagation();
        router.push(`/people/${encodeURIComponent(props.person.id)}`);
        return false;
      }}
    >
      <Grid item className={styles.rowLeft}>
        {props.person.imageUrl ? (
          <Avatar
            alt={`Profile photo for ${
              props.person.name || props.person.emailAddresses[0] || undefined
            }`}
            className={styles.avatar}
            src={props.person.imageUrl}
          />
        ) : (
          <Avatar
            alt={props.person.name || props.person.emailAddresses[0] || undefined}
            className={styles.avatar}
          >
            {(props.person.name || props.person.id)[0]}
          </Avatar>
        )}
      </Grid>
      {props.isTextVisible && (
        <Grid item xs zeroMinWidth>
          <Typography noWrap>{name}</Typography>
        </Grid>
      )}
    </Grid>
  );
};
