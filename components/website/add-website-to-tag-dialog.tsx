import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import CloseIcon from '../../public/icons/close.svg';
import { cleanupUrl } from '../shared/cleanup-url';
import { IStore } from '../store/use-store';

const PREFIX = 'WebsiteDialog';

const classes = {
  dialogContent: `${PREFIX}-dialogContent`,
  button: `${PREFIX}-button`,
  closeButton: `${PREFIX}-closeButton`,
  columnList: `${PREFIX}-columnList`,
  section: `${PREFIX}-section`,
  smallButton: `${PREFIX}-smallButton`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.dialogContent}`]: {
    padding: theme.spacing(6),
    position: 'relative',
    width: 480,
  },
  [`& .${classes.button}`]: {
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
  [`& .${classes.closeButton}`]: {},
  [`& .${classes.columnList}`]: {
    maxHeight: 300,
    overflow: 'auto',
    border: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
  },
  [`& .${classes.section}`]: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    '&:last-child': {
      marginBottom: 0,
    },
  },
  [`& .${classes.smallButton}`]: {
    width: 100,
    background: theme.palette.background.paper,
    color: theme.palette.primary.main,
    borderRadius: 16,
  },
}));

export const AddWebsiteToTagDialog = (props: {
  tagForWebsiteToTagDialog?: string;
  close: () => void;
  store: IStore;
}) => {
  const [errorText, setErrorText] = useState<string | undefined>();
  const [value, setValue] = useState('');

  const addWebsiteToTag = async () => {
    if (errorText || !value) {
      return;
    }
    const cleanUrl = cleanupUrl(value);
    const existingWebsite = await props.store.websiteStore.getById(cleanUrl);
    if (existingWebsite) {
      const newTags = `${props.tagForWebsiteToTagDialog} ${existingWebsite.tags}`.trim();
      const item = await props.store.websiteStore.updateTags(existingWebsite.id, newTags);
      if (item) {
        await props.store.websiteStore.moveToFront(item.id);
      }
    } else {
      const urlObject = new URL(value);
      const item = await props.store.websiteStore.trackVisit({
        url: value,
        domain: urlObject.host,
        pathname: urlObject.pathname,
        title: value,
        description: '',
      });
      if (item) {
        await props.store.websiteStore.moveToFront(item.id);
      }
    }

    props.store.incrementLoading();
    props.close();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    try {
      new URL(e.target.value);
      setErrorText(undefined);
    } catch (_) {
      setErrorText('Not a valid url');
      return false;
    }
  };

  return (
    <StyledDialog
      maxWidth="md"
      open={!!props.tagForWebsiteToTagDialog}
      onClose={(_event, reason) => {
        if (reason === 'backdropClick') {
          props.close();
        }
      }}
    >
      <div className={classes.dialogContent}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs={10}>
            <Typography variant="h3" noWrap>
              Add website to &#8220;{props.tagForWebsiteToTagDialog}&#8221;
            </Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={props.close} className={classes.closeButton} size="large">
              <CloseIcon width="24" height="24" />
            </IconButton>
          </Grid>
        </Grid>
        <div className={classes.section}>
          <TextField
            type="text"
            placeholder="Paste a url"
            fullWidth
            autoFocus={true}
            onChange={handleChange}
            name="query"
            margin="dense"
            variant="standard"
            value={value}
            InputProps={{
              disableUnderline: true,
            }}
          />
        </div>
        <div className={classes.section}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={12}>
              <Button
                disableElevation={false}
                variant="outlined"
                className={classes.button}
                onClick={() => props.tagForWebsiteToTagDialog && addWebsiteToTag()}
              >
                Add website to &#8220;{props.tagForWebsiteToTagDialog}&#8221;
              </Button>
            </Grid>
          </Grid>
        </div>
      </div>
    </StyledDialog>
  );
};
