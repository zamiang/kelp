import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import CloseIcon from '../../public/icons/close.svg';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { AddTaggDialog } from './add-tag-dialog';

const PREFIX = 'TopTags';

const classes = {
  container: `${PREFIX}-container`,
  tag: `${PREFIX}-tag`,
  tagContainer: `${PREFIX}-tagContainer`,
  removeButton: `${PREFIX}-removeButton`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
  [`& .${classes.container}`]: { marginTop: theme.spacing(4) },

  [`& .${classes.tag}`]: {
    cursor: 'pointer',
    height: 24,
    '&:hover': {
      textDecoration: 'underline',
    },
  },

  [`& .${classes.tagContainer}`]: {
    '&:hover $removeButton': {
      display: 'block',
    },
  },

  [`& .${classes.removeButton}`]: {
    display: 'none',
  },
}));

export const TopTags = (props: {
  websiteTags: IWebsiteTag[];
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
}) => {
  const location = useLocation();
  const router = useHistory();
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  const onClickTag = (tag: string) => {
    const isHomeSelected = location.pathname === '/home';
    if (isHomeSelected) {
      const elem = document.getElementById(`tag-${tag}`);
      elem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      router.push('/home');
      setTimeout(() => {
        const elem = document.getElementById(`tag-${tag}`);
        elem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  };

  return (
    <Root>
      <AddTaggDialog
        userTags={props.websiteTags}
        isOpen={isDialogOpen}
        store={props.store}
        close={() => setDialogOpen(false)}
        toggleWebsiteTag={props.toggleWebsiteTag}
      />
      <Grid container className={classes.container} alignItems="center" spacing={1}>
        <Grid item xs={12}>
          <Typography color="primary" className={classes.tag} onClick={() => setDialogOpen(true)}>
            Add a tag
          </Typography>
        </Grid>
        {props.websiteTags.map((t) => (
          <Grid item key={t.tag} xs={12}>
            <Grid
              container
              alignItems="center"
              justifyContent="space-between"
              className={classes.tagContainer}
            >
              <Grid item zeroMinWidth xs>
                <Typography noWrap className={classes.tag} onClick={() => onClickTag(t.tag)}>
                  {t.tag}
                </Typography>
              </Grid>
              <Grid item className={classes.removeButton}>
                <IconButton onClick={() => props.toggleWebsiteTag(t.tag)} size="small">
                  <CloseIcon width="18" height="18" />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Typography className={classes.tag} onClick={() => onClickTag('all')}>
            Recent
          </Typography>
        </Grid>
      </Grid>
    </Root>
  );
};
