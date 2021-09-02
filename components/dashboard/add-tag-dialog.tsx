import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
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
    const fetchData = async () => {
      const result = await props.store.tfidfStore.getCalculatedDocuments();
      if (result) {
        const tags = result;
        const formattedTags = tags.concat(props.userTags.map((t) => t.tag));
        console.log(tags, formattedTags, '<<<<<<<<<<<<<<<<<<<<<<<<');
        setWebsiteTags(uniq(formattedTags).sort() as any);
      }
    };
    setTimeout(() => void fetchData(), 100);
  }, [props.store.lastUpdated, props.store.isLoading]);

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
            <IconButton onClick={props.close} className={classes.closeButton}>
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
