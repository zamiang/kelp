import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import clsx from 'clsx';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import AvatarList from '../shared/avatar-list';
import useRowStyles from '../shared/row-styles';
import { getPeopleSortedByCount } from '../store/helpers';
import { IDocument } from '../store/models/document-model';
import { IPerson } from '../store/models/person-model';
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
        props.isSmall && rowStyles.row,
        !props.isSmall && rowStyles.rowSmall,
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
          {!props.isSmall && (
            <IconButton>
              <HelpOutlineIcon className={classes.image} />
            </IconButton>
          )}
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
  imageContainer: {},
  image: {
    display: 'block',
    height: 24,
    width: 24,
  },
  imageSpacing: {
    marginRight: theme.spacing(0.5),
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
  const [activity, setActivity] = useState<IFormattedDriveActivity[]>([]);
  const [people, setPeople] = useState<IPerson[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (props.doc.id) {
        const result = await props.store.driveActivityStore.getDriveActivityForDocument(
          props.doc.id,
        );
        setActivity(result);
      }
    };
    void fetchData();
  }, [props.doc.id]);

  useEffect(() => {
    const fetchData = async () => {
      if (activity.length > 0) {
        const peopleAndCounts = await getPeopleSortedByCount(
          activity.map((a) => a.actorPersonId).filter(Boolean) as any,
          props.store.personDataStore,
        );
        setPeople(peopleAndCounts.sortedPeople.slice(0, 3));
      }
    };
    void fetchData();
  }, [activity.length]);

  useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  return (
    <Button
      onClick={(event) => {
        event.stopPropagation();
        void router.push(`/docs/${props.doc.id}`);
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
        <Grid item xs={props.isSmall ? 10 : 8}>
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
        {!props.isSmall && (
          <Grid item sm={2}>
            <Grid container spacing={1} alignItems="center">
              <AvatarList people={people as any} maxAvatars={2} />
            </Grid>
          </Grid>
        )}
      </Grid>
    </Button>
  );
};

export default DocumentRow;
