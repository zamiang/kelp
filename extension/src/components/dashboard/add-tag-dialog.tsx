import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import config from '../../../../constants/config';
import CloseIcon from '../../../../public/icons/close.svg';
import { isTagSelected } from '../shared/website-tag';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';

const PREFIX = 'AddTaggDialog';

const classes = {
  dialogContent: `${PREFIX}-dialogContent`,
  tag: `${PREFIX}-tag`,
  tagContainer: `${PREFIX}-tagContainer`,
  tagSelected: `${PREFIX}-tagSelected`,
  closeButton: `${PREFIX}-closeButton`,
  columnList: `${PREFIX}-columnList`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.dialogContent}`]: {
    padding: theme.spacing(6),
    position: 'relative',
    width: 480,
  },
  [`& .${classes.tag}`]: {
    cursor: 'pointer',
  },
  [`& .${classes.tagContainer}`]: {
    width: 95,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  [`& .${classes.tagSelected}`]: {
    color: theme.palette.primary.main,
    '&:hover': {
      opacity: 0.8,
    },
  },
  [`& .${classes.closeButton}`]: {
    position: 'absolute',
    top: 42,
    right: 42,
  },
  [`& .${classes.columnList}`]: {
    columnCount: 3,
  },
}));

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
    <StyledDialog
      maxWidth="md"
      open={props.isOpen}
      onClose={(_event, reason) => {
        if (reason === 'backdropClick') {
          props.close();
        }
      }}
    >
      <div className={classes.dialogContent}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box flex={1}>
            <Typography variant="h3">Add tags </Typography>
          </Box>
          <Box>
            <IconButton onClick={props.close} className={classes.closeButton} size="large">
              <CloseIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
            </IconButton>
          </Box>
        </Box>
        <ul className={classes.columnList}>
          {websiteTags.map((t) => (
            <li key={t}>
              <div className={classes.tagContainer}>
                <Typography
                  className={clsx(
                    classes.tag,
                    isTagSelected(t, props.userTags) && classes.tagSelected,
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
    </StyledDialog>
  );
};
