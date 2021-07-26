import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';
import React, { useState } from 'react';
import config from '../../constants/config';
import { mediumFontFamily } from '../../constants/theme';
import OrangeRightArrow from '../../public/icons/orange-right-arrow.svg';

const maxTips = 4;

const useStyles = makeStyles((theme) => ({
  stepOneContainer: {
    background: theme.palette.background.default,
    transition: 'background 0.3s',
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
  tooltip: {
    background: theme.palette.background.default,
    transition: 'background 0.3s',
    position: 'fixed',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    maxWidth: 251,
    top: 54,
    left: 217,
    zIndex: 20,
  },
  tooltipSettings: {
    left: 'auto',
    right: 3,
  },
  tooltipLightTheme: {
    left: 'auto',
    right: 47,
  },
  tooltipWebsites: {
    top: 159,
    left: 39,
  },
  arrowUp: {
    position: 'absolute',
    top: -8,
    left: theme.spacing(2),
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: `8px solid ${theme.palette.background.default}`,
  },
  arrowRight: {
    position: 'absolute',
    right: -8,
    top: theme.spacing(2),
    width: 0,
    height: 0,
    borderTop: '8px solid transparent',
    borderBottom: '8px solid transparent',
    borderLeft: `8px solid ${theme.palette.background.default}`,
  },
  arrowUpLightTheme: {
    left: 'auto',
    right: theme.spacing(6),
  },
  arrowUpSettings: {
    left: 'auto',
    right: theme.spacing(2),
  },
  button: {
    padding: 0,
    marginTop: theme.spacing(1),
    fontStyle: 'normal',
    fontFamily: mediumFontFamily,
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

const WebsitesCalendarSwitcher = (props: { step: number; setStep: (step: number) => void }) => {
  const classes = useStyles();
  return (
    <div className={classes.tooltip}>
      <div className={classes.arrowUp}></div>
      <Typography>
        💡
        <span className={classes.bold}>
          Tip {props.step - 1}/{maxTips}
        </span>
        : Switch to the calendar view to see documents associated with your meetings.
      </Typography>
      <Typography
        color="primary"
        onClick={() => props.setStep(props.step + 1)}
        className={classes.button}
      >
        Next
      </Typography>
    </div>
  );
};

const LightDarkMode = (props: { step: number; setStep: (step: number) => void }) => {
  const classes = useStyles();
  return (
    <div className={clsx(classes.tooltip, classes.tooltipLightTheme)}>
      <div className={clsx(classes.arrowUp, classes.arrowUpLightTheme)}></div>
      <Typography>
        💡
        <span className={classes.bold}>
          Tip {props.step - 1}/{maxTips}
        </span>
        : Prefer a light or dark theme? Toggle to switch.
      </Typography>
      <Typography
        color="primary"
        onClick={() => props.setStep(props.step + 1)}
        className={classes.button}
      >
        Next
      </Typography>
    </div>
  );
};

const WebsitesList = (props: { step: number; setStep: (step: number) => void }) => {
  const classes = useStyles();
  return (
    <div className={clsx(classes.tooltip, classes.tooltipWebsites)}>
      <div className={classes.arrowRight}></div>
      <Typography>
        💡
        <span className={classes.bold}>
          Tip {props.step - 1}/{maxTips}
        </span>
        : These tiles are ordered based on your frequently visited sites. Hover over the text to
        remove or pin websites.
      </Typography>
      <Typography
        color="primary"
        onClick={() => {
          props.setStep(props.step + 1);
          return localStorage.setItem(config.IS_ONBOARDING_COMPLETED, 'true');
        }}
        className={classes.button}
      >
        Done!
      </Typography>
    </div>
  );
};

const SettingsTab = (props: { step: number; setStep: (step: number) => void }) => {
  const classes = useStyles();
  return (
    <div className={clsx(classes.tooltip, classes.tooltipSettings)}>
      <div className={clsx(classes.arrowUp, classes.arrowUpSettings)}></div>
      <Typography>
        💡
        <span className={classes.bold}>
          Tip {props.step - 1}/{maxTips}
        </span>
        : Setup Microsoft Teams or edit filtered websites in the settings tab.
      </Typography>
      <Typography
        color="primary"
        onClick={() => props.setStep(props.step + 1)}
        className={classes.button}
      >
        Next
      </Typography>
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
      return <SettingsTab setStep={setStep} step={step} />;
    case 5:
      return <WebsitesList setStep={setStep} step={step} />;
    default:
      return null;
  }
};
