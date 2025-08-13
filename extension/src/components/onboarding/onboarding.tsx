import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import React, { useState, useEffect } from 'react';
import config from '../../../../constants/config';
import RightArrow from '../../../../public/icons/right-arrow.svg';
import '../../styles/components/onboarding/onboarding.css';

const maxTips = 3;

const WelcomePopup = (props: { step: number; setStep: (step: number) => void }) => (
  <React.Fragment>
    <img src="https://www.kelp.nyc/animations/tag-nav.gif" className="onboarding-image" />
    <Grid container justifyContent={'space-between'} alignItems="center" spacing={2}>
      <Grid>
        <Typography className="onboarding-step-counter" variant="h3">
          {props.step} / {maxTips}
        </Typography>
      </Grid>
      <Grid>
        <Typography variant="h3" className="onboarding-heading">
          Meet your magical website organizer
        </Typography>
      </Grid>
      <Grid>
        <IconButton
          size="medium"
          className="onboarding-button"
          onClick={() => props.setStep(props.step + 1)}
        >
          <RightArrow
            height={config.ICON_SIZE}
            width={config.ICON_SIZE}
            className="onboarding-icon"
          />
        </IconButton>
      </Grid>
    </Grid>
  </React.Fragment>
);

const PinAnimation = (props: { step: number; setStep: (step: number) => void }) => (
  <React.Fragment>
    <img src="https://www.kelp.nyc/animations/tag-group.gif" className="onboarding-image" />
    <Grid container justifyContent={'space-between'} alignItems="center" spacing={2}>
      <Grid>
        <Typography className="onboarding-step-counter" variant="h3">
          {props.step} / {maxTips}
        </Typography>
      </Grid>
      <Grid>
        <Typography variant="h3" className="onboarding-heading">
          Add Smart tags
        </Typography>
      </Grid>
      <Grid>
        <IconButton
          size="medium"
          className="onboarding-button onboarding-left-button"
          onClick={() => props.setStep(props.step - 1)}
        >
          <RightArrow
            height={config.ICON_SIZE}
            width={config.ICON_SIZE}
            className="onboarding-icon u-rotate-180"
          />
        </IconButton>
        <IconButton
          className="onboarding-button"
          size="medium"
          onClick={() => {
            props.setStep(props.step + 1);
            return chrome.storage.sync.set({ [config.IS_ONBOARDING_COMPLETED]: true });
          }}
        >
          <RightArrow
            height={config.ICON_SIZE}
            width={config.ICON_SIZE}
            className="onboarding-icon"
          />
        </IconButton>
      </Grid>
    </Grid>
  </React.Fragment>
);

const MeetingsAnimation = (props: { step: number; setStep: (step: number) => void }) => (
  <React.Fragment>
    <img src="https://www.kelp.nyc/animations/tag-meeting.gif" className="onboarding-image" />
    <Grid container justifyContent={'space-between'} alignItems="center" spacing={2}>
      <Grid>
        <Typography className="onboarding-step-counter" variant="h3">
          {props.step} / {maxTips}
        </Typography>
      </Grid>
      <Grid>
        <Typography variant="h3" className="onboarding-heading">
          Associate webpages with meetings
        </Typography>
      </Grid>
      <Grid>
        <IconButton
          size="medium"
          className="onboarding-button onboarding-left-button"
          onClick={() => props.setStep(props.step - 1)}
        >
          <RightArrow
            height={config.ICON_SIZE}
            width={config.ICON_SIZE}
            className="onboarding-icon u-rotate-180"
          />
        </IconButton>
        <IconButton
          size="medium"
          className="onboarding-button"
          onClick={() => props.setStep(props.step + 1)}
        >
          <RightArrow
            height={config.ICON_SIZE}
            width={config.ICON_SIZE}
            className="onboarding-icon"
          />
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
  const [step, setStep] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const isOnboardingCompleted = await chrome.storage.sync.get(config.IS_ONBOARDING_COMPLETED);
      setStep(isOnboardingCompleted[config.IS_ONBOARDING_COMPLETED] ? 0 : 1);
    };
    void fetchData();
  }, []);

  return (
    <Dialog
      maxWidth="md"
      open={step > 0 && step <= maxTips}
      onClose={(_event: any, reason: string) => {
        if (reason === 'backdropClick') {
          setStep(0);
        }
      }}
      className="onboarding-dialog"
      container-type="inline-size"
      container-name="onboarding"
    >
      <div className="onboarding-step-container">
        <OnboardingSteps step={step} setStep={setStep} />
      </div>
    </Dialog>
  );
};
