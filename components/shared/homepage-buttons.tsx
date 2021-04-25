import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  button: {
    textDecoration: 'none',
    cursor: 'pointer',
    boxShadow:
      'rgb(0 0 0 / 20%) 0px 3px 3px -2px, rgb(0 0 0 / 14%) 0px 3px 4px 0px, rgb(0 0 0 / 12%) 0px 1px 8px 0px',
    borderRadius: 16,
    background: theme.palette.background.paper,
    color: theme.palette.primary.main,
  },
}));

export const HomepageButtons = () => {
  const classes = useStyles();
  const router = useHistory();

  return (
    <Grid container alignItems="center" justify="space-between">
      <Grid item>
        <Button
          disableElevation={false}
          className={classes.button}
          href="https://docs.new"
          target="_blank"
        >
          +Doc
        </Button>
      </Grid>
      <Grid item>
        <Button
          disableElevation={false}
          className={classes.button}
          onClick={() => router.push('/new-meeting')}
        >
          +Mtg
        </Button>
      </Grid>
      <Grid item>
        <Button disableElevation={false} className={classes.button} href="mailto:" target="_blank">
          +Eml
        </Button>
      </Grid>
    </Grid>
  );
};
