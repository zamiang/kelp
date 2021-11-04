import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import config from '../../constants/config';
import MoveIconOrange from '../../public/icons/move-orange.svg';
import MoveIconWhite from '../../public/icons/move-white.svg';
import MoveIcon from '../../public/icons/move.svg';
import { cleanupUrl } from '../shared/cleanup-url';

const PREFIX = 'MostRecentTab';

const classes = {
  tab: `${PREFIX}-tab`,
  item: `${PREFIX}-item`,
  icon: `${PREFIX}-icon`,
  textContainer: `${PREFIX}-textContainer`,
  imageContainer: `${PREFIX}-imageContainer`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.tab}`]: {
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(0.5),
    borderRadius: 50,
    background: theme.palette.background.paper,
    marginBottom: theme.spacing(6),
    display: 'inline-block',
    opacity: 1,
    transition: 'opacity 0.3s',
    '&:hover': { opacity: 0.7 },
  },
  [`& .${classes.item}`]: {},
  [`& .${classes.icon}`]: {
    display: 'inline-block',
    verticalAlign: 'top',
    marginLeft: theme.spacing(1),
    opacity: 0.6,
    marginTop: 1,
  },
  [`& .${classes.imageContainer}`]: {
    marginRight: theme.spacing(1),
    display: 'inline-block',
    verticalAlign: 'top',
    marginTop: 1,
  },
  [`& .${classes.textContainer}`]: { display: 'inline-block', verticalAlign: 'top' },
}));

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? 'rgba(0,0,0, 0.15)' : 'transparent',
});

const getItemStyle = (draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',

  // styles we need to apply on draggables
  ...draggableStyle,
});

export const MostRecentTab = (props: { isDarkMode: boolean }) => {
  const [tab, setTab] = useState<chrome.tabs.Tab | undefined>();

  useEffect(() => {
    chrome.tabs.query(
      {
        active: false,
      },
      (tabs) => {
        const tab = tabs.reduce((previous: any, current: any) =>
          previous?.lastAccessed > current?.lastAccessed ? previous : current,
        );
        if (tab) {
          setTab(tab);
        }
      },
    );
  }, []);

  if (!tab) {
    return null;
  }
  return (
    <Root>
      <Droppable droppableId="most-recent-tab" isDropDisabled={true}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
            {...provided.droppableProps}
          >
            <Draggable draggableId={cleanupUrl(tab.url!)} index={0}>
              {(provided, snapshot) => (
                <div
                  className={classes.tab}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={getItemStyle(provided.draggableProps.style)}
                >
                  <div className={classes.imageContainer}>
                    <Link href={tab.url}>
                      <img
                        style={{ display: 'block' }}
                        src={tab.favIconUrl}
                        height="18"
                        width="18"
                      />
                    </Link>
                  </div>
                  <div className={classes.textContainer}>
                    <Link href={tab.url} underline="hover">
                      <Typography>{tab.title}</Typography>
                    </Link>
                  </div>
                  <div className={classes.icon}>
                    {snapshot.isDragging ? (
                      <MoveIconOrange width={config.ICON_SIZE} height={config.ICON_SIZE} />
                    ) : props.isDarkMode ? (
                      <MoveIconWhite width={config.ICON_SIZE} height={config.ICON_SIZE} />
                    ) : (
                      <MoveIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
                    )}
                  </div>
                </div>
              )}
            </Draggable>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Root>
  );
};
