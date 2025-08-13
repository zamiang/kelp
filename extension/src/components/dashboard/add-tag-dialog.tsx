import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import config from '../../../../constants/config';
import CloseIcon from '../../../../public/icons/close.svg';
import { isTagSelected } from '../shared/website-tag';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import '../../styles/components/dashboard/add-tag-dialog.css';

export const AddTaggDialog = (props: {
  userTags: IWebsiteTag[];
  close: () => void;
  isOpen: boolean;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
  store: IStore;
}) => {
  const [websiteTags, setWebsiteTags] = useState<string[]>([]);

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      const tfidfResult = await props.store.tfidfStore.getTfidf(props.store);
      if (!tfidfResult.success) {
        console.error('Failed to get TF-IDF:', (tfidfResult as any).error);
        return;
      }

      const result = await props.store.tfidfStore.getCalculatedDocuments();
      if (result.success && isSubscribed) {
        const tags = result.data;
        const formattedTags = tags.concat(props.userTags.map((t) => t.tag));
        setWebsiteTags(uniq(formattedTags).sort() as any);
      }
    };
    void fetchData();
    return () => (isSubscribed = false) as any;
  }, [props.isOpen]);

  return (
    <Dialog
      maxWidth="md"
      open={props.isOpen}
      onClose={(_event, reason) => {
        if (reason === 'backdropClick') {
          props.close();
        }
      }}
      sx={{
        '& .MuiDialog-paper': { containerType: 'inline-size', containerName: 'add-tag-dialog' },
      }}
    >
      <div className="add-tag-dialog-content">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box flex={1}>
            <Typography variant="h3">Add tags </Typography>
          </Box>
          <Box>
            <IconButton onClick={props.close} className="add-tag-dialog-close-button" size="large">
              <CloseIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
            </IconButton>
          </Box>
        </Box>
        <ul className="add-tag-dialog-column-list">
          {websiteTags.map((t) => (
            <li key={t}>
              <div className="add-tag-dialog-tag-container">
                <Typography
                  className={clsx(
                    'add-tag-dialog-tag',
                    isTagSelected(t, props.userTags) && 'add-tag-dialog-tag-selected',
                  )}
                  onClick={() => props.toggleWebsiteTag(t)}
                  noWrap
                >
                  {t}
                </Typography>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Dialog>
  );
};
