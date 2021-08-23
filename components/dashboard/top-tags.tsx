import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { sortBy } from 'lodash';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { AddTaggDialog } from './add-tag-dialog';

const useStyles = makeStyles(() => ({
  container: {},
  tag: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

export const TopTags = (props: {
  websiteTags: IWebsiteTag[];
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
}) => {
  const classes = useStyles();
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
    <div>
      <AddTaggDialog
        userTags={props.websiteTags}
        isOpen={isDialogOpen}
        store={props.store}
        close={() => setDialogOpen(false)}
        toggleWebsiteTag={props.toggleWebsiteTag}
      />
      <Grid container className={classes.container} alignItems="center" spacing={2}>
        <Grid item>
          <Typography className={classes.tag} onClick={() => onClickTag('all')}>
            All
          </Typography>
        </Grid>
        {sortBy(props.websiteTags, 'tag').map((t) => (
          <React.Fragment key={t.tag}>
            <Grid item>
              <Typography className={classes.tag} onClick={() => onClickTag(t.tag)}>
                {t.tag}
              </Typography>
            </Grid>
          </React.Fragment>
        ))}
        <Grid item>
          <Typography color="primary" className={classes.tag} onClick={() => setDialogOpen(true)}>
            add
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};
