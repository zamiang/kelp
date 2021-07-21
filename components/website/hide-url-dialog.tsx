import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import CloseIcon from '../../public/icons/close.svg';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: theme.spacing(6),
    position: 'relative',
  },
  button: {
    textDecoration: 'none',
    cursor: 'pointer',
    borderRadius: 33,
    background: theme.palette.background.paper,
    color: theme.palette.primary.main,
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    display: 'block',
    width: '100%',
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    top: 42,
    right: 42,
  },
}));

export const HideUrlDialog = (props: {
  hideDialogUrl?: string;
  hideDialogDomain?: string;
  setHideDialogUrl: (url?: string) => void;
  hideUrl: (url: string) => Promise<void>;
  hideDomain: (domain: string) => Promise<void>;
}) => {
  const classes = useStyles();
  return (
    <Dialog
      maxWidth="md"
      open={props.hideDialogUrl ? true : false}
      onClose={(_event, reason) => {
        if (reason === 'backdropClick') {
          props.setHideDialogUrl(undefined);
        }
      }}
    >
      {props.hideDialogUrl && props.hideDialogDomain && (
        <div className={classes.dialogContent}>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Typography variant="h3">No longer recommend this website</Typography>
              <br />
              <Typography color="textSecondary">
                Don’t worry, you can always undo via settings.
              </Typography>
              <br />
              <IconButton
                onClick={() => props.setHideDialogUrl(undefined)}
                className={classes.closeButton}
              >
                <CloseIcon width="24" height="24" />
              </IconButton>
            </Grid>
          </Grid>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={12}>
              <Button
                disableElevation={false}
                variant="outlined"
                onClick={() => props.hideDialogUrl && props.hideUrl(props.hideDialogUrl)}
                className={classes.button}
              >
                Hide this website
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                disableElevation={false}
                variant="outlined"
                onClick={() => props.hideDialogDomain && props.hideDomain(props.hideDialogDomain)}
                className={classes.button}
              >
                Hide all from {props.hideDialogDomain}
              </Button>
            </Grid>
          </Grid>
        </div>
      )}
    </Dialog>
  );
};
