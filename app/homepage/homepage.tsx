import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useGoogleLogin } from 'react-google-login';
import config from '../config';
import Copyright from './copyright';

const useStyles = makeStyles((theme) => ({
  centerPaper: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(6, 8, 6, 8),
  },
  submit: {
    margin: theme.spacing(4, 0, 2),
    padding: theme.spacing(2, 6),
  },
  avatar: {
    margin: theme.spacing(1),
  },
  body: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  hint: {
    marginTop: theme.spacing(2),
    color: theme.palette.text.hint,
  },
  logoImage: {
    width: 119,
    marginLeft: -10,
    marginRight: -8,
  },
  logoContainer: {
    marginLeft: -86,
  },
}));

const HomePage = (props: { setGoogleLoginState: (response: any) => void }) => {
  const classes = useStyles();
  const { signIn } = useGoogleLogin({
    // TODO: Handle GoogleOfflineResponse and remove response: any
    onSuccess: (response: any) => props.setGoogleLoginState(response),
    onFailure: (error: any) => {
      console.error(error);
    },
    clientId: process.env.GOOGLE_CLIENT_ID || 'error!',
    cookiePolicy: 'single_host_origin',
    autoLoad: false,
    fetchBasicProfile: true,
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly', // Despite not needing the content of messages, readonly is required to filter emails by date
      'https://www.googleapis.com/auth/contacts.readonly',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/drive.activity.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly',
    ].join(' '),
  });

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={0} className={classes.centerPaper}>
        <ListItem className={classes.logoContainer}>
          <ListItemIcon>
            <img className={classes.logoImage} src={`${config.DOMAIN}/images/kelp.svg`} />
          </ListItemIcon>
          <ListItemText disableTypography={true}>
            <Typography variant="h1">Kelp</Typography>
            <Typography variant="subtitle1" style={{ fontStyle: 'italic' }}>
              Your information filtration system
            </Typography>
          </ListItemText>
        </ListItem>
        <Typography variant="body1" className={classes.body}>
          Kelp brings your data together in one place. Pivot your meetings by what documents the
          attendees have edited recently. By associating person, a time slot and documents together,
          Kelp infers associations between information, making the information easier to find.
          Prepare for your next meeting in a flash!
        </Typography>
        <Button
          color="secondary"
          variant="contained"
          size="large"
          onClick={signIn}
          className={classes.submit}
        >
          Log In with Google
        </Button>
      </Paper>
      <Typography variant="body1" className={classes.hint}>
        This application does not store your data or send your data to any third parties. Your
        browser retrieves your data directly from the Google API and processes the data on your
        computer.
      </Typography>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
};

export default HomePage;
