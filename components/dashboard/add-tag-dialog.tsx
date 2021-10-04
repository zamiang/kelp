import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import CloseIcon from '../../public/icons/close.svg';
import { isTagSelected } from '../shared/website-tag';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: theme.spacing(6),
    position: 'relative',
    width: 480,
  },
  tag: {
    transition: 'borderBottom 0.3s',
    borderBottom: '1px solid transparent',
    display: 'inline-block',
    cursor: 'pointer',
    '&:hover': {
      borderBottomColor: theme.palette.divider,
    },
  },
  tagSelected: {
    borderBottomColor: theme.palette.primary.dark,
    '&:hover': {
      opacity: 0.8,
      borderBottomColor: theme.palette.primary.dark,
    },
  },
  closeButton: {
    position: 'absolute',
    top: 42,
    right: 42,
  },
  columnList: {
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
  const classes = useStyles();
  const [websiteTags, setWebsiteTags] = useState<string[]>([]);

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      const result = await props.store.tfidfStore.getCalculatedDocuments();
      if (result) {
        const tags = result;
        const formattedTags = tags.concat(props.userTags.map((t) => t.tag));
        return isSubscribed && setWebsiteTags(uniq(formattedTags).sort() as any);
      }
    };
    setTimeout(() => void fetchData(), 100);
    return () => (isSubscribed = false) as any;
  }, [props.store.isLoading]);

  return (
    <Dialog
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
                onClick={() => props.toggleWebsiteTag(t, '<test>')}
              >
                <Typography>{t}</Typography>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Dialog>
  );
};
