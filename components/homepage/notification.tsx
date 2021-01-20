import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';
import React from 'react';
import { endDate, startDate } from '../../components/store/use-homepage-store';

const useStyles = makeStyles((theme) => ({
  notification: {
    borderRadius: 20,
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
  },
  logo: {},
  logoText: {
    display: 'inline-block',
    fontWeight: theme.typography.fontWeightLight,
    color: theme.palette.secondary.main,
    textTransform: 'uppercase',
    verticalAlign: 'middle',
  },
  logoImage: {
    display: 'inline-block',
    verticalAlign: 'middle',
    maxWidth: 22,
    borderRadius: 5,
    border: `1px solid ${theme.palette.divider}`,
    marginRight: theme.spacing(1),
  },
  date: {},
}));

const Notification = () => {
  const classes = useStyles();
  return (
    <div className={classes.notification}>
      <Grid container justify="space-between" alignItems="center">
        <Grid item className={classes.logo}>
          <img className={classes.logoImage} alt="Kelp logo" src="/kelp.svg" />
          <Typography className={classes.logoText}>Kelp</Typography>
        </Grid>
        <Grid item className={classes.date}>
          <Typography color="textSecondary" variant="body2">
            in 10 minutes
          </Typography>
        </Grid>
      </Grid>
      <Grid container justify="space-between" alignItems="flex-end">
        <Grid item xs={9}>
          <Typography>
            <b>Upcomming Meeting: SPAC Formataion to acquire Roman Empire</b>
          </Typography>
          <Typography>Documents you may need</Typography>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="contained"
            color="primary"
            style={{ marginLeft: 'auto', display: 'block' }}
          >
            Prepare
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default Notification;
