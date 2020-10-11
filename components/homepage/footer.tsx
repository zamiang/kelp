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
    <div>
      <Box mt={8} className={classes.footer}>
        <div className={classes.footerItem}>
          <Link href="/about">
            <span className={classes.footerLink}>About Kelp</span>
          </Link>
        </div>
        <div className={classes.footerItem}>
          <a href="mailto:support@kelp.nyc" className={classes.footerLink}>
            Contact
          </a>
        </div>
        <div className={classes.footerItem}>
          <Link href="/privacy">
            <span className={classes.footerLink}>Privacy Policy</span>
          </Link>
        </div>
        <div className={classes.footerItem}>
          <Link href="/terms">
            <span className={classes.footerLink}>Terms & Conditions</span>
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
    </div>
  );
};

export default Footer;
