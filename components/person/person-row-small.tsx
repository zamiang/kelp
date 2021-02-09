import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import { useHistory } from 'react-router-dom';
import useExpandStyles from '../shared/expand-styles';
import { IPerson } from '../store/models/person-model';

const useStyles = makeStyles((theme) => ({
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

const SmallPersonRow = (props: { person: IPerson; info?: string }) => {
  const classes = useStyles();
  const router = useHistory();
  const expandClasses = useExpandStyles();

  const handleClick = () => router.push(`/people/${encodeURIComponent(props.person.id)}`);
  return (
    <Button
      onClick={handleClick}
      className={clsx('ignore-react-onclickoutside', expandClasses.listItem, classes.person)}
    >
      <Grid container spacing={1} alignItems="center" wrap="nowrap">
        <Grid item>
          <Avatar
            style={{ height: 24, width: 24 }}
            src={props.person.imageUrl || ''}
            className={classes.avatar}
          >
            {(props.person.name || props.person.id)[0]}
          </Avatar>
        </Grid>
        <Grid item xs={9} zeroMinWidth>
          <Typography variant="body2" noWrap>
            {props.person.name || props.person.id}
          </Typography>
        </Grid>
        {props.info && (
          <Grid item>
            <Typography variant="caption" noWrap>
              {props.info}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Button>
  );
};

export default SmallPersonRow;
