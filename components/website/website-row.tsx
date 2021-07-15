import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import BackIcon from '../../public/icons/close.svg';
import isTouchEnabled from '../shared/is-touch-enabled';
import useRowStyles from '../shared/row-styles';
import { IWebsite } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from './get-featured-websites';

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

export const FeaturedWebsiteRow = (props: {
  featuredWebsite: IFeaturedWebsite;
  noMargins?: boolean;
  store: IStore;
}) => {
  const [website, setWebsite] = useState<IWebsite | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      if (props.featuredWebsite.websiteDatabaseId) {
        const result = await props.store.websitesStore.getById(
          props.featuredWebsite.websiteDatabaseId,
        );
        setWebsite(result);
      } else if (props.featuredWebsite.documentId) {
        const document = await props.store.documentDataStore.getById(
          props.featuredWebsite.documentId,
        );
        if (document) {
          setWebsite({
            id: props.featuredWebsite.websiteId,
            title: document.name || '',
            url: props.featuredWebsite.websiteId,
            domain: document?.link || '', // todo
            documentId: props.featuredWebsite.documentId,
            visitedTime: props.featuredWebsite.date,
            isHidden: false,
          });
        }
      }
    };
    void fetchData();
  }, [props.store.isLoading, props.featuredWebsite.websiteId]);

  if (website) {
    return <WebsiteRow website={website} noMargins={props.noMargins} store={props.store} />;
  }
  return null;
};

const WebsiteRow = (props: { website: IWebsite; noMargins?: boolean; store: IStore }) => {
  const rowStyles = useRowStyles();
  const classes = useStyles();
  const [isDetailsVisible, setDetailsVisible] = useState(isTouchEnabled());
  const [isVisible, setVisible] = useState(!props.website.isHidden);

  const hideUrl = async (url: string) => {
    await props.store.websiteBlocklistStore.addWebsite(url);

    setTimeout(() => {
      setVisible(false);
    }, 100);
  };

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
              src={`chrome://favicon/size/48@1x/${props.website.url}`}
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
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                void hideUrl(props.website.id);
                return false;
              }}
            >
              <BackIcon width={18} height={18} />
            </IconButton>
          </Grid>
        )}
      </Grid>
    </div>
  );
};
