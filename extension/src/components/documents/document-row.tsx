import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/styled-engine';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../../../constants/config';
import HelpIcon from '../../../../public/icons/help.svg';
import SearchIcon from '../../../../public/icons/search.svg';
import { IDocument, ISegment, ISegmentDocument } from '../store/data-types';
import { IStore } from '../store/use-store';

const PREFIX = 'DocumentRow';

const classes = {
  image: `${PREFIX}-image`,
  imageSpacing: `${PREFIX}-imageSpacing`,
  time: `${PREFIX}-time`,
  row: `${PREFIX}-row`,
  rowBorder: `${PREFIX}-rowBorder`,
  rowTopPadding: `${PREFIX}-rowTopPadding`,
  rowSmall: `${PREFIX}-rowSmall`,
  rowLeft: `${PREFIX}-rowLeft`,
  rowPrimaryMain: `${PREFIX}-rowPrimaryMain`,
};

const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.image}`]: {
    display: 'block',
    maxWidth: 18,
    margin: '0 auto',
  },
  [`& .${classes.imageSpacing}`]: {
    width: 18,
    marginTop: 5,
  },
  [`& .${classes.time}`]: {
    minWidth: 160,
    maxWidth: 180,
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  [`& .${classes.rowBorder}`]: {
    minHeight: 48,
    margin: 0,
    paddingTop: 9,
    paddingBottom: 9,
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRadius: 0,
    '&.MuiListItem-button:hover': {
      borderColor: theme.palette.divider,
    },
  },
  [`& .${classes.row}`]: {
    background: 'transparent',
    transition: 'background 0.3s, opacity 0.3s',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    animation: `${fadeInAnimation} ease 0.4s`,
    animationIterationCount: 1,
    animationFillMode: 'forwards',
    '&.MuiListItem-button:hover': {
      opacity: 0.8,
    },
  },
  [`& .${classes.rowTopPadding}`]: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  [`& .${classes.rowSmall}`]: {
    padding: 0,
  },
  [`& .${classes.rowLeft}`]: {
    textAlign: 'center',
    marginRight: theme.spacing(2),
  },
  [`& .${classes.rowPrimaryMain}`]: {
    background: theme.palette.divider,
    '&.Mui-selected, &.Mui-selected:hover, &.MuiListItem-button:hover': {
      borderColor: theme.palette.secondary.light,
      background: theme.palette.secondary.light,
    },
  },
}));

export const MissingDocumentRow = (props: {
  segmentDocument: ISegmentDocument;
  store: IStore;
  isSmall?: boolean;
}) => {
  const [meeting, setMeeting] = useState<ISegment | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (props.segmentDocument.segmentId) {
        const result = await props.store.timeDataStore.getById(props.segmentDocument.segmentId);
        setMeeting(result);
      }
    };
    void fetchData();
  }, [props.segmentDocument.segmentId, props.store.isLoading]);

  return (
    <Root
      className={clsx(!props.isSmall && classes.row, props.isSmall && classes.rowSmall)}
      onClick={() => {
        // TODO handle slides?
        window.open(
          `https://docs.google.com/document/d/${props.segmentDocument.documentId}`,
          '_blank',
        );
      }}
    >
      <Box display="flex" alignItems="center">
        <Box className={classes.rowLeft}>
          <IconButton size="small">
            <HelpIcon
              height="18"
              width="18"
              className={clsx(
                classes.image,
                props.isSmall && classes.imageSpacing,
                'u-margin-auto',
              )}
            />
          </IconButton>
        </Box>
        <Box flex="0 0 66.67%">
          <Typography noWrap>Document from {meeting ? meeting.summary : 'this meeting'}</Typography>
        </Box>
      </Box>
    </Root>
  );
};

const ConditionalWrapper = ({ shouldWrap, wrapper, children }: any) =>
  shouldWrap ? wrapper(children) : children;

const DocumentRow = (props: {
  document: IDocument;
  selectedDocumentId: string | null;
  store: IStore;
  tooltipText?: string;
  text?: string;
  noMargins?: boolean;
}) => {
  const isSelected = props.selectedDocumentId === props.document.id;
  const navigate = useNavigate();

  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [isDetailsVisible, setDetailsVisible] = useState(false);

  useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  return (
    <Root
      onMouseEnter={() => setDetailsVisible(true)}
      onMouseLeave={() => setDetailsVisible(false)}
      onClick={(event) => {
        event.stopPropagation();
        if (props.document.link) {
          window.open(props.document.link);
        }
        return false;
      }}
      ref={setReferenceElement as any}
      className={clsx(
        classes.row,
        props.noMargins && classes.rowSmall,
        isSelected && classes.rowPrimaryMain,
      )}
    >
      <ConditionalWrapper
        shouldWrap={!!props.tooltipText}
        wrapper={(children: any) => <Tooltip title={props.tooltipText!}>{children}</Tooltip>}
      >
        <Box display="flex" alignItems="center">
          <Box className={classes.rowLeft}>
            <IconButton size="small">
              <img alt="Document Icon" src={props.document.iconLink} className={classes.image} />
            </IconButton>
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography noWrap className={classes.rowTopPadding}>
              {props.document.name}
            </Typography>
          </Box>
          {isDetailsVisible && (
            <Box className="document-row__actions">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  void navigate(`/documents/${props.document.id}`);
                  return false;
                }}
              >
                <SearchIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
              </IconButton>
            </Box>
          )}
        </Box>
      </ConditionalWrapper>
    </Root>
  );
};

export default DocumentRow;
