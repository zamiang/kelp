import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import MuiLink from '@material-ui/core/Link';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import EmailIcon from '@material-ui/icons/Email';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  navBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  link: {
    color: theme.palette.primary.dark,
  },
  topButton: {
    background: theme.palette.background.paper,
  },
}));

interface IProps {
  externalLink?: string;
  onClose: () => void;
  linkedinName?: string;
  emailLink?: string;
  emailAddress?: string;
}

const CustomAppBar = (props: IProps) => {
  const classes = useStyles();
  return (
    <AppBar elevation={0} className={classes.navBar} color="transparent">
      <Toolbar variant="dense">
        {props.emailLink && (
          <Tooltip title="Email guests">
            <MuiLink href={props.emailLink} target="_blank" className={classes.link}>
              <IconButton className={classes.topButton}>
                <EmailIcon fontSize="small" />
              </IconButton>
            </MuiLink>
          </Tooltip>
        )}
        {props.emailAddress && (
          <Tooltip title="Email contact">
            <MuiLink href={`mailto:${props.emailAddress}`} target="_blank" className={classes.link}>
              <IconButton className={classes.topButton}>
                <EmailIcon fontSize="small" />
              </IconButton>
            </MuiLink>
          </Tooltip>
        )}
        {props.linkedinName && (
          <Tooltip title="Linkedin">
            <MuiLink
              target="_blank"
              rel="noreferrer"
              className={classes.link}
              href={`https://www.linkedin.com/search/results/people/?keywords=${props.linkedinName}`}
            >
              <IconButton className={classes.topButton}>
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </MuiLink>
          </Tooltip>
        )}
        {props.externalLink && (
          <Tooltip title="View in Google">
            <MuiLink href={props.externalLink} target="_blank" className={classes.link}>
              <IconButton className={classes.topButton}>
                <ExitToAppIcon fontSize="small" />
              </IconButton>
            </MuiLink>
          </Tooltip>
        )}
        <Tooltip title="Close">
          <IconButton onClick={props.onClose} className={classes.topButton}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;
