import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import React, { useState } from "react";
import { render } from "react-dom";
import { useGoogleLogin } from "react-google-login";
import Copyright from "./copyright";
import Dashboard from "./dashboard";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  centerPaper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  fixedHeight: {
    height: 240,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export type styles = ReturnType<typeof useStyles>;

// Note: Lots more info on this object but is unused by the app
const initialGoogleState = {
  accessToken: "",
};

export type googleState = typeof initialGoogleState;

const loadLibraries = () => {
  gapi.client.init({
    discoveryDocs: [
      "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      "https://www.googleapis.com/discovery/v1/apis/driveactivity/v2/rest",
      "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
    ],
  });
  return null;
};

gapi.load("client", loadLibraries);

const App = () => {
  const classes = useStyles();

  const [googleLoginState, setGoogleLoginState] = useState(initialGoogleState);
  const { signIn } = useGoogleLogin({
    // TODO: Handle GoogleOfflineResponse and remove response: any
    onSuccess: (response: any) => setGoogleLoginState(response),
    onFailure: (error: any) => {
      console.error(error);
    },
    clientId: process.env.GOOGLE_CLIENT_ID || "error!",
    cookiePolicy: "single_host_origin",
    autoLoad: false,
    fetchBasicProfile: true,
    scope:
      "https://www.googleapis.com/auth/gmail.metadata https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.activity.readonly https://www.googleapis.com/auth/calendar.events.readonly",
  });
  const isLoggedIn = googleLoginState.accessToken.length > 0;

  return (
    <div className={classes.root}>
      <CssBaseline />
      {isLoggedIn ? (
        <Dashboard classes={classes} />
      ) : (
        <Container component="main" maxWidth="xs">
          <Paper className={classes.centerPaper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={signIn}
              className={classes.submit}
            >
              Sign In
            </Button>
          </Paper>
          <Box mt={8}>
            <Copyright />
          </Box>
        </Container>
      )}
    </div>
  );
};

render(<App />, document.getElementById("root"));
