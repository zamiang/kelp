import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { SmallPersonRow } from '../person/small-person-row';
import { IFeaturedPerson, getFeaturedPeople } from '../shared/get-featured-people';
import { HomepageButtons } from '../shared/homepage-buttons';
import { IStore } from '../store/use-store';

const FeaturedPeople = (props: { featuredPeople: IFeaturedPerson[] }) => {
  const [isVisible, setVisible] = useState(false);
  return (
    <Grid container onMouseEnter={() => setVisible(false)} onMouseLeave={() => setVisible(false)}>
      {props.featuredPeople.map((featuredPerson) => (
        <Grid item key={featuredPerson.person.id}>
          <SmallPersonRow person={featuredPerson.person} isTextVisible={isVisible} />
        </Grid>
      ))}
    </Grid>
  );
};

const useStyles = makeStyles(() => ({
  container: {
    marginTop: -15,
  },
}));

export const TopFilters = (props: {
  store: IStore;
  toggleFilter: (filter: string) => void;
  currentFilter?: string;
  hideDialogUrl?: string;
  isDarkMode: boolean;
}) => {
  const [featuredPeople, setFeaturedPeople] = useState<IFeaturedPerson[]>([]);
  const classes = useStyles();

  useEffect(() => {
    const fetchData = async () => {
      const fp = await getFeaturedPeople(props.store);
      setFeaturedPeople(fp);
    };
    void fetchData();
  }, [props.store.isLoading, props.store.lastUpdated]);

  return (
    <Grid container className={classes.container}>
      <Grid item>
        <HomepageButtons
          store={props.store}
          toggleFilter={props.toggleFilter}
          currentFilter={props.currentFilter}
          hideDialogUrl={props.hideDialogUrl}
        />
      </Grid>
      {featuredPeople.length > 0 && (
        <Grid item>
          <FeaturedPeople featuredPeople={featuredPeople} />
        </Grid>
      )}
    </Grid>
  );
};
