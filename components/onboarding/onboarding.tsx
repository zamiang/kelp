import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useState } from 'react';
import config from '../../constants/config';
import { mediumFontFamily } from '../../constants/theme';
import RightArrow from '../../public/icons/right-arrow.svg';

const maxTips = 3;

const useStyles = makeStyles((theme) => ({
  stepOneContainer: {
    background: theme.palette.background.default,
    transition: 'background 0.3s',
    padding: theme.spacing(8),
    paddingTop: 44,
    paddingBottom: 44,
  },
  heading: {
    marignBottom: theme.spacing(2),
  },
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
    fontStyle: 'normal',
    fontFamily: mediumFontFamily,
    fontWeight: 500,
  },
  tooltip: {},
  li: {
    paddingBottom: theme.spacing(2),
  },
  image: {
    maxWidth: '100%',
    borderRadius: 20,
    marginBottom: 20,
    marginTop: 23,
    marginLeft: 'auto',
    marginRight: 'auto',
    height: 492,
    width: 848,
  },
  largeImage: {
    maxWidth: '100%',
    borderRadius: 20,
    marginBottom: 20,
    marginTop: 23,
  },
  button: {
    padding: 0,
    marginTop: theme.spacing(1),
    fontStyle: 'normal',
    fontFamily: mediumFontFamily,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 500,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

const WelcomePopup = (props: { step: number; setStep: (step: number) => void }) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Typography variant="h2" className={classes.heading}>
        Meet your magical website organizer
      </Typography>
      <img src="https://www.kelp.nyc/images/meetings-large.svg" className={classes.largeImage} />
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography>Note: Images for your websites will appear over time</Typography>
        </Grid>
        <Grid item>
          <Button
            color="primary"
            variant="contained"
            size="large"
            endIcon={<RightArrow height="16" width="16" />}
            onClick={() => props.setStep(props.step + 1)}
          >
            Let&rsquo;s Go
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

const TagsAnimation = (props: { step: number; setStep: (step: number) => void }) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Typography variant="h2" className={classes.heading}>
        Add smart tags
      </Typography>
      <img src="https://www.kelp.nyc/animations/tags.gif" className={classes.image} />
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography className={classes.bold} variant="h4">
            Tip {props.step - 1}/{maxTips}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            color="primary"
            variant="contained"
            size="large"
            endIcon={<RightArrow height="16" width="16" />}
            onClick={() => props.setStep(props.step + 1)}
          >
            Next
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

const PinAnimation = (props: { step: number; setStep: (step: number) => void }) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Typography variant="h2" className={classes.heading}>
        Pin or remove websites.
      </Typography>
      <img src="https://www.kelp.nyc/animations/pin.gif" className={classes.image} />
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography className={classes.bold} variant="h4">
            Tip {props.step - 1}/{maxTips}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            color="primary"
            endIcon={<RightArrow height="16" width="16" />}
            variant="contained"
            size="large"
            onClick={() => {
              props.setStep(props.step + 1);
              return localStorage.setItem(config.IS_ONBOARDING_COMPLETED, 'true');
            }}
          >
            Done!
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

const MeetingsAnimation = (props: { step: number; setStep: (step: number) => void }) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Typography variant="h2" className={classes.heading}>
        Kelp associates webpages with meetings
      </Typography>
      <img src="https://www.kelp.nyc/animations/meetings.gif" className={classes.image} />
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography className={classes.bold} variant="h4">
            {props.step - 1}/{maxTips}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            color="primary"
            variant="contained"
            size="large"
            endIcon={<RightArrow height="16" width="16" />}
            onClick={() => props.setStep(props.step + 1)}
          >
            Next
          </Button>
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
      return <MeetingsAnimation setStep={props.setStep} step={props.step} />;
    case 3:
      return <TagsAnimation setStep={props.setStep} step={props.step} />;
    case 4:
      return <PinAnimation setStep={props.setStep} step={props.step} />;
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
      open={step > 0 && step <= maxTips + 1}
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
