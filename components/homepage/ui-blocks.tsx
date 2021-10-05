import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import React from 'react';

const PREFIX = 'UiBlocks';

export const classes = {
  sectionImageLeft: `${PREFIX}-sectionImageLeft`,
  image: `${PREFIX}-image`,
  greyContainer: `${PREFIX}-greyContainer`,
  heading: `${PREFIX}-heading`,
  textSection: `${PREFIX}-textSection`,
  dot: `${PREFIX}-dot`,
  sectionText: `${PREFIX}-sectionText`,
  sectionImageRightTop: `${PREFIX}-sectionImageRightTop`,
  sectionImageRightBottom: `${PREFIX}-sectionImageRightBottom`,
  section: `${PREFIX}-section`,
  notificationContainer: `${PREFIX}-notificationContainer`,
  prepareTextRight: `${PREFIX}-prepareTextRight`,
  manageWorkTextLeft: `${PREFIX}-manageWorkTextLeft`,
};

export const StyledContainer = styled(Container)(({ theme }) => ({
  [`& .${classes.sectionImageLeft}`]: {
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingRight: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
      padding: 0,
    },
  },
  [`& .${classes.image}`]: {
    maxWidth: 290,
    margin: '0px auto',
    display: 'block',
  },
  [`& .${classes.greyContainer}`]: {
    width: '100%',
  },
  [`& .${classes.heading}`]: {
    fontSize: 24,
    marginBottom: theme.spacing(3),
  },
  [`& .${classes.textSection}`]: {
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4),
    textAlign: 'center',
  },
  [`& .${classes.dot}`]: {
    height: 12,
    width: 12,
    borderRadius: 10,
    marginRight: 22,
    background: theme.palette.primary.main,
    display: 'inline-block',
    verticalAlign: 'top',
    marginTop: 8,
  },
  [`& .${classes.sectionText}`]: {
    padding: theme.spacing(6),
    [theme.breakpoints.down('md')]: {
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: theme.spacing(3),
    },
  },
  [`& .${classes.sectionImageRightTop}`]: {
    paddingBottom: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
      padding: 0,
    },
  },
  [`& .${classes.sectionImageRightBottom}`]: {
    paddingBottom: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
      padding: 0,
    },
  },
  [`& .${classes.section}`]: {
    [theme.breakpoints.down('md')]: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
  },
  [`& .${classes.notificationContainer}`]: {
    marginRight: 28,
    [theme.breakpoints.down('md')]: {
      marginRight: 'auto',
    },
  },
  [`& .${classes.prepareTextRight}`]: {
    marginLeft: 0,
    [theme.breakpoints.down('md')]: {
      marginLeft: 'auto',
    },
  },
  [`& .${classes.manageWorkTextLeft}`]: {
    marginRight: 0,
    [theme.breakpoints.down('md')]: {
      marginRight: 'auto',
    },
  },
}));

const UiBlocks = () => (
  <StyledContainer maxWidth="md">
    <Grid container className={classes.section} alignItems="center">
      <Grid item md={6} sm={12} className={classes.sectionText}>
        <Typography variant="h4" className={classes.heading}>
          <div className={classes.dot}></div>Made for humans
        </Typography>
        <Typography>
          Kelp meets you where you are. It doesn’t ask you to change how you organize information or
          collaborate.
        </Typography>
      </Grid>
      <Grid
        item
        md={6}
        sm={12}
        className={clsx(classes.sectionImageRightTop, classes.greyContainer)}
      >
        <img src="images/meeting.svg" style={{ maxHeight: 212, maxWidth: '100%' }} />
      </Grid>
    </Grid>
  </StyledContainer>
);

export default UiBlocks;
