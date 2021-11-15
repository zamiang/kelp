import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import config from '../../constants/config';
import MoveIcon from '../../public/icons/move.svg';

const PREFIX = 'MostRecentTab';

const classes = {
  tab: `${PREFIX}-tab`,
  item: `${PREFIX}-item`,
  text: `${PREFIX}-text`,
  icon: `${PREFIX}-icon`,
  textContainer: `${PREFIX}-textContainer`,
  imageContainer: `${PREFIX}-imageContainer`,
  iconImage: `${PREFIX}-iconImage`,
  iconSelected: `${PREFIX}-iconSelected`,
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
  [`& .${classes.text}`]: { color: theme.palette.text.primary },
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
  [`& .${classes.textContainer}`]: {
    display: 'inline-block',
    verticalAlign: 'top',
    maxWidth: 140,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  [`& .${classes.iconImage}`]: {
    color: theme.palette.text.primary,
  },
  [`& .${classes.iconSelected}`]: {
    color: theme.palette.primary.main,
  },
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

export const MostRecentTab = () => {
  const [tab, setTab] = useState<chrome.tabs.Tab | undefined>();

  useEffect(() => {
    chrome.tabs.query(
      {
        active: false,
      },
      (tabs) => {
        const tab = tabs
          .filter((t) => t.url && !t.url.includes('chrome://'))
          .reduce((previous: any, current: any) =>
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
            <Draggable draggableId={tab.url!} index={0}>
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
                      <Typography noWrap variant="body2" className={classes.text}>
                        {tab.title}
                      </Typography>
                    </Link>
                  </div>
                  <div className={classes.icon}>
                    {snapshot.isDragging ? (
                      <MoveIcon
                        width={config.ICON_SIZE}
                        height={config.ICON_SIZE}
                        className={classes.iconSelected}
                      />
                    ) : (
                      <MoveIcon
                        width={config.ICON_SIZE}
                        height={config.ICON_SIZE}
                        className={classes.iconImage}
                      />
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
