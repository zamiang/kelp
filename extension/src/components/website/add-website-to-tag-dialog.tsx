import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import config from '../../../../constants/config';
import CloseIcon from '../../../../public/icons/close.svg';
import { cleanupUrl } from '../shared/cleanup-url';
import { IStore } from '../store/use-store';
import '../../styles/components/website/add-website-to-tag-dialog.css';

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
    const existingWebsiteResult = await props.store.websiteStore.getById(cleanUrl);
    if (existingWebsiteResult.success && existingWebsiteResult.data) {
      const existingWebsite = existingWebsiteResult.data;
      const newTags = `${props.tagForWebsiteToTagDialog} ${existingWebsite.tags}`.trim();
      await props.store.websiteStore.updateTags(existingWebsite.id, newTags);
      const itemResult = await props.store.websiteStore.getById(existingWebsite.id);
      if (itemResult.success && itemResult.data) {
        await props.store.websiteStore.moveToFront(itemResult.data.id);
      }
    } else {
      const urlObject = new URL(value);
      const itemResult = await props.store.websiteStore.trackVisit({
        url: value,
        domain: urlObject.host,
        pathname: urlObject.pathname,
        title: value,
        description: '',
      });
      if (itemResult.success && itemResult.data) {
        await props.store.websiteStore.moveToFront(itemResult.data.id);
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
    } catch (error) {
      setErrorText('Not a valid url');
      console.log(error);
      return false;
    }
  };

  return (
    <Dialog
      maxWidth="md"
      open={!!props.tagForWebsiteToTagDialog}
      onClose={(_event: any, reason: any) => {
        if (reason === 'backdropClick') {
          props.close();
        }
      }}
    >
      <div className="add-website-to-tag-dialog__content">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box flex="0 0 83.33%">
            <Typography variant="h3" noWrap>
              Add website to &#8220;{props.tagForWebsiteToTagDialog}&#8221;
            </Typography>
          </Box>
          <Box>
            <IconButton
              onClick={props.close}
              className="add-website-to-tag-dialog__close-button"
              size="large"
            >
              <CloseIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
            </IconButton>
          </Box>
        </Box>
        <div className="add-website-to-tag-dialog__section">
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
        <div className="add-website-to-tag-dialog__section">
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box flex="1">
              <Button
                disableElevation={false}
                variant="outlined"
                className="add-website-to-tag-dialog__button"
                onClick={() => props.tagForWebsiteToTagDialog && addWebsiteToTag()}
              >
                Add website to &#8220;{props.tagForWebsiteToTagDialog}&#8221;
              </Button>
            </Box>
          </Box>
        </div>
      </div>
    </Dialog>
  );
};
