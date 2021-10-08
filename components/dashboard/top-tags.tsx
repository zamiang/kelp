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
  dot: `${PREFIX}-dot`,
  dotContainer: `${PREFIX}-dotContainer`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.container}`]: {},
  [`& .${classes.tag}`]: {
    cursor: 'pointer',
    height: 24,
    opacity: 0.5,
    transition: 'opacity 0.6s ease-out',
    '&:hover': {
      opacity: 1,
    },
  },
  [`& .${classes.tagContainer}`]: {
    [`&:hover .${classes.removeButton}`]: {
      display: 'block',
    },
    [`&:hover .${classes.dot}`]: {
      width: 10,
      height: 10,
      background: theme.palette.text.primary,
    },
  },
  [`& .${classes.removeButton}`]: {
    display: 'none',
  },
  [`& .${classes.dot}`]: {
    height: 6,
    width: 6,
    borderRadius: 5,
    transition: 'all 0.6s ease-out',
    marginRight: 'auto',
    marginLeft: 'auto',
    background: theme.palette.divider,
  },
  [`& .${classes.dotContainer}`]: {
    width: theme.spacing(3),
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
        {props.websiteTags.map((t) => (
          <Grid item key={t.tag} xs={12}>
            <Grid
              container
              alignItems="center"
              justifyContent="space-between"
              className={classes.tagContainer}
            >
              <Grid item zeroMinWidth xs>
                <Grid container alignItems="center">
                  <Grid item>
                    <div className={classes.dotContainer}>
                      <div className={classes.dot}></div>
                    </div>
                  </Grid>
                  <Grid item zeroMinWidth xs>
                    <Typography noWrap className={classes.tag} onClick={() => onClickTag(t.tag)}>
                      {t.tag}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item className={classes.removeButton}>
                <IconButton
                  onClick={() => props.toggleWebsiteTag(t.tag)}
                  size="small"
                  style={{ padding: 0 }}
                >
                  <CloseIcon width="18" height="18" />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Grid container alignItems="center" className={classes.tagContainer}>
            <Grid item>
              <div className={classes.dotContainer}>
                <div className={classes.dot}></div>
              </div>
            </Grid>
            <Grid item>
              <Typography className={classes.tag} onClick={() => onClickTag('all')}>
                Recent
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container alignItems="center" className={classes.tagContainer}>
            <Grid item>
              <div className={classes.dotContainer}>
                <div className={classes.dot}></div>
              </div>
            </Grid>
            <Grid item>
              <Typography
                color="primary"
                className={classes.tag}
                onClick={() => setDialogOpen(true)}
              >
                Add a tag
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Root>
  );
};
