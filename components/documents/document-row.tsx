import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import HelpIcon from '../../public/icons/help.svg';
import useButtonStyles from '../shared/button-styles';
import isTouchEnabled from '../shared/is-touch-enabled';
import useRowStyles from '../shared/row-styles';
import { IDocument } from '../store/models/document-model';
import { ISegmentDocument } from '../store/models/segment-document-model';
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
      <Grid container spacing={2} alignItems="center">
        <Grid item className={rowStyles.rowLeft}>
          <HelpIcon
            height="24"
            width="24"
            style={{ margin: '0 auto' }}
            className={clsx(classes.image, props.isSmall && classes.imageSpacing)}
          />
        </Grid>
        <Grid item xs={8}>
          <Grid container>
            <Grid item xs={12} zeroMinWidth>
              <Typography noWrap>{props.segmentDocument.documentId}</Typography>
            </Grid>
            {!props.isSmall && (
              <Grid item xs={12} zeroMinWidth>
                <Typography variant="body2">
                  {format(new Date(props.segmentDocument.date), "MMM do, yyyy 'at' hh:mm a")}
                </Typography>
              </Grid>
            )}
          </Grid>
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
    maxHeight: 18,
    maxWidth: 18,
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
  isSmall?: boolean;
  tooltipText?: string;
  text?: string;
}) => {
  const isSelected = props.selectedDocumentId === props.document.id;
  const router = useHistory();
  const buttonStyles = useButtonStyles();
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
        !props.isSmall && rowStyles.row,
        props.isSmall && rowStyles.rowSmall,
        isSelected && rowStyles.rowPrimaryMain,
      )}
    >
      <ConditionalWrapper
        shouldWrap={!!props.tooltipText}
        wrapper={(children: any) => <Tooltip title={props.tooltipText!}>{children}</Tooltip>}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item className={rowStyles.rowLeft}>
            {!props.isSmall && (
              <img alt="Document Icon" src={props.document.iconLink} className={classes.image} />
            )}
            {props.isSmall && (
              <img
                src={props.document.iconLink}
                className={clsx(classes.image, classes.imageSpacing)}
              />
            )}
          </Grid>
          <Grid item zeroMinWidth xs>
            <Grid container>
              <Grid item xs={12} zeroMinWidth>
                <Typography noWrap>{props.document.name}</Typography>
              </Grid>
              {!props.isSmall && (
                <Grid item xs={12} zeroMinWidth>
                  <Typography variant="body2" noWrap>
                    {props.text
                      ? props.text
                      : `Last updated ${formatDistanceToNow(
                          new Date(props.document.updatedAt!),
                        )} ago`}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
          {!props.isSmall && isDetailsVisible && (
            <Grid item style={{ marginLeft: 'auto' }}>
              <Button
                className={clsx(buttonStyles.button, buttonStyles.buttonPrimary)}
                variant="outlined"
                onClick={(event) => {
                  event.stopPropagation();
                  void router.push(`/documents/${props.document.id}`);
                  return false;
                }}
              >
                Details
              </Button>
            </Grid>
          )}
        </Grid>
      </ConditionalWrapper>
    </div>
  );
};

export default DocumentRow;
