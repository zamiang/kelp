import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import Link from 'next/link';
import React from 'react';
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
    paddingTop: theme.spacing(2),
  },
  alignLeft: {
    textAlign: 'left',
  },
  headerLink: {
    color: theme.palette.text.primary,
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: 24,
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
  logoImage: {
    height: 80,
    paddingRight: 0,
    marginRight: theme.spacing(4),
  },
  logo: {
    cursor: 'pointer',
    fontSize: 48,
    margin: 0,
    color: theme.palette.text.primary,
  },
}));

const Header = () => {
  const classes = useStyles();
  return (
    <Container maxWidth="lg">
      <Grid container justify="space-between" className={classes.header} alignItems="center">
        <Grid item xs={3} style={{ textAlign: 'left' }}>
          <Grid container alignItems="center">
            <Grid item>
              <Link href="/">
                <img className={classes.logoImage} src="/kelp.svg" alt="Kelp logo" />
              </Link>
            </Grid>
            <Grid item>
              <Link href="/">
                <Typography variant="h4" className={classes.logo}>
                  Kelp
                </Typography>
              </Link>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container spacing={4} alignItems="center" className={classes.links}>
            <Grid item>
              <Link href="/about">
                <Typography className={classes.headerLink}>About</Typography>
              </Link>
            </Grid>
            <Grid item>
              <a
                rel="noreferrer"
                href="https://updates.kelp.nyc"
                target="_blank"
                className={classes.headerLink}
              >
                <Typography className={classes.headerLink}>Updates</Typography>
              </a>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6} sm={3} style={{ textAlign: 'right' }}>
          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <React.Fragment>
                <Button
                  className={classes.menuButton}
                  variant="outlined"
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
                  <MenuItem>
                    <Link href="/dashboard">
                      <Typography>Log In</Typography>
                    </Link>
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
