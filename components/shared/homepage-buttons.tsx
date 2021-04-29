import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { boxShadow } from '../../constants/theme';

const useStyles = makeStyles((theme) => ({
  button: {
    textDecoration: 'none',
    cursor: 'pointer',
    boxShadow,
    borderRadius: 20,
    background: theme.palette.background.paper,
    color: theme.palette.primary.main,
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
  },
}));

export const HomepageButtons = () => {
  const classes = useStyles();

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
          target="_blank"
          href="https://www.google.com/calendar/render?action=TEMPLATE"
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
