import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import CloseIcon from '../../public/icons/close.svg';
import { cleanText } from '../shared/tfidf';
import { getTagsForWebsite, isTagSelected } from '../shared/website-tag';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from './get-featured-websites';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: theme.spacing(6),
    position: 'relative',
    width: 480,
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
  columnList: {
    columnCount: 2,
  },
  tag: {
    display: 'inline-block',
    marginRight: theme.spacing(2),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    transition: 'opacity 0.3s',
    borderRadius: 5,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  tagSelected: {
    pointerEvents: 'all',
    cursor: 'pointer',
    background: theme.palette.primary.dark,
  },
  section: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '&:last-child': {
      marginBottom: 0,
    },
  },
}));

export const WebsiteDialog = (props: {
  item?: IFeaturedWebsite;
  userTags: IWebsiteTag[];
  close: () => void;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  store: IStore;
}) => {
  const classes = useStyles();
  const [didHideThisWebsiteSuccess, setHideThisWebsiteSuccess] = useState(false);
  const [didHideAllSuccess, setHideAllSuccess] = useState(false);
  const [websiteTags, setWebsiteTags] = useState<string[]>([]);

  const hideDialogDomain = props.item?.websiteId ? new URL(props.item.websiteId).host : undefined;
  const hideUrl = async (url: string) => {
    await props.store.websiteBlocklistStore.addWebsite(url);
    props.store.lastUpdated = new Date();
  };

  const hideDomain = async (domain: string) => {
    await props.store.domainBlocklistStore.addDomain(domain);
    props.store.lastUpdated = new Date();
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!props.item) {
        return;
      }
      const text =
        props.item.cleanText ||
        cleanText(props.item.text || '')
          .join(' ')
          .toLocaleLowerCase();

      const i = await getTagsForWebsite(text, props.store, props.userTags);
      setWebsiteTags(i);
      setHideAllSuccess(false);
      setHideThisWebsiteSuccess(false);
    };
    void fetchData();
  }, [props.item?.websiteId]);

  return (
    <Dialog
      maxWidth="md"
      open={!!props.item}
      onClose={(_event, reason) => {
        if (reason === 'backdropClick') {
          props.close();
        }
      }}
    >
      <div className={classes.dialogContent}>
        <Grid container justifyContent="space-between">
          <Grid item xs={10}>
            <Typography variant="h3">{props.item?.text}</Typography>
            <br />
          </Grid>
          <Grid item xs={2}>
            <IconButton onClick={props.close} className={classes.closeButton}>
              <CloseIcon width="24" height="24" />
            </IconButton>
          </Grid>
        </Grid>
        <Divider />
        <div className={classes.section}>
          <Typography variant="h4">Edit tags</Typography>
          <ul className={classes.columnList}>
            {websiteTags.map((t) => (
              <li key={t}>
                <div
                  onClick={() => props.toggleWebsiteTag(t, '<test>')}
                  className={clsx(
                    classes.tag,
                    isTagSelected(t, props.userTags) && classes.tagSelected,
                  )}
                >
                  <Typography>{t}</Typography>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <Divider />
        <div className={classes.section}>
          <Typography variant="h4">No longer recommend this website</Typography>
          <br />
          <Typography color="textSecondary">
            Don’t worry, you can always undo via settings.
          </Typography>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={12}>
              {didHideThisWebsiteSuccess && (
                <Button
                  disableElevation={false}
                  variant="outlined"
                  disabled
                  className={classes.button}
                >
                  This website will be hidden
                </Button>
              )}
              {!didHideThisWebsiteSuccess && (
                <Button
                  disableElevation={false}
                  variant="outlined"
                  onClick={() =>
                    props.item?.websiteId &&
                    hideUrl(props.item?.websiteId) &&
                    setHideThisWebsiteSuccess(true)
                  }
                  className={classes.button}
                >
                  Hide this website
                </Button>
              )}
            </Grid>
            <Grid item xs={12}>
              {didHideAllSuccess && (
                <Button
                  disableElevation={false}
                  variant="outlined"
                  disabled
                  className={classes.button}
                >
                  All websites from {hideDialogDomain} will be hidden
                </Button>
              )}
              {!didHideAllSuccess && (
                <Button
                  disableElevation={false}
                  variant="outlined"
                  onClick={() =>
                    hideDialogDomain && hideDomain(hideDialogDomain) && setHideAllSuccess(true)
                  }
                  className={classes.button}
                >
                  Hide all from {hideDialogDomain}
                </Button>
              )}
            </Grid>
          </Grid>
        </div>
      </div>
    </Dialog>
  );
};
