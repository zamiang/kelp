import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Link from 'next/link';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  copyright: {
    marginTop: theme.spacing(3),
    color: theme.palette.text.hint,
  },
  footer: {
    marginTop: theme.spacing(9),
    padding: theme.spacing(9),
    backgroundColor: theme.palette.secondary.main,
    textAlign: 'center',
    color: theme.palette.text.primary,
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
            <Button color="inherit" component="a">
              About Kelp
            </Button>
          </Link>
        </div>
        <div className={classes.footerItem}>
          <Link href="/contact">
            <Button color="inherit" component="a">
              Contact
            </Button>
          </Link>
        </div>
        <div className={classes.footerItem}>
          <Link href="/privacy">
            <Button color="inherit" component="a">
              Privacy Policy
            </Button>
          </Link>
        </div>
        <div className={classes.footerItem}>
          <Link href="/terms">
            <Button color="inherit" component="a">
              Terms & Conditions
            </Button>
          </Link>
        </div>
        <Typography variant="body2" className={classes.copyright} align="center">
          {'Copyright © '}
          <MuiLink href="https://www.zamiang.com">Brennan Moore</MuiLink> {new Date().getFullYear()}
          {'.'}
        </Typography>
      </Box>
    </div>
  );
};

export default Footer;
