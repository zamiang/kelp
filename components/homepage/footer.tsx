import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  copyright: {
    marginTop: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  footer: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(6),
    textAlign: 'center',
    position: 'relative',
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
      margin: '0 auto',
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
  hideOnMobile: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

const Footer = () => {
  const classes = useStyles();
  return (
    <Container maxWidth="lg" className={classes.footer}>
      <Grid container alignItems="center" justifyContent="center">
        <Grid item className={classes.footerItem}>
          <MuiLink href="https://www.kelp.nyc/about">
            <Typography variant="body2" className={classes.footerLink}>
              About
            </Typography>
          </MuiLink>
        </Grid>
        <Grid item className={classes.footerItem}>
          <MuiLink href="https://chrome.google.com/webstore/detail/kelp-new-tab-page-for-peo/onkkkcfnlbkoialleldfbgodakajfpnl?hl=en&authuser=0">
            <Typography variant="body2" className={classes.footerLink}>
              Download
            </Typography>
          </MuiLink>
        </Grid>
        <Grid item className={classes.footerItem}>
          <MuiLink href="https://www.kelp.nyc/privacy">
            <Typography variant="body2" className={classes.footerLink}>
              Privacy
            </Typography>
          </MuiLink>
        </Grid>
        <Grid item className={classes.footerItem}>
          <MuiLink href="https://www.kelp.nyc/terms">
            <Typography variant="body2" className={classes.footerLink}>
              Terms
            </Typography>
          </MuiLink>
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
    </Container>
  );
};

export default Footer;
