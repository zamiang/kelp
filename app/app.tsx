import React, { useState } from "react";
import { render } from "react-dom";
import { useGoogleLogin } from "react-google-login";
import { ThemeProvider, createUseStyles, useTheme } from "react-jss";
import Vis from "./vis";

export interface ITheme {
  theme: {
    background: string;
    color: string;
  };
}

const theme: ITheme["theme"] = {
  background: "#f7df1e",
  color: "#24292e",
};

const useStyles = createUseStyles({
  wrapper: {
    padding: 40,
    background: ({ theme }: ITheme) => theme.background,
    textAlign: "left",
  },
  title: {
    font: {
      size: 40,
      weight: 900,
    },
    color: ({ theme }: ITheme) => theme.color,
  },
  link: {
    color: ({ theme }: ITheme) => theme.color,
    "&:hover": {
      opacity: 0.5,
    },
  },
});

export type styles = ReturnType<typeof useStyles>;

const initialGoogleState = {
  googleId: "",
  tokenId: "",
  accessToken: "",
  profileObj: {
    googleId: "",
    imageUrl: "",
    email: "",
    name: "",
    givenName: "",
    familyName: "",
  },
};

export type googleState = typeof initialGoogleState;

const App = () => {
  const theme = useTheme();
  const classes = useStyles({ theme });
  const [googleLoginState, setGoogleLoginState] = useState(initialGoogleState);
  const { signIn, loaded } = useGoogleLogin({
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
      "https://www.googleapis.com/auth/gmail.metadata https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/calendar.events.readonly",
  });
  const isLoggedIn = googleLoginState.accessToken.length > 0;
  return (
    <div className={classes.wrapper}>
      <h1 className={classes.title}>Hello World</h1>
      <h2>{process.env.GOOGLE_CLIENT_ID}</h2>
      {loaded && !isLoggedIn ? <button onClick={signIn}>Sign In</button> : null}
      {isLoggedIn ? (
        <Vis classes={classes} googleLoginState={googleLoginState} />
      ) : null}
    </div>
  );
};

const Container = () => (
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
);

render(<Container />, document.getElementById("root"));
