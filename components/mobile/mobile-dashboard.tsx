import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { backgroundGradient } from '../../constants/theme';
import Home from '../dashboard/chrome-popup';
import Documents from '../dashboard/documents';
import Meetings from '../dashboard/meetings';
import People from '../dashboard/people';
import Search from '../dashboard/search';
import ExpandedDocument from '../documents/expand-document';
import ExpandedMeeting from '../meeting/expand-meeting';
import ExpandPerson from '../person/expand-person';
import { IStore } from '../store/use-store';
import Settings from '../user-profile/settings';
import { IFeaturedWebsite } from '../website/get-featured-websites';
import { HideUrlDialog } from '../website/hide-url-dialog';
import Handle404 from './handle-404';
import PopupHeader from './popup-header';

const useInfoStyles = makeStyles((theme) => ({
  '@keyframes backgroundAnimationMobile': {
    from: {
      backgroundPosition: '0% 75%',
    },
    '50%': { backgroundPosition: '100% 26%' },
    to: { backgroundPosition: '0% 75%' },
  },
  homeRow: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  box: {
    background: '#fff',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  content: {
    background: backgroundGradient,
    backgroundSize: '400% 400%',
    animation: '$backgroundAnimationMobile 20s ease infinite',
    overscrollBehavior: 'contain',
    overscrollBehaviorY: 'none',
    overscrollBehaviorX: 'none',
    minHeight: '100vh',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    overflow: 'hidden',
  },
  container: {
    position: 'relative',
  },
  footer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    textAlign: 'center',
    zIndex: 15,
  },
  icon: {
    color: theme.palette.secondary.light,
    transition: 'border-color 0.6s',
    textAlign: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderBottom: 0,
  },
  iconButton: {
    borderRadius: 0,
    width: '100%',
    paddingBottom: 10,
  },
  iconButtonLarge: {
    borderRadius: 0,
    width: '100%',
    padding: 20,
  },
  selected: {
    color: `${theme.palette.secondary.dark} !important`,
  },
  bottom: {
    position: 'fixed',
    borderTop: `1px solid ${theme.palette.divider}`,
    bottom: 0,
    left: 0,
    width: '100vw',
    background: theme.palette.background.paper,
  },
}));

const MobileDashboard = (props: { store: IStore }) => {
  const store = props.store;
  const classes = useInfoStyles();
  const [hideDialogUrl, setHideDialogUrl] = useState<string | undefined>();
  const hideDialogDomain = hideDialogUrl ? new URL(hideDialogUrl).host : undefined;

  const hideItem = (item: IFeaturedWebsite) => setHideDialogUrl(item.websiteId);

  const hideUrl = async (url: string) => {
    await props.store.websiteBlocklistStore.addWebsite(url);
    setHideDialogUrl(undefined);
  };

  const hideDomain = async (domain: string) => {
    await props.store.domainBlocklistStore.addDomain(domain);
    setHideDialogUrl(undefined);
  };

  return (
    <div className={classes.content}>
      <PopupHeader store={store} />
      <HideUrlDialog
        hideDomain={hideDomain}
        hideUrl={hideUrl}
        hideDialogDomain={hideDialogDomain}
        hideDialogUrl={hideDialogUrl}
        setHideDialogUrl={setHideDialogUrl}
      />
      <div className={classes.container}>
        <Switch>
          <Route path="/search">
            <Search store={store} />
          </Route>
          <Route path="/home">
            <Home store={store} hideWebsite={hideItem} hideDialogUrl={hideDialogUrl} />
          </Route>
          <Route path="/people/:slug">
            <Box className={classes.box} boxShadow={1} borderRadius={16}>
              <ExpandPerson store={store} />
            </Box>
          </Route>
          <Route path="/documents/:slug">
            <Box className={classes.box} boxShadow={1} borderRadius={16}>
              <ExpandedDocument store={store} />
            </Box>
          </Route>
          <Route path="/meetings/:slug">
            <Box className={classes.box} boxShadow={1} borderRadius={16}>
              <ExpandedMeeting store={store} />
            </Box>
          </Route>
          <Route path="/meetings">
            <Box className={classes.box} boxShadow={1} borderRadius={16}>
              <Meetings
                store={store}
                hideWebsite={hideItem}
                hideDialogUrl={hideDialogUrl}
                currentFilter="all"
              />
            </Box>
          </Route>
          <Route path="/people">
            <Box className={classes.box} boxShadow={1} borderRadius={16}>
              <People store={store} />
            </Box>
          </Route>
          <Route path="/documents">
            <Box className={classes.box} boxShadow={1} borderRadius={16}>
              <Documents store={store} />
            </Box>
          </Route>
          <Route path="/settings">
            <Box className={classes.box} boxShadow={1} borderRadius={16}>
              <Settings store={store} />
            </Box>
          </Route>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
          <Route>
            <Handle404 />
          </Route>
        </Switch>
      </div>
    </div>
  );
};
export default MobileDashboard;
