import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useState } from 'react';
import useButtonStyles from '../shared/button-styles';
import isTouchEnabled from '../shared/is-touch-enabled';
import useRowStyles from '../shared/row-styles';
import { ITopWebsite } from '../store/data-types';
import { IStore } from '../store/use-store';

const useStyles = makeStyles(() => ({
  showRow: {
    transition: 'all 1s ease-out',
    overflow: 'hidden',
    height: 'auto',
  },
  hideRow: {
    height: 0,
    padding: 0,
  },
}));

export const WebsiteRow = (props: { website: ITopWebsite; noMargins?: boolean; store: IStore }) => {
  const rowStyles = useRowStyles();
  const buttonStyles = useButtonStyles();
  const classes = useStyles();
  const [isDetailsVisible, setDetailsVisible] = useState(isTouchEnabled());
  const [isVisible, setVisible] = useState(!props.website.isHidden);

  return (
    <div
      onMouseEnter={() => !isTouchEnabled() && setDetailsVisible(true)}
      onMouseLeave={() => !isTouchEnabled() && setDetailsVisible(false)}
      onClick={(event) => {
        event.stopPropagation();
        window.open(props.website.url);
        return false;
      }}
      className={clsx(
        rowStyles.row,
        props.noMargins && rowStyles.rowSmall,
        classes.showRow,
        !isVisible && classes.hideRow,
      )}
    >
      <Grid container alignItems="center">
        <Grid item className={rowStyles.rowLeft}>
          <IconButton size="small">
            <img
              src={`chrome://favicon/${props.website.url}`}
              height="18"
              width="18"
              style={{ margin: '0 auto' }}
            />
          </IconButton>
        </Grid>
        <Grid item zeroMinWidth xs>
          <Typography noWrap className={rowStyles.rowTopPadding}>
            {props.website.title}
          </Typography>
        </Grid>
        {isDetailsVisible && (
          <Grid item style={{ marginLeft: 'auto', paddingTop: 0, paddingBottom: 0 }}>
            <Button
              className={clsx(buttonStyles.button, buttonStyles.buttonPrimary)}
              variant="outlined"
              onClick={(event) => {
                event.stopPropagation();
                void props.store.topWebsitesStore.hideById(props.website.id);
                setTimeout(() => {
                  setVisible(false);
                }, 100);

                return false;
              }}
            >
              Hide
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  );
};
