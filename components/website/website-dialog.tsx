import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import CloseIcon from '../../public/icons/close.svg';
import { cleanText } from '../shared/tfidf';
import { getTagsForWebsite, isTagSelected } from '../shared/website-tag';
import { IWebsiteItem, IWebsiteTag } from '../store/data-types';
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
    maxHeight: 300,
    overflow: 'auto',
    border: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(1),
    borderRadius: theme.spacing(1),
  },
  section: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    '&:last-child': {
      marginBottom: 0,
    },
  },
  smallButton: {
    width: 100,
    background: theme.palette.background.paper,
    color: theme.palette.primary.main,
    borderRadius: 16,
  },
}));

const formatAndSetWebsiteTags = async (
  item: IWebsiteItem,
  store: IStore,
  userTags: IWebsiteTag[],
  setWebsiteTags: (t: string[]) => void,
  setHideAllSuccess: (b: boolean) => void,
  setHideThisWebsiteSuccess: (b: boolean) => void,
) => {
  const text = item.tags || '';

  const i = await getTagsForWebsite(text, store, userTags);
  setWebsiteTags(i);
  setHideAllSuccess(false);
  setHideThisWebsiteSuccess(false);
};

export const WebsiteDialog = (props: {
  item?: IFeaturedWebsite;
  userTags: IWebsiteTag[];
  close: () => void;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
  store: IStore;
}) => {
  const classes = useStyles();
  const [didHideThisWebsiteSuccess, setHideThisWebsiteSuccess] = useState(false);
  const [didHideAllSuccess, setHideAllSuccess] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [websiteTags, setWebsiteTags] = useState<string[]>([]);
  const [value, setValue] = useState('');
  const [website, setWebsite] = useState<IWebsiteItem>();

  const hideDialogDomain = props.item?.websiteId ? new URL(props.item.websiteId).host : undefined;
  const hideUrl = async (url: string) => {
    await props.store.websiteBlocklistStore.addWebsite(url);
    props.store.lastUpdated = new Date();
  };

  const hideDomain = async (domain: string) => {
    await props.store.domainBlocklistStore.addDomain(domain);
    props.store.lastUpdated = new Date();
  };

  const removeTag = async (tag: string) => {
    if (!website) {
      throw new Error('missing website');
    }

    const updatedTags = websiteTags.filter((t) => t !== tag);
    const w = await props.store.websiteStore.updateTags(website.id, updatedTags.join(' '));
    if (w) {
      setWebsite(w);
      // todo update store so that it refreshes
      return await formatAndSetWebsiteTags(
        w,
        props.store,
        props.userTags,
        setWebsiteTags,
        setHideAllSuccess,
        setHideThisWebsiteSuccess,
      );
    }
  };

  const addTag = async () => {
    const tag = value;
    if (tag.length < 1) {
      return setErrorText('please enter text');
    }
    if (!website) {
      throw new Error('missing website');
    }
    setErrorText(undefined);

    websiteTags.push(tag);
    const w = await props.store.websiteStore.updateTags(website.id, websiteTags.join(' '));
    if (w) {
      setWebsite(w);
      setValue('');
      // todo update store so that it refreshes
      return await formatAndSetWebsiteTags(
        w,
        props.store,
        props.userTags,
        setWebsiteTags,
        setHideAllSuccess,
        setHideThisWebsiteSuccess,
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (props.item) {
        const w = await props.store.websiteStore.getById(props.item.websiteId);
        setWebsite(w);

        if (w) {
          await formatAndSetWebsiteTags(
            w,
            props.store,
            props.userTags,
            setWebsiteTags,
            setHideAllSuccess,
            setHideThisWebsiteSuccess,
          );
        }
      }
    };
    void fetchData();
  }, [props.item?.websiteId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(cleanText(e.target.value).join(''));
  };

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
            <Typography variant="h3">{website?.title}</Typography>
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
          <Typography variant="h4">Tags</Typography>
          <List className={classes.columnList} disablePadding>
            {websiteTags.map((t) => (
              <ListItem
                key={t}
                selected={isTagSelected(t, props.userTags)}
                button
                onClick={() => props.toggleWebsiteTag(t, props.item?.websiteId)}
              >
                <ListItemText primary={t} />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation();
                      return removeTag(t);
                    }}
                  >
                    <CloseIcon width="18" height="18" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            <ListItem>
              <div>{errorText}</div>
              <TextField
                type="text"
                placeholder="Enter a custom tag…"
                fullWidth
                autoFocus={true}
                onChange={handleChange}
                name="query"
                margin="dense"
                value={value}
                InputProps={{
                  disableUnderline: true,
                }}
              />
              <Button
                size="small"
                disableElevation={false}
                variant="outlined"
                className={classes.smallButton}
                onClick={addTag}
              >
                Add Tag
              </Button>
            </ListItem>
          </List>
        </div>
        <div className={classes.section}>
          <Typography variant="h4">No longer recommend this website</Typography>
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
