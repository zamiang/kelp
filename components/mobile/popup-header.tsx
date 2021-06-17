import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import BackIcon from '../../public/icons/back.svg';
import MeetingIcon from '../../public/icons/calendar.svg';
import EditIcon from '../../public/icons/edit.svg';
import DocumentIcon from '../../public/icons/file.svg';
import SearchIcon from '../../public/icons/search.svg';
import SettingsIcon from '../../public/icons/settings.svg';
import { LineCalendar } from '../meeting/line-calendar';
import SearchBar from '../nav/search-bar';
import { IStore } from '../store/use-store';

const GoToSourceButton = (props: {
  store: IStore;
  type: 'meetings' | 'documents' | 'people';
  id: string;
}) => {
  const [link, setLink] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (props.type === 'meetings') {
        const meeting = await props.store.timeDataStore.getById(props.id);
        if (meeting) {
          const editLink = meeting.link?.replace(
            'https://www.google.com/calendar/event?eid=',
            'https://calendar.google.com/calendar/u/0/r/eventedit/',
          );
          setLink(editLink);
        }
      } else if (props.type === 'documents') {
        const p = await props.store.documentDataStore.getById(props.id);
        if (p && p.link) {
          setLink(p.link);
        }
      } else if (props.type === 'people') {
        const p = await props.store.personDataStore.getById(props.id);
        if (p) {
          setLink(`http://contacts.google.com/search/${p?.name}`);
        }
      }
    };
    void fetchData();
  }, [props.type, props.id]);

  return (
    <IconButton href={link || ''} target="_blank">
      <EditIcon width="24" height="24" />
    </IconButton>
  );
};

const PluginHeader = (props: { store: IStore; shouldAlwaysShowSettings?: boolean }) => {
  const [isSearchInputVisible, setSearchInputVisible] = useState<boolean>(false);
  const router = useHistory();
  const location = useLocation();
  const isOnSubpage = location.pathname !== '/home' && location.pathname !== '/search';
  const shouldRenderSourceButton =
    location.pathname !== '/settings' && location.pathname !== '/people';

  if (isOnSubpage) {
    const type = location.pathname.split('/')[1];
    const id = decodeURIComponent(location.pathname.split('/')[2]);
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
        {shouldRenderSourceButton && (
          <Grid item>
            <GoToSourceButton store={props.store} type={type as any} id={id} />
          </Grid>
        )}
      </Grid>
    );
  }

  if (isSearchInputVisible) {
    return <SearchBar onClose={() => setSearchInputVisible(false)} />;
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
      <Grid item xs>
        <div style={{ marginTop: 16 }}>
          <LineCalendar store={props.store} />
        </div>
      </Grid>
      <Grid item>
        <IconButton href="https://docs.new" target="_blank">
          <DocumentIcon width="24" height="24" />
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton target="_blank" href="https://www.google.com/calendar/render?action=TEMPLATE">
          <MeetingIcon width="24" height="24" />
        </IconButton>
      </Grid>
      <Grid item>
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
  );
};

export default PluginHeader;
