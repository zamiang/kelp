import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import LoginButton from './login-button';

const useStyles = makeStyles((theme) => ({
  copyright: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  headerContainer: {
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    textAlign: 'center',
    overflow: 'hidden',
    color: theme.palette.text.primary,
  },
  header: {
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: theme.breakpoints.width('md'),
  },
  alignLeft: {
    textAlign: 'left',
  },
  footerLink: {
    color: theme.palette.text.primary,
    cursor: 'pointer',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  links: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  footerItem: {},
}));

const Header = () => {
  const classes = useStyles();
  return (
    <Container maxWidth="md" className={clsx(classes.headerContainer)}>
      <Grid container justify="space-between" className={classes.header} alignItems="center">
        <Grid item xs={3} className={classes.footerItem} style={{ textAlign: 'left' }}>
          <Link href="/">
            <Typography variant="h4">
              <b>Kelp</b>
            </Typography>
          </Link>
        </Grid>
        <Grid item>
          <Grid container spacing={4} alignItems="center" className={classes.links}>
            <Grid item className={classes.footerItem}>
              <Link href="/about">
                <Typography className={classes.footerLink}>About</Typography>
              </Link>
            </Grid>
            <Grid item className={classes.footerItem}>
              <a
                rel="noreferrer"
                href="https://updates.kelp.nyc"
                className={classes.footerLink}
                target="_blank"
              >
                <Typography>Updates</Typography>
              </a>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={3} className={classes.footerItem} style={{ textAlign: 'right' }}>
          <LoginButton />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Header;
