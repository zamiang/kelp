import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { signIn } from 'next-auth/client';
import Link from 'next/link';
import React from 'react';
import config from '../../constants/config';
import LoginButton from './login-button';

const useStyles = makeStyles((theme) => ({
  copyright: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  headerContainer: {
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
    minWidth: 185,
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  footerItem: {},
  closeIcon: {
    marginBottom: -30,
    '& svg': {
      marginLeft: 'auto',
    },
  },
  mobileMenu: {
    minWidth: '80vw',
  },
  menuButton: {
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
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
        <Grid item xs={6} sm={3} className={classes.footerItem} style={{ textAlign: 'right' }}>
          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <React.Fragment>
                <Button
                  className={classes.menuButton}
                  variant="contained"
                  color="primary"
                  {...bindTrigger(popupState)}
                >
                  Menu
                </Button>
                <Menu
                  className={classes.mobileMenu}
                  PaperProps={{
                    style: {
                      width: 350,
                    },
                  }}
                  {...bindMenu(popupState)}
                >
                  <MenuItem onClick={popupState.close} className={classes.closeIcon}>
                    <CloseIcon />
                  </MenuItem>
                  <MenuItem component="a" href="/about">
                    About
                  </MenuItem>
                  <MenuItem component="a" href="https://updates.kelp.nyc">
                    Updates
                  </MenuItem>
                  <MenuItem onClick={() => signIn('google', { callbackUrl: config.REDIRECT_URI })}>
                    <Typography>Log In</Typography>
                  </MenuItem>
                </Menu>
              </React.Fragment>
            )}
          </PopupState>
          <LoginButton />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Header;
