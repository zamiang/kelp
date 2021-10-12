import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import config from '../../constants/config';
import CloseIcon from '../../public/icons/close.svg';
import { isTagSelected } from '../shared/website-tag';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';

const PREFIX = 'AddTaggDialog';

const classes = {
  dialogContent: `${PREFIX}-dialogContent`,
  tag: `${PREFIX}-tag`,
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
    transition: 'borderBottom 0.3s',
    borderBottom: '1px solid transparent',
    display: 'inline-block',
    cursor: 'pointer',
    '&:hover': {
      borderBottomColor: theme.palette.divider,
    },
  },
  [`& .${classes.tagSelected}`]: {
    borderBottomColor: theme.palette.primary.dark,
    '&:hover': {
      opacity: 0.8,
      borderBottomColor: theme.palette.primary.dark,
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
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  store: IStore;
}) => {
  const [websiteTags, setWebsiteTags] = useState<string[]>([]);

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      await props.store.tfidfStore.getTfidf(props.store);
      const result = props.store.tfidfStore.getCalculatedDocuments();
      if (result) {
        const tags = result;
        const formattedTags = tags.concat(props.userTags.map((t) => t.tag));
        return isSubscribed && setWebsiteTags(uniq(formattedTags).sort() as any);
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
        <Grid container justifyContent="space-between">
          <Grid item xs={10}>
            <Typography variant="h3">Add tags </Typography>
          </Grid>
          <Grid item xs={2}>
            <IconButton onClick={props.close} className={classes.closeButton} size="large">
              <CloseIcon width="24" height="24" />
            </IconButton>
          </Grid>
        </Grid>
        <ul className={classes.columnList}>
          {websiteTags.map((t) => (
            <li key={t}>
              <div
                className={clsx(
                  classes.tag,
                  isTagSelected(t, props.userTags) && classes.tagSelected,
                )}
                onClick={() => props.toggleWebsiteTag(t, config.INTERNAL_WEBSITE_ID)}
              >
                <Typography>{t}</Typography>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </StyledDialog>
  );
};
