import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  copyright: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  footer: {
    borderTop: '1px solid',
    borderColor: theme.palette.divider,
    marginTop: theme.spacing(8),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    textAlign: 'center',
    overflow: 'hidden',
    color: theme.palette.text.primary,
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(2),
    },
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
  footerItem: {
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(1),
    },
  },
}));

const Footer = (props: { shouldAlignLeft?: boolean }) => {
  const classes = useStyles();
  return (
    <div className={clsx(classes.footer, props.shouldAlignLeft && classes.alignLeft)}>
      <Grid container spacing={1} justify={props.shouldAlignLeft ? 'flex-start' : 'center'}>
        <Grid item className={classes.footerItem}>
          <Link href="/about">
            <span className={classes.footerLink}>About</span>
          </Link>
        </Grid>
        <Grid item className={classes.footerItem}>
          <a
            rel="noreferrer"
            href="mailto:support@kelp.nyc"
            className={classes.footerLink}
            target="_blank"
          >
            Contact
          </a>
        </Grid>
        <Grid item className={classes.footerItem}>
          <Link href="/security">
            <span className={classes.footerLink}>Security</span>
          </Link>
        </Grid>
        <Grid item className={classes.footerItem}>
          <Link href="/privacy">
            <span className={classes.footerLink}>Privacy</span>
          </Link>
        </Grid>
      </Grid>
      <Typography variant="body2" className={classes.copyright}>
        {'Copyright © '}
        <MuiLink color="textSecondary" href="https://www.zamiang.com">
          Kelp Information Filtration, LLC
        </MuiLink>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    </div>
  );
};

export default Footer;
