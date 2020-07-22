import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

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
          <Link component={RouterLink} color="inherit" to="/about">
            About
          </Link>
        </div>
        <div className={classes.footerItem}>
          <Link component={RouterLink} color="inherit" to="/contact">
            Contact
          </Link>
        </div>
        <div className={classes.footerItem}>
          <Link component={RouterLink} color="inherit" to="/terms">
            Privacy & terms
          </Link>
        </div>
        <Typography variant="body2" className={classes.copyright} align="center">
          {'Copyright © '}
          <Link color="inherit" href="https://www.zamiang.com">
            Brennan Moore
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
      </Box>
    </div>
  );
};

export default Footer;
