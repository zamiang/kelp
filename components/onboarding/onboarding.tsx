import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useState } from 'react';
import config from '../../constants/config';
import { mediumFontFamily } from '../../constants/theme';
import OrangeRightArrow from '../../public/icons/orange-right-arrow.svg';

const maxTips = 4;

const useStyles = makeStyles((theme) => ({
  stepOneContainer: {
    background: theme.palette.background.default,
    padding: theme.spacing(4),
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
}));

export const WelcomePopup = (props: { step: number; setStep: (step: number) => void }) => {
  const classes = useStyles();
  return (
    <Dialog maxWidth="sm" open={true}>
      <div className={classes.stepOneContainer}>
        <Typography variant="h2" className={classes.heading}>
          Thank you for using Kelp :)
        </Typography>
        <br />
        <Typography variant="h4" className={classes.body}>
          Kelp is a New Tab page that gets you what you need when you need it. This means:
        </Typography>
        <br />
        <ul>
          <li>
            <Typography variant="h4">
              <span className={classes.bold}>Continue doing what you do:</span> Kelp automatically
              associates your webpages with your meetings.
            </Typography>
            <br />
          </li>
          <li>
            <Typography variant="h4">
              <span className={classes.bold}>Kelp improves over time:</span> The longer you use
              Kelp, the better the recommendations will be.
            </Typography>
          </li>
        </ul>
        <div className={classes.rightAlignButton}>
          <Button
            color="primary"
            endIcon={<OrangeRightArrow height="16" width="16" />}
            onClick={() => props.setStep(props.step + 1)}
          >
            Let&rsquo;s Go
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export const WebsitesCalendarSwitcher = (props: {
  step: number;
  setStep: (step: number) => void;
}) => {
  const classes = useStyles();
  return (
    <div className={classes.tooltip}>
      💡<Typography className={classes.bold}>Tip {props.step - 1}/3</Typography>
      <Typography>
        : Switch to calender view to see documents associated with your meetings.
      </Typography>
      <Button color="primary" onClick={() => props.setStep(props.step + 1)}>
        Next
      </Button>
    </div>
  );
};

export const LightDarkMode = (props: { step: number; setStep: (step: number) => void }) => {
  const classes = useStyles();
  return (
    <div className={classes.tooltip}>
      💡
      <Typography className={classes.bold}>
        Tip {props.step - 1}/{maxTips}
      </Typography>
      <Typography>: Prefer a light theme? Toggle to switch.</Typography>
      <Button color="primary" onClick={() => props.setStep(props.step + 1)}>
        Next
      </Button>
    </div>
  );
};

export const WebsitesList = (props: { step: number; setStep: (step: number) => void }) => {
  const classes = useStyles();
  return (
    <div className={classes.tooltip}>
      💡
      <Typography className={classes.bold}>
        Tip {props.step - 1}/{maxTips}
      </Typography>
      <Typography>
        : These tiles are ordered based on your habit. From frequently visited sites. Hover over the
        text to remove website.
      </Typography>
      <Button color="primary" onClick={() => props.setStep(props.step + 1)}>
        Next
      </Button>
    </div>
  );
};

export const SettingsTab = (props: { step: number; setStep: (step: number) => void }) => {
  const classes = useStyles();
  return (
    <div className={classes.tooltip}>
      💡
      <Typography className={classes.bold}>
        Tip {props.step - 1}/{maxTips}
      </Typography>
      <Typography>: Setup Microsoft Teams or filter websites in the settings tab.</Typography>
      <Button color="primary" onClick={() => props.setStep(props.step + 1)}>
        Next
      </Button>
    </div>
  );
};

export const Onboarding = () => {
  const isOnboardingCompleted = !!localStorage.getItem(config.IS_ONBOARDING_COMPLETED);
  const [step, setStep] = useState(isOnboardingCompleted ? 0 : 1);

  switch (step) {
    case 0:
      return null;
    case 1:
      return <WelcomePopup setStep={setStep} step={step} />;
    case 2:
      return <WebsitesCalendarSwitcher setStep={setStep} step={step} />;
    case 3:
      return <LightDarkMode setStep={setStep} step={step} />;
    case 4:
      return <WebsitesList setStep={setStep} step={step} />;
    case 5:
      return <SettingsTab setStep={setStep} step={step} />;
    default:
      return null;
  }
};
