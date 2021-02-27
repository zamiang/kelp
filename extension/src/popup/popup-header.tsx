import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import BackIcon from '@material-ui/icons/ArrowBack';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import clsx from 'clsx';
import React, { useState } from 'react';
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
import RefreshButton from '../../../components/nav/refresh-button';
import SearchBar from '../../../components/nav/search-bar';
import { IPerson } from '../../../components/store/models/person-model';
import { IStore } from '../../../components/store/use-store';

const useHeaderStyles = makeStyles((theme) => ({
  logo: {
    width: 24,
    height: 24,
  },
  drawerPaper: {
    border: '0px',
    position: 'sticky',
    top: 0,
    left: 0,
    background: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    zIndex: 6,
    justifyContent: 'space-between',
  },
  unSelected: {
    color: theme.palette.text.primary,
    transition: 'border 0.3s',
    borderBottom: `1px solid ${theme.palette.background.paper}`,
    '&:hover': {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  },
  icon: {
    width: 22,
    height: 22,
  },
}));

const PluginHeader = (props: { store: IStore; user?: IPerson }) => {
  const [isSearchInputVisible, setSearchInputVisible] = useState<boolean>(false);
  const classes = useHeaderStyles();
  const history = useHistory();
  const location = useLocation();
  const isOnSubpage = location.pathname.split('/').length > 2;

  if (isOnSubpage) {
    return (
      <header className={classes.drawerPaper}>
        <Grid container alignItems="center" justify="space-between">
          <Grid item>
            <IconButton
              onClick={() => {
                history.goBack();
              }}
            >
              <BackIcon />
            </IconButton>
          </Grid>
        </Grid>
      </header>
    );
  }

  if (isSearchInputVisible) {
    return (
      <header className={classes.drawerPaper}>
        <Grid container alignItems="center" justify="space-between">
          <Grid item>
            <SearchBar />
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => {
                history.goBack();
                setSearchInputVisible(false);
              }}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
      </header>
    );
  }

  return (
    <header className={classes.drawerPaper}>
      <Grid container alignItems="center" justify="space-between">
        <Grid item>
          <Grid container alignItems="center">
            <Grid item>
              <Link to="/meetings" component={RouterLink}>
                <img className={classes.logo} src="/logo.svg" alt="Kelp logo" />
              </Link>
            </Grid>
            <Grid item>
              <IconButton onClick={() => setSearchInputVisible(true)}>
                <SearchIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container alignItems="center">
            {isSearchInputVisible && (
              <Grid item>
                <IconButton>
                  <CloseIcon />
                </IconButton>
              </Grid>
            )}
            <Grid item>
              <RefreshButton
                isLoading={props.store.isLoading}
                refresh={props.store.refetch}
                lastUpdated={props.store.lastUpdated}
                loadingMessage={props.store.loadingMessage}
              />
            </Grid>
            {props.user && (
              <Grid item>
                <IconButton
                  className={'ignore-react-onclickoutside'}
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  onClick={() => history.push('/settings')}
                >
                  <Avatar
                    className={clsx(classes.unSelected, classes.icon)}
                    src={props.user.imageUrl || undefined}
                    alt={props.user.name || props.user.emailAddresses[0] || undefined}
                  />
                </IconButton>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </header>
  );
};

export default PluginHeader;
