import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import React from 'react';
import '../../styles/components/homepage/footer.css';

const Footer = () => (
  <Container maxWidth="lg" className="footer">
    <Box display="flex" alignItems="center" justifyContent="center" flexWrap="wrap">
      <Box className="footer__item">
        <MuiLink href="https://www.kelp.nyc/about" underline="hover">
          <Typography variant="body2" className="footer__link">
            About
          </Typography>
        </MuiLink>
      </Box>
      <Box className="footer__item">
        <MuiLink
          href="https://chrome.google.com/webstore/detail/kelp-new-tab-page-for-peo/onkkkcfnlbkoialleldfbgodakajfpnl?hl=en&authuser=0"
          underline="hover"
        >
          <Typography variant="body2" className="footer__link">
            Download for Chrome
          </Typography>
        </MuiLink>
      </Box>
      <Box className="footer__item">
        <MuiLink
          href="https://addons.mozilla.org/en-US/firefox/addon/kelp-your-website-organizer/"
          underline="hover"
        >
          <Typography variant="body2" className="footer__link">
            Download for Firefox
          </Typography>
        </MuiLink>
      </Box>
      <Box className="footer__item">
        <MuiLink href="https://www.kelp.nyc/privacy" underline="hover">
          <Typography variant="body2" className="footer__link">
            Privacy
          </Typography>
        </MuiLink>
      </Box>
      <Box className="footer__item">
        <MuiLink href="https://www.kelp.nyc/terms" underline="hover">
          <Typography variant="body2" className="footer__link">
            Terms
          </Typography>
        </MuiLink>
      </Box>
    </Box>
    <Typography className="footer__copyright">
      {'Copyright © '}
      <MuiLink
        color="textSecondary"
        href="https://www.zamiang.com"
        style={{ textDecoration: 'none' }}
      >
        Kelp Information Filtration, LLC
      </MuiLink>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  </Container>
);

export default Footer;
