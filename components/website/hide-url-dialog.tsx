import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { boxShadow } from '../../constants/theme';
import CloseIcon from '../../public/icons/close.svg';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: theme.spacing(8),
  },
  button: {
    textDecoration: 'none',
    cursor: 'pointer',
    boxShadow,
    borderRadius: 20,
    background: theme.palette.background.paper,
    color: theme.palette.primary.main,
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
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
      onBackdropClick={() => props.setHideDialogUrl(undefined)}
    >
      {props.hideDialogUrl && props.hideDialogDomain && (
        <div className={classes.dialogContent}>
          <Grid container justify="space-between">
            <Grid item>
              <Typography variant="h3" noWrap>
                No longer recommend this website
              </Typography>
            </Grid>
            <Grid item>
              <IconButton onClick={() => props.setHideDialogUrl(undefined)}>
                <CloseIcon width="24" height="24" />
              </IconButton>
            </Grid>
          </Grid>
          <Grid container alignItems="center" justify="space-between">
            <Grid item xs={5}>
              <Button
                disableElevation={false}
                onClick={() => props.hideDialogDomain && props.hideDomain(props.hideDialogDomain)}
                className={classes.button}
              >
                Hide all from {props.hideDialogDomain}
              </Button>
            </Grid>
            <Grid item>
              <Typography variant="h3">OR</Typography>
            </Grid>
            <Grid item xs={5}>
              <Button
                disableElevation={false}
                onClick={() => props.hideDialogUrl && props.hideUrl(props.hideDialogUrl)}
                className={classes.button}
              >
                Hide this website
              </Button>
            </Grid>
          </Grid>
        </div>
      )}
    </Dialog>
  );
};
