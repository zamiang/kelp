import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import CheckIconOrange from '../../public/icons/check-orange.svg';
import useButtonStyles from '../shared/button-styles';
import panelStyles from '../shared/panel-styles';
import useRowStyles from '../shared/row-styles';
import { ITopWebsite } from '../store/data-types';
import { IStore } from '../store/use-store';
import { WebsiteRow } from '../website/website-row';

const useStyle = makeStyles(() => ({
  container: {
    position: 'relative',
    border: '0px solid',
  },
  input: {},
}));

const AddWebsite = (props: {
  store: IStore;
  increment: number;
  setIncrement: (increment: number) => void;
}) => {
  const formStyles = useStyle();
  const buttonStyles = useButtonStyles();
  const classes = useRowStyles();
  const [isEditing, setIsEditing] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  if (isEditing) {
    return (
      <div className={clsx(classes.rowNoHover, formStyles.container)}>
        <Typography variant="h6">Add a custom site</Typography>
        <TextField
          variant="filled"
          placeholder="https://..."
          fullWidth
          onChange={(event) => {
            setUrl(event.target.value);
          }}
          value={url}
        />
        <TextField
          style={{ marginTop: 12 }}
          variant="filled"
          placeholder="Name of the site"
          fullWidth
          onChange={(event) => {
            setTitle(event.target.value);
          }}
          value={title}
        />
        <br />
        <Button
          className={clsx(buttonStyles.button, buttonStyles.buttonPrimary)}
          variant="outlined"
          startIcon={<CheckIconOrange width="24" height="24" />}
          style={{ marginTop: 12 }}
          onClick={() => {
            void props.store.topWebsitesStore.addWebsite(url, title);
            setIsEditing(false);
            props.setIncrement(props.increment + 1);
          }}
        >
          Save
        </Button>
      </div>
    );
  }

  return (
    <div className={clsx(classes.rowNoHover, formStyles.container)}>
      <Button
        className={clsx(buttonStyles.button, buttonStyles.buttonPrimary)}
        variant="outlined"
        onClick={(event) => {
          event.stopPropagation();
          setIsEditing(true);
          return false;
        }}
      >
        Add
      </Button>
    </div>
  );
};

const TopWebsiteList = (props: { store: IStore }) => {
  const classes = useRowStyles();
  const [topWebsites, setTopWebsites] = useState<ITopWebsite[]>([]);
  const [customWebsites, setCustomWebsites] = useState<ITopWebsite[]>([]);
  const [increment, setIncrement] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
      const ws = await props.store.topWebsitesStore.getAll();
      setTopWebsites(ws.filter((w) => !w.isCustom));
      setCustomWebsites(ws.filter((w) => w.isCustom));
    };
    void fetchData();
  }, [props.store.isLoading, props.store.lastUpdated, increment]);

  return (
    <React.Fragment>
      <div className={classes.rowHighlight}>
        <Typography variant="h6" className={classes.rowHeading}>
          Custom bookmarks
        </Typography>
        {customWebsites.map((bookmark) => (
          <WebsiteRow key={bookmark.id} website={bookmark} store={props.store} />
        ))}
        <AddWebsite store={props.store} setIncrement={setIncrement} increment={increment} />
      </div>
      <div style={{ marginTop: 12, marginBottom: 12 }}>
        {topWebsites.map((website) => (
          <WebsiteRow key={website.id} website={website} store={props.store} />
        ))}
      </div>
    </React.Fragment>
  );
};

export const TopWebsites = (props: { store: IStore }) => {
  const classes = panelStyles();
  return (
    <div className={classes.panel}>
      <TopWebsiteList store={props.store} />
    </div>
  );
};
