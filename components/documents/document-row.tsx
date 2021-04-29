import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import HelpIcon from '../../public/icons/help.svg';
import SearchIcon from '../../public/icons/search.svg';
import isTouchEnabled from '../shared/is-touch-enabled';
import useRowStyles from '../shared/row-styles';
import { IDocument, ISegmentDocument } from '../store/data-types';
import { IStore } from '../store/use-store';

export const MissingDocumentRow = (props: {
  segmentDocument: ISegmentDocument;
  isSmall?: boolean;
}) => {
  const rowStyles = useRowStyles();
  const classes = useStyles();
  return (
    <div
      className={clsx(!props.isSmall && rowStyles.row, props.isSmall && rowStyles.rowSmall)}
      onClick={() => {
        // TODO handle slides?
        window.open(
          `https://docs.google.com/document/d/${props.segmentDocument.documentId}`,
          '_blank',
        );
      }}
    >
      <Grid container alignItems="center">
        <Grid item className={rowStyles.rowLeft}>
          <IconButton size="small">
            <HelpIcon
              height="18"
              width="18"
              style={{ margin: '0 auto' }}
              className={clsx(classes.image, props.isSmall && classes.imageSpacing)}
            />
          </IconButton>
        </Grid>
        <Grid item xs={8}>
          <Typography noWrap>{props.segmentDocument.documentId}</Typography>
        </Grid>
      </Grid>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  image: {
    display: 'block',
    maxWidth: 18,
    margin: '0 auto',
  },
  imageSpacing: {
    width: 18,
    marginTop: 5,
  },
  time: {
    minWidth: 160,
    maxWidth: 180,
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  row: {
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
}));

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
  const router = useHistory();
  const rowStyles = useRowStyles();
  const classes = useStyles();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [isDetailsVisible, setDetailsVisible] = useState(isTouchEnabled());

  useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  return (
    <div
      onMouseEnter={() => !isTouchEnabled() && setDetailsVisible(true)}
      onMouseLeave={() => !isTouchEnabled() && setDetailsVisible(false)}
      onClick={(event) => {
        event.stopPropagation();
        if (props.document.link) {
          window.open(props.document.link);
        }
        return false;
      }}
      ref={setReferenceElement as any}
      className={clsx(
        rowStyles.row,
        props.noMargins && rowStyles.rowSmall,
        isSelected && rowStyles.rowPrimaryMain,
      )}
    >
      <ConditionalWrapper
        shouldWrap={!!props.tooltipText}
        wrapper={(children: any) => <Tooltip title={props.tooltipText!}>{children}</Tooltip>}
      >
        <Grid container alignItems="center">
          <Grid item className={rowStyles.rowLeft}>
            <IconButton size="small">
              <img alt="Document Icon" src={props.document.iconLink} className={classes.image} />
            </IconButton>
          </Grid>
          <Grid item zeroMinWidth xs>
            <Typography noWrap className={rowStyles.rowTopPadding}>
              {props.document.name}
            </Typography>
          </Grid>
          {isDetailsVisible && (
            <Grid item style={{ marginLeft: 'auto', paddingTop: 0, paddingBottom: 0 }}>
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  void router.push(`/documents/${props.document.id}`);
                  return false;
                }}
              >
                <SearchIcon width="24" height="24" />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </ConditionalWrapper>
    </div>
  );
};

export default DocumentRow;
