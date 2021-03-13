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
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: theme.breakpoints.width('md'),
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
      padding: '0px',
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
