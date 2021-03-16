import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Link from 'next/link';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  copyright: {
    marginTop: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  footer: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    textAlign: 'center',
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(2),
    },
  },
  alignLeft: {
    textAlign: 'left',
  },
  logoImage: {
    height: 80,
    cursor: 'pointer',
    opacity: 1,
    transition: 'opacity 0.3s',
    '&:hover': {
      opacity: 0.5,
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  footerLink: {
    color: theme.palette.text.primary,
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    '&:hover': {
      textDecoration: 'underline',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: 16,
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  footerItem: {
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(1),
      padding: '0px',
    },
  },
}));

const Footer = () => {
  const classes = useStyles();
  return (
    <Container maxWidth="lg" className={classes.footer}>
      <Grid container justify="space-between">
        <Grid item xs={1}>
          <Link href="/">
            <img className={classes.logoImage} src="/kelp.svg" alt="Kelp logo" />
          </Link>
        </Grid>
        <Grid item>
          <Grid container alignItems="center" justify="center">
            <Grid item className={classes.footerItem}>
              <Link href="/about">
                <Typography variant="body2" className={classes.footerLink}>
                  About
                </Typography>
              </Link>
            </Grid>
            <Grid item className={classes.footerItem}>
              <a
                rel="noreferrer"
                href="https://updates.kelp.nyc"
                className={classes.footerLink}
                target="_blank"
              >
                <Typography variant="body2" className={classes.footerLink}>
                  Updates
                </Typography>
              </a>
            </Grid>
            <Grid item className={classes.footerItem}>
              <Link href="/privacy">
                <Typography variant="body2" className={classes.footerLink}>
                  Privacy
                </Typography>
              </Link>
            </Grid>
            <Grid item className={classes.footerItem}>
              <Link href="/terms">
                <Typography variant="body2" className={classes.footerLink}>
                  Terms
                </Typography>
              </Link>
            </Grid>
          </Grid>
          <Typography className={classes.copyright}>
            {'Copyright © '}
            <MuiLink
              color="textSecondary"
              href="https://www.zamiang.com"
              style={{ textDecoration: 'none' }}
            >
              Kelp Information Filtration, LLC
            </MuiLink>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Grid>
        <Grid item xs={1}></Grid>
      </Grid>
    </Container>
  );
};

export default Footer;
