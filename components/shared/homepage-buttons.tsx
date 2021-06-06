import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { boxShadow } from '../../constants/theme';
import { IStore } from '../store/use-store';

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

export const HomepageButtons = (props: {
  store: IStore;
  toggleFilter: (filter: string) => void;
  currentFilter: string | undefined;
}) => {
  const classes = useStyles();

  return (
    <Grid container alignItems="center" justify="space-between">
      <Grid item>
        <Button
          disableElevation={false}
          className={classes.button}
          onClick={() => props.toggleFilter('docs')}
          startIcon={
            <img src={`chrome://favicon/size/48@1x/https://docs.google.com`} height="12" />
          }
        >
          Google Docs
        </Button>
      </Grid>
      <Grid item>
        <Button
          disableElevation={false}
          className={classes.button}
          onClick={() => props.toggleFilter('slides')}
          startIcon={
            <img src={`chrome://favicon/size/48@1x/https://slides.google.com`} height="12" />
          }
        >
          Google Slides
        </Button>
      </Grid>
      <Grid item>
        <Button
          disableElevation={false}
          className={classes.button}
          onClick={() => props.toggleFilter('sheets')}
          startIcon={
            <img src={`chrome://favicon/size/48@1x/https://sheets.google.com`} height="12" />
          }
        >
          Google sheets
        </Button>
      </Grid>
      <Grid item>
        <Button
          disableElevation={false}
          className={classes.button}
          onClick={() => props.toggleFilter('figma')}
          startIcon={<img src={`chrome://favicon/size/48@1x/https://www.figma.com`} height="12" />}
        >
          Figma
        </Button>
      </Grid>
    </Grid>
  );
};
