import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import Link from 'next/link';
import React from 'react';
import LoginButton from './login-button';
import '../../styles/components/homepage/header.css';

const Header = () => (
  <Container maxWidth="lg">
    <Box display="flex" justifyContent="space-between" className="header" alignItems="center">
      <Box
        flex="0 0 50%"
        sx={{ '@media (min-width: 600px)': { flex: '0 0 25%' } }}
        style={{ textAlign: 'left' }}
      >
        <Box display="flex" alignItems="center">
          <Box>
            <Link href="/">
              <img className="header__logo-image" src="/kelp.svg" alt="Kelp logo" />
            </Link>
          </Box>
          <Box>
            <Link href="/">
              <Typography variant="h4" className="header__logo">
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
          className="header__links"
          justifyContent="center"
        >
          <Box>
            <Link href="/about">
              <Typography className="header__link">About</Typography>
            </Link>
          </Box>
          <Box>
            <a
              rel="noreferrer"
              href="https://updates.kelp.nyc"
              target="_blank"
              className="header__link"
            >
              <Typography className="header__link">Updates</Typography>
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
                className="header__menu-button"
                variant="text"
                color="primary"
                size="large"
                {...bindTrigger(popupState)}
              >
                Menu
              </Button>
              <Menu
                className="header__mobile-menu"
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
  </Container>
);

export default Header;
