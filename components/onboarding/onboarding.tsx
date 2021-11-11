import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import config from '../../constants/config';
import { mediumFontFamily } from '../../constants/homepage-theme';
import LeftArrow from '../../public/icons/left-arrow.svg';
import RightArrow from '../../public/icons/right-arrow.svg';

const PREFIX = 'Onboarding';

const classes = {
  stepOneContainer: `${PREFIX}-stepOneContainer`,
  heading: `${PREFIX}-heading`,
  body: `${PREFIX}-body`,
  rightAlignButton: `${PREFIX}-rightAlignButton`,
  bold: `${PREFIX}-bold`,
  li: `${PREFIX}-li`,
  image: `${PREFIX}-image`,
  button: `${PREFIX}-button`,
  leftButton: `${PREFIX}-leftButton`,
  icon: `${PREFIX}-leftButton`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.stepOneContainer}`]: {
    background: theme.palette.background.default,
    transition: 'background 0.3s',
    padding: 20,
    paddingBottom: 40,
  },

  [`& .${classes.heading}`]: { display: 'inline-block', marginLeft: theme.spacing(2) },

  [`& .${classes.body}`]: {
    marignBottom: theme.spacing(2),
  },

  [`& .${classes.rightAlignButton}`]: {
    textAlign: 'right',
    marginTop: theme.spacing(4),
    fontSize: 16,
    display: 'block',
  },

  [`& .${classes.bold}`]: {
    display: 'inline-block',
    fontStyle: 'normal',
    fontFamily: mediumFontFamily,
    fontWeight: 500,
    color: theme.palette.primary.main,
  },

  [`& .${classes.li}`]: {
    paddingBottom: theme.spacing(2),
  },

  [`& .${classes.image}`]: {
    maxWidth: '100%',
    borderRadius: 20,
    marginBottom: 30,
    marginLeft: 'auto',
    marginRight: 'auto',
    height: 400,
    width: 600,
  },

  [`& .${classes.button}`]: {
    background: 'rgba(0, 0, 0, 0.12)',
  },

  [`& .${classes.leftButton}`]: {
    marginRight: theme.spacing(2),
  },
}));

const maxTips = 3;

const WelcomePopup = (props: { step: number; setStep: (step: number) => void }) => (
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
          <RightArrow height={config.ICON_SIZE} width={config.ICON_SIZE} />
        </IconButton>
      </Grid>
    </Grid>
  </React.Fragment>
);

const PinAnimation = (props: { step: number; setStep: (step: number) => void }) => (
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
          <LeftArrow height={config.ICON_SIZE} width={config.ICON_SIZE} />
        </IconButton>
        <IconButton
          className={classes.button}
          size="medium"
          onClick={() => {
            props.setStep(props.step + 1);
            return localStorage.setItem(config.IS_ONBOARDING_COMPLETED, 'true');
          }}
        >
          <RightArrow height={config.ICON_SIZE} width={config.ICON_SIZE} />
        </IconButton>
      </Grid>
    </Grid>
  </React.Fragment>
);

const MeetingsAnimation = (props: { step: number; setStep: (step: number) => void }) => (
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
          <LeftArrow height={config.ICON_SIZE} width={config.ICON_SIZE} />
        </IconButton>
        <IconButton
          size="medium"
          className={classes.button}
          onClick={() => props.setStep(props.step + 1)}
        >
          <RightArrow height={config.ICON_SIZE} width={config.ICON_SIZE} />
        </IconButton>
      </Grid>
    </Grid>
  </React.Fragment>
);

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

  return (
    <StyledDialog
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
    </StyledDialog>
  );
};
