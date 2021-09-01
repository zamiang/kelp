import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useState } from 'react';
import config from '../../constants/config';
import { mediumFontFamily } from '../../constants/theme';
import LeftArrow from '../../public/icons/left-arrow-black.svg';
import RightArrow from '../../public/icons/right-arrow-black.svg';

const maxTips = 3;

const useStyles = makeStyles((theme) => ({
  stepOneContainer: {
    background: theme.palette.background.default,
    transition: 'background 0.3s',
    padding: 20,
    paddingBottom: 40,
  },
  heading: { display: 'inline-block', marginLeft: theme.spacing(2) },
  body: {
    marignBottom: theme.spacing(2),
  },
  rightAlignButton: {
    textAlign: 'right',
    marginTop: theme.spacing(4),
    fontSize: 16,
    display: 'block',
  },
  bold: {
    display: 'inline-block',
    fontStyle: 'normal',
    fontFamily: mediumFontFamily,
    fontWeight: 500,
    color: theme.palette.primary.main,
  },
  li: {
    paddingBottom: theme.spacing(2),
  },
  image: {
    maxWidth: '100%',
    borderRadius: 20,
    marginBottom: 30,
    marginLeft: 'auto',
    marginRight: 'auto',
    height: 400,
    width: 600,
  },
  button: {
    background: 'rgba(0, 0, 0, 0.12)',
  },
  leftButton: {
    marginRight: theme.spacing(2),
  },
}));

const WelcomePopup = (props: { step: number; setStep: (step: number) => void }) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <img src="https://www.kelp.nyc/animations/tag-nav.gif" className={classes.image} />
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography className={classes.bold} variant="h3">
            {props.step} / {maxTips}
          </Typography>
          <Typography variant="h3" className={classes.heading}>
            Meet your magical website organizer
          </Typography>
        </Grid>
        <Grid item>
          <IconButton
            size="medium"
            className={classes.button}
            onClick={() => props.setStep(props.step + 1)}
          >
            <RightArrow height="22" width="22" />
          </IconButton>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

const PinAnimation = (props: { step: number; setStep: (step: number) => void }) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <img src="https://www.kelp.nyc/animations/tag-group.gif" className={classes.image} />
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography className={classes.bold} variant="h3">
            {props.step} / {maxTips}
          </Typography>
          <Typography variant="h3" className={classes.heading}>
            Add Smart tags
          </Typography>
        </Grid>
        <Grid item>
          <IconButton
            size="medium"
            className={classes.leftButton}
            onClick={() => props.setStep(props.step - 1)}
          >
            <LeftArrow height="22" width="22" />
          </IconButton>
          <IconButton
            className={classes.button}
            size="medium"
            onClick={() => {
              props.setStep(props.step + 1);
              return localStorage.setItem(config.IS_ONBOARDING_COMPLETED, 'true');
            }}
          >
            <RightArrow height="22" width="22" />
          </IconButton>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

const MeetingsAnimation = (props: { step: number; setStep: (step: number) => void }) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <img src="https://www.kelp.nyc/animations/tag-meeting.gif" className={classes.image} />
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography className={classes.bold} variant="h3">
            {props.step} / {maxTips}
          </Typography>
          <Typography variant="h3" className={classes.heading}>
            Associate webpages with meetings
          </Typography>
        </Grid>
        <Grid item>
          <IconButton
            size="medium"
            className={classes.leftButton}
            onClick={() => props.setStep(props.step - 1)}
          >
            <LeftArrow height="22" width="22" />
          </IconButton>
          <IconButton
            size="medium"
            className={classes.button}
            onClick={() => props.setStep(props.step + 1)}
          >
            <RightArrow height="22" width="22" />
          </IconButton>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

const OnboardingSteps = (props: { step: number; setStep: (n: number) => void }) => {
  switch (props.step) {
    case 0:
      return null;
    case 1:
      return <WelcomePopup setStep={props.setStep} step={props.step} />;
    case 2:
      return <PinAnimation setStep={props.setStep} step={props.step} />;
    case 3:
      return <MeetingsAnimation setStep={props.setStep} step={props.step} />;
    default:
      return null;
  }
};

export const Onboarding = () => {
  const isOnboardingCompleted = !!localStorage.getItem(config.IS_ONBOARDING_COMPLETED);
  const [step, setStep] = useState(isOnboardingCompleted ? 0 : 1);
  const classes = useStyles();
  return (
    <Dialog
      maxWidth="md"
      open={step > 0 && step <= maxTips}
      onClose={(_event, reason) => {
        if (reason === 'backdropClick') {
          setStep(0);
        }
      }}
    >
      <div className={classes.stepOneContainer}>
        <OnboardingSteps step={step} setStep={setStep} />
      </div>
    </Dialog>
  );
};
