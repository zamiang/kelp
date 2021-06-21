import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { IPerson } from '../store/data-types';

const useStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    width: 18,
    height: 18,
    fontSize: 11,
  },
  rowLeft: {
    textAlign: 'center',
    marginRight: theme.spacing(2),
  },
  container: {
    cursor: 'pointer',
    paddingLeft: 11,
    paddingRight: 11,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    height: 37,
    overflow: 'hidden',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
  },
}));

export const SmallPersonRow = (props: { person: IPerson; isTextVisible: boolean }) => {
  const styles = useStyles();
  const router = useHistory();

  const name = props.person.name || props.person.id;
  return (
    <Grid
      container
      alignItems="center"
      wrap="nowrap"
      className={styles.container}
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
