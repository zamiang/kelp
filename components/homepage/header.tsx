import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import Link from 'next/link';
import React from 'react';
import LoginButton from './login-button';

const PREFIX = 'Header';

const classes = {
  copyright: `${PREFIX}-copyright`,
  headerContainer: `${PREFIX}-headerContainer`,
  header: `${PREFIX}-header`,
  alignLeft: `${PREFIX}-alignLeft`,
  headerLink: `${PREFIX}-headerLink`,
  links: `${PREFIX}-links`,
  closeIcon: `${PREFIX}-closeIcon`,
  mobileMenu: `${PREFIX}-mobileMenu`,
  menuButton: `${PREFIX}-menuButton`,
  logoImage: `${PREFIX}-logoImage`,
  logo: `${PREFIX}-logo`,
};

const StyledContainer = styled(Container)(({ theme }) => ({
  [`& .${classes.copyright}`]: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
  },

  [`& .${classes.headerContainer}`]: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    textAlign: 'center',
    overflow: 'hidden',
    color: theme.palette.text.primary,
  },

  [`& .${classes.header}`]: {
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingTop: theme.spacing(2),
  },

  [`& .${classes.alignLeft}`]: {
    textAlign: 'left',
  },

  [`& .${classes.headerLink}`]: {
    color: theme.palette.text.primary,
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: 24,
    '&:hover': {
      textDecoration: 'underline',
    },
  },

  [`& .${classes.links}`]: {
    minWidth: 185,
    [theme.breakpoints.down('lg')]: {
      display: 'none',
    },
  },

  [`& .${classes.closeIcon}`]: {
    marginBottom: -30,
    '& svg': {
      marginLeft: 'auto',
    },
  },

  [`& .${classes.mobileMenu}`]: {
    minWidth: '80vw',
  },

  [`& .${classes.menuButton}`]: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },

  [`& .${classes.logoImage}`]: {
    height: 72,
    paddingRight: 0,
    marginRight: theme.spacing(3),
    opacity: 1,
    cursor: 'pointer',
    transition: 'opacity 0.3s',
    '&:hover': {
      opacity: 0.5,
    },
    [theme.breakpoints.down('lg')]: {
      height: 56,
      marginRight: theme.spacing(2),
    },
  },

  [`& .${classes.logo}`]: {
    cursor: 'pointer',
    fontSize: 42,
    margin: 0,
    color: theme.palette.text.primary,
    [theme.breakpoints.down('lg')]: {
      fontSize: 24,
    },
  },
}));

const Header = () => (
  <StyledContainer maxWidth="lg">
    <Box
      display="flex"
      justifyContent="space-between"
      className={classes.header}
      alignItems="center"
    >
      <Box
        flex="0 0 50%"
        sx={{ '@media (min-width: 600px)': { flex: '0 0 25%' } }}
        style={{ textAlign: 'left' }}
      >
        <Box display="flex" alignItems="center">
          <Box>
            <Link href="/">
              <img className={classes.logoImage} src="/kelp.svg" alt="Kelp logo" />
            </Link>
          </Box>
          <Box>
            <Link href="/">
              <Typography variant="h4" className={classes.logo}>
                Kelp
              </Typography>
            </Link>
          </Box>
        </Box>
      </Box>
      <Box flex={1}>
        <Box
          display="flex"
          gap={4}
          alignItems="center"
          className={classes.links}
          justifyContent="center"
        >
          <Box>
            <Link href="/about">
              <Typography className={classes.headerLink}>About</Typography>
            </Link>
          </Box>
          <Box>
            <a
              rel="noreferrer"
              href="https://updates.kelp.nyc"
              target="_blank"
              className={classes.headerLink}
            >
              <Typography className={classes.headerLink}>Updates</Typography>
            </a>
          </Box>
        </Box>
      </Box>
      <Box
        flex="0 0 50%"
        sx={{ '@media (min-width: 600px)': { flex: '0 0 25%' } }}
        style={{ textAlign: 'right' }}
      >
        <PopupState variant="popover" popupId="demo-popup-menu">
          {(popupState) => (
            <React.Fragment>
              <Button
                className={classes.menuButton}
                variant="text"
                color="primary"
                size="large"
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
                <MenuItem component="a" href="/about">
                  About
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
      </Box>
    </Box>
  </StyledContainer>
);

export default Header;
