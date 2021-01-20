import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { providers, signIn } from 'next-auth/client';
import React from 'react';
import { useStyles } from '../old-homepage';

interface IProvider {
  id: string;
  name: string;
}

interface IProps {
  providers: IProvider[];
}

export default function SignIn({ providers }: IProps) {
  const classes = useStyles();
  return (
    <Grid
      container
      spacing={0}
      alignItems="center"
      justify="center"
      direction="column"
      style={{ minHeight: '100vh' }}
    >
      <Grid item sm={5} style={{ textAlign: 'center', maxWidth: 350 }}>
        <Paper elevation={3} className={classes.loginPaper}>
          <img alt="Kelp logo" style={{ maxWidth: 120 }} src="/kelp.svg" />
          <Typography variant="h3" className={classes.heading}>
            Kelp
          </Typography>
          <br />
          <Divider />
          <br />
          {Object.values(providers).map((provider) => (
            <Button
              variant="contained"
              key={provider.id}
              size="large"
              color="primary"
              className={clsx(classes.login, classes.loginMargin)}
              fullWidth={true}
              onClick={() => signIn(provider.id)}
            >
              Sign in with {provider.name}
            </Button>
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
}

SignIn.getInitialProps = async () => ({
  providers: await providers(),
});
