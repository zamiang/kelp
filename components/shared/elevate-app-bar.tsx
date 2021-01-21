import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import MuiLink from '@material-ui/core/Link';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
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
  emailAddress?: string;
}

const CustomAppBar = (props: IProps) => {
  const classes = useStyles();
  const editLink = props.externalLink?.replace(
    'https://www.google.com/calendar/event?eid=',
    'https://calendar.google.com/calendar/u/0/r/eventedit/',
  );
  return (
    <AppBar elevation={0} className={classes.navBar} color="transparent">
      <Toolbar>
        {props.emailAddress && (
          <MuiLink href={`mailto:${props.emailAddress}`} target="_blank" className={classes.link}>
            <IconButton className={classes.topButton}>
              <EmailIcon fontSize="small" />
            </IconButton>
          </MuiLink>
        )}
        {props.linkedinName && (
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
        )}
        {editLink && (
          <MuiLink href={editLink} target="_blank" className={classes.link}>
            <IconButton className={classes.topButton}>
              <EditIcon fontSize="small" />
            </IconButton>
          </MuiLink>
        )}
        {props.externalLink && (
          <MuiLink href={props.externalLink} target="_blank" className={classes.link}>
            <IconButton className={classes.topButton}>
              <ExitToAppIcon fontSize="small" />
            </IconButton>
          </MuiLink>
        )}
        <IconButton onClick={props.onClose} className={classes.topButton}>
          <CloseIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;
