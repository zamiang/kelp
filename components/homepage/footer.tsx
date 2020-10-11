import Box from '@material-ui/core/Box';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Link from 'next/link';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  copyright: {
    marginTop: theme.spacing(3),
    color: theme.palette.text.secondary,
  },
  footer: {
    borderTop: '1px solid',
    borderColor: theme.palette.divider,
    marginTop: theme.spacing(9),
    padding: theme.spacing(9),
    textAlign: 'center',
    color: theme.palette.text.primary,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
      paddingTop: theme.spacing(2),
      marginTop: theme.spacing(2),
    },
  },
  footerLink: {
    textTransform: 'uppercase',
    color: theme.palette.text.primary,
    cursor: 'pointer',
    fontWeight: theme.typography.fontWeightBold,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  footerItem: {
    display: 'inline-block',
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
}));

const Footer = () => {
  const classes = useStyles();
  return (
    <Box mt={8} className={classes.footer}>
      <div className={classes.footerItem}>
        <Link href="/about">
          <span className={classes.footerLink}>About</span>
        </Link>
      </div>
      <div className={classes.footerItem}>
        <a
          rel="noreferrer"
          href="mailto:support@kelp.nyc"
          className={classes.footerLink}
          target="_blank"
        >
          Contact
        </a>
      </div>
      <div className={classes.footerItem}>
        <Link href="/security">
          <span className={classes.footerLink}>Security</span>
        </Link>
      </div>
      <div className={classes.footerItem}>
        <Link href="/privacy">
          <span className={classes.footerLink}>Privacy</span>
        </Link>
      </div>
      <Typography variant="body2" className={classes.copyright} align="center">
        {'Copyright © '}
        <MuiLink color="textSecondary" href="https://www.zamiang.com">
          Kelp Information Filtration, LLC
        </MuiLink>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    </Box>
  );
};

export default Footer;
