import { makeStyles } from '@material-ui/core/styles';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import React, { useEffect, useState } from 'react';
import { boxShadow } from '../../constants/theme';
import { IStore } from '../store/use-store';

const useStyles = makeStyles((theme) => ({
  button: {
    textDecoration: 'none',
    cursor: 'pointer',
    boxShadow,
    borderRadius: 20,
    background: theme.palette.background.paper,
    color: theme.palette.primary.main,
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
  },
  container: {
    marginBottom: theme.spacing(2),
  },
  label: {
    marginLeft: theme.spacing(1),
  },
}));

const maxItems = 20;

export const HomepageButtons = (props: {
  store: IStore;
  toggleFilter: (filter: string) => void;
  currentFilter: string | undefined;
}) => {
  const classes = useStyles();
  const [filterDomains, setFilterDomains] = useState<[string, number][]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const websites = await props.store.websitesStore.getAll(
        props.store.domainBlocklistStore,
        props.store.websiteBlocklistStore,
      );
      const domainHash = websites.reduce(
        (acc: { [id: string]: number }, curr) => (
          (acc[curr.domain] = (acc[curr.domain] || 0) + 1), acc
        ),
        {},
      );
      const orderedDomains = Object.entries(domainHash).sort((a, b) => b[1] - a[1]);
      setFilterDomains(orderedDomains.slice(0, maxItems));
    };
    void fetchData();
  }, []);

  return (
    <ToggleButtonGroup
      value={props.currentFilter || 'all'}
      className={classes.container}
      exclusive
      onChange={(_event, value) => props.toggleFilter(value)}
    >
      <ToggleButton value="all">All</ToggleButton>
      {filterDomains.map((item) => (
        <ToggleButton value={item[0]} key={item[0]}>
          <img src={`chrome://favicon/size/48@1x/https://${item[0]}`} height="12" />
          <div className={classes.label}>{item[0]}</div>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};
