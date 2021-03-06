import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import clsx from 'clsx';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
    <Button
      className={clsx(
        'ignore-react-onclickoutside',
        !props.isSmall && rowStyles.row,
        props.isSmall && rowStyles.rowSmall,
      )}
      onClick={() => {
        // TODO handle slides?
        window.open(
          `https://docs.google.com/document/d/${props.segmentDocument.documentId}`,
          '_blank',
        );
      }}
    >
      <Grid container spacing={1} alignItems="center">
        <Grid item className={classes.imageContainer}>
          {!props.isSmall && <HelpOutlineIcon className={classes.image} />}
          {props.isSmall && (
            <HelpOutlineIcon className={clsx(classes.image, classes.imageSpacing)} />
          )}
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
    </Button>
  );
};

const useStyles = makeStyles((theme) => ({
  imageContainer: {
    height: 32,
    width: 32,
  },
  image: {
    display: 'block',
  },
  imageSpacing: {
    maxHeight: 18,
    maxWidth: 18,
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

const DocumentRow = (props: {
  doc: IDocument;
  selectedDocumentId: string | null;
  store: IStore;
  isSmall?: boolean;
}) => {
  const isSelected = props.selectedDocumentId === props.doc.id;
  const router = useHistory();
  const rowStyles = useRowStyles();
  const classes = useStyles();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  return (
    <Button
      onClick={(event) => {
        event.stopPropagation();
        if (props.doc.link) {
          window.open(props.doc.link);
        }
        return false;
      }}
      ref={setReferenceElement as any}
      className={clsx(
        'ignore-react-onclickoutside',
        !props.isSmall && rowStyles.row,
        props.isSmall && rowStyles.rowSmall,
      )}
    >
      <Grid container spacing={1} alignItems="center">
        <Grid item className={classes.imageContainer}>
          {!props.isSmall && <img src={props.doc.iconLink} className={classes.image} />}
          {props.isSmall && (
            <img src={props.doc.iconLink} className={clsx(classes.image, classes.imageSpacing)} />
          )}
        </Grid>
        <Grid item xs={8}>
          <Grid container>
            <Grid item xs={12} zeroMinWidth>
              <Typography noWrap>{props.doc.name}</Typography>
            </Grid>
            {!props.isSmall && (
              <Grid item xs={12} zeroMinWidth>
                <Typography variant="body2">
                  {format(new Date(props.doc.updatedAt!), "MMM do, yyyy 'at' hh:mm a")}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item style={{ marginLeft: 'auto' }}>
          <Button
            className={rowStyles.hoverButton}
            onClick={(event) => {
              event.stopPropagation();
              void router.push(`/docs/${props.doc.id}`);
              return false;
            }}
          >
            Details
          </Button>
        </Grid>
      </Grid>
    </Button>
  );
};

export default DocumentRow;
