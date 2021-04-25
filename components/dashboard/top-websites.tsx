import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import CheckIconOrange from '../../public/icons/check-orange.svg';
import BackIcon from '../../public/icons/close.svg';
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
        <Grid container alignItems="center" justify="space-between">
          <Grid item>
            <Typography variant="h6">Add a custom site</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={() => setIsEditing(false)} style={{ marginTop: -10 }}>
              <BackIcon width="24" height="24" />
            </IconButton>
          </Grid>
        </Grid>
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

const WebsiteItem = (props: { website: ITopWebsite; index: number; store: IStore }) => (
  <Draggable draggableId={props.website.id} index={props.index}>
    {(provided) => (
      <div
        key={props.website.id}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <WebsiteRow website={props.website} store={props.store} />
      </div>
    )}
  </Draggable>
);

const WebsitesMemo = React.memo(function QuoteList({ websites, store }: any) {
  return websites.map((website: ITopWebsite, index: number) => (
    <WebsiteItem key={website.id} website={website} index={index} store={store} />
  ));
});

const moveTopWebsite = (websites: ITopWebsite[], startIndex: number, endIndex: number) => {
  const result = Array.from(websites);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result.map((t, index) => ({ ...t, index }));
};

const TopWebsiteList = (props: { store: IStore }) => {
  const [topWebsites, setTopWebsites] = useState<ITopWebsite[]>([]);
  const [increment, setIncrement] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
      const ws = await props.store.topWebsitesStore.getAll();
      setTopWebsites(ws);
    };
    void fetchData();
  }, [props.store.isLoading, props.store.lastUpdated, increment]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }
    const newTopWebsites = moveTopWebsite(
      topWebsites,
      result.source.index,
      result.destination.index,
    );
    setTopWebsites(newTopWebsites);

    // TODO: Save in the store
  };

  return (
    <React.Fragment>
      <AddWebsite store={props.store} setIncrement={setIncrement} increment={increment} />
      <div style={{ marginBottom: 12 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <WebsitesMemo websites={topWebsites} store={props.store} />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
