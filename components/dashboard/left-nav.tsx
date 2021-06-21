import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import BackIcon from '../../public/icons/back.svg';
import SearchIcon from '../../public/icons/search.svg';
import SettingsIcon from '../../public/icons/settings.svg';
import SearchBar from '../nav/search-bar';
import { SmallPersonRow } from '../person/small-person-row';
import { HomepageButtons } from '../shared/homepage-buttons';
import { IStore } from '../store/use-store';
import { IFeaturedPerson, getFeaturedPeople } from './people';

const SearchBarContainer = () => {
  const [isSearchInputVisible, setSearchInputVisible] = useState<boolean>(false);
  const router = useHistory();
  const isOnSubpage =
    router.location.pathname !== '/home' && router.location.pathname !== '/search';

  if (isOnSubpage) {
    return (
      <Grid container alignItems="flex-start" justify="space-between">
        <Grid item>
          <IconButton
            onClick={() => {
              router.goBack();
            }}
          >
            <BackIcon width="24" height="24" />
          </IconButton>
        </Grid>
      </Grid>
    );
  }

  if (isSearchInputVisible) {
    return (
      <div style={{ height: 40 }}>
        <SearchBar onClose={() => setSearchInputVisible(false)} />
      </div>
    );
  }

  return (
    <Grid
      container
      alignItems="flex-start"
      justify="space-between"
      onClick={() => setSearchInputVisible(true)}
    >
      <Grid item>
        <IconButton onClick={() => setSearchInputVisible(true)}>
          <SearchIcon width="24" height="24" />
        </IconButton>
      </Grid>
    </Grid>
  );
};

const FeaturedPeople = (props: { featuredPeople: IFeaturedPerson[] }) => {
  const [isVisible, setVisible] = useState(false);
  return (
    <Grid container onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {props.featuredPeople.map((featuredPerson) => (
        <Grid item key={featuredPerson.person.id} xs={12}>
          <SmallPersonRow person={featuredPerson.person} isTextVisible={isVisible} />
        </Grid>
      ))}
    </Grid>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
    maxWidth: 180,
    overflow: 'hidden',
  },
}));

export const LeftNav = (props: {
  store: IStore;
  toggleFilter: (filter: string) => void;
  currentFilter?: string;
  hideDialogUrl?: string;
}) => {
  const classes = useStyles();
  const router = useHistory();
  const [featuredPeople, setFeaturedPeople] = useState<IFeaturedPerson[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const fp = await getFeaturedPeople(props.store);
      setFeaturedPeople(fp);
    };
    void fetchData();
  }, [props.store.isLoading, props.store.lastUpdated]);

  return (
    <Grid container className={classes.container} spacing={3}>
      <Grid item xs={12}>
        <SearchBarContainer />
      </Grid>
      <Grid item xs={12}>
        <HomepageButtons
          store={props.store}
          toggleFilter={props.toggleFilter}
          currentFilter={props.currentFilter}
          hideDialogUrl={props.hideDialogUrl}
        />
      </Grid>
      {featuredPeople.length > 0 && (
        <Grid item xs={12}>
          <FeaturedPeople featuredPeople={featuredPeople} />
        </Grid>
      )}
      <Grid item xs={12}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <IconButton
              className={'ignore-react-onclickoutside'}
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={(event) => {
                event.preventDefault();
                return router.push('/settings');
              }}
            >
              <SettingsIcon width="24" height="24" />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
