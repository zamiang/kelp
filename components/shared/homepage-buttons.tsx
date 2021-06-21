import { makeStyles } from '@material-ui/core/styles';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
    textAlign: 'left',
    width: '100%',
  },
  label: {
    marginLeft: theme.spacing(2),
    textAlign: 'left',
  },
}));

const maxItems = 7;

export const HomepageButtons = (props: {
  store: IStore;
  toggleFilter: (filter: string) => void;
  currentFilter?: string;
  hideDialogUrl?: string;
}) => {
  const classes = useStyles();
  const router = useHistory();
  const [filterDomains, setFilterDomains] = useState<[string, number][]>([]);
  const [isVisible, setVisible] = useState(false);

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
      const orderedDomains = Object.entries(domainHash)
        .sort((a, b) => b[1] - a[1])
        .filter(Boolean);
      setFilterDomains(orderedDomains.slice(0, maxItems));
    };
    void fetchData();
  }, [props.store.isLoading, props.store.lastUpdated, props.hideDialogUrl]);

  return (
    <ToggleButtonGroup
      value={props.currentFilter || 'all'}
      className={classes.container}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      exclusive
      orientation="vertical"
      onChange={(_event, value) => {
        props.toggleFilter(value);
        router.push('/home');
      }}
    >
      <ToggleButton value="all">All</ToggleButton>
      {filterDomains.map((item) => (
        <ToggleButton value={item[0]} key={item[0]}>
          <img src={`chrome://favicon/size/48@1x/https://${item[0]}`} height="18" width="18" />
          {isVisible && (
            <div className={classes.label}>
              {item[0].split('-')[0].replace('www.', '').replace('.com', '')}
            </div>
          )}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};
