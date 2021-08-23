import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { IWebsiteTag } from '../store/data-types';

const useStyles = makeStyles(() => ({
  container: {},
  tag: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

export const TopTags = (props: { websiteTags: IWebsiteTag[] }) => {
  const classes = useStyles();
  const location = useLocation();
  const router = useHistory();

  const onClickTag = (tag: string) => {
    const isHomeSelected = location.pathname === '/home';
    if (isHomeSelected) {
      const elem = document.getElementById(`tag-${tag}`);
      elem?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/home');
      setTimeout(() => {
        const elem = document.getElementById(`tag-${tag}`);
        elem?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  };

  return (
    <Grid
      container
      className={classes.container}
      alignItems="center"
      spacing={1}
      justifyContent="center"
    >
      <Grid item>
        <Typography className={classes.tag} onClick={() => onClickTag('all')}>
          All
        </Typography>
      </Grid>
      {props.websiteTags.map((t) => (
        <React.Fragment key={t.tag}>
          <Grid item>
            <Divider orientation="vertical" style={{ height: 20 }} />
          </Grid>
          <Grid item>
            <Typography className={classes.tag} onClick={() => onClickTag(t.tag)}>
              {t.tag}
            </Typography>
          </Grid>
        </React.Fragment>
      ))}
      <Grid item>
        <Divider orientation="vertical" style={{ height: 20 }} />
      </Grid>
      <Grid item>
        <Typography color="primary" className={classes.tag} onClick={() => alert('hello')}>
          Add
        </Typography>
      </Grid>
    </Grid>
  );
};
