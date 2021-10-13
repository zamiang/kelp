import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import CloseIcon from '../../public/icons/close.svg';
import { cleanText } from '../shared/tfidf';
import { getTagsForWebsite, isTagSelected } from '../shared/website-tag';
import { IWebsiteItem, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from './get-featured-websites';

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

const formatAndSetWebsiteTags = async (
  item: IWebsiteItem,
  userTags: IWebsiteTag[],
  setWebsiteTags: (t: string[]) => void,
) => {
  const text = item.tags || '';

  const i = await getTagsForWebsite(text, userTags);
  setWebsiteTags(i);
};

export const WebsiteDialog = (props: {
  item?: IFeaturedWebsite;
  userTags: IWebsiteTag[];
  close: () => void;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
  store: IStore;
}) => {
  const [didHideAllSuccess, setHideAllSuccess] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [websiteTags, setWebsiteTags] = useState<string[]>([]);
  const [value, setValue] = useState('');
  const [website, setWebsite] = useState<IWebsiteItem>();

  const hideDialogDomain = props.item?.id ? new URL(props.item.id).host : undefined;
  const hideUrl = async (url: string) => {
    await props.store.websiteBlocklistStore.addWebsite(url);
    props.store.incrementLoading();
  };

  const hideDomain = async (domain: string) => {
    await props.store.domainBlocklistStore.addDomain(domain);
    props.store.incrementLoading();
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
      return await formatAndSetWebsiteTags(w, props.userTags, setWebsiteTags);
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
      return await formatAndSetWebsiteTags(w, props.userTags, setWebsiteTags);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (props.item) {
        const w = await props.store.websiteStore.getById(props.item.id);
        setWebsite(w);

        if (w) {
          await formatAndSetWebsiteTags(w, props.userTags, setWebsiteTags);
        }
      }
    };
    void fetchData();
  }, [props.item?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(cleanText(e.target.value).join(''));
  };

  return (
    <StyledDialog
      maxWidth="md"
      open={!!props.item}
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
              {website?.title}
            </Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={props.close} className={classes.closeButton} size="large">
              <CloseIcon width="24" height="24" />
            </IconButton>
          </Grid>
        </Grid>
        <div className={classes.section}>
          <Typography variant="h4">Tags</Typography>
          <List className={classes.columnList} disablePadding>
            {websiteTags.map((t) => (
              <ListItem
                key={t}
                selected={isTagSelected(t, props.userTags)}
                button
                onClick={() => props.toggleWebsiteTag(t, props.item?.id)}
              >
                <ListItemText primary={t} />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation();
                      return removeTag(t);
                    }}
                    size="large"
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
                variant="standard"
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
              <Button
                disableElevation={false}
                variant="outlined"
                onClick={() => {
                  if (props.item?.id) {
                    void hideUrl(props.item?.id);
                  }
                  props.close();
                }}
                className={classes.button}
              >
                Hide this website
              </Button>
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
    </StyledDialog>
  );
};
