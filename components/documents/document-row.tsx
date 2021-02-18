import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
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
import { IStore } from '../store/use-store';

const useStyles = makeStyles((theme) => ({
  imageContainer: {},
  image: {
    display: 'block',
    width: '100%',
    maxHeight: 24,
    maxWidth: 24,
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

  const handleClick = () => {
    void router.push(`/docs/${props.doc.id}`);
    return false;
  };
  return (
    <ListItem
      button={true}
      selected={isSelected}
      onClick={handleClick}
      ref={setReferenceElement as any}
      className={clsx(
        'ignore-react-onclickoutside',
        rowStyles.row,
        props.isSmall && rowStyles.rowNoLeftMargin,
      )}
    >
      <Grid container spacing={1} alignItems="center">
        <Grid item className={classes.imageContainer}>
          <IconButton>
            <img src={props.doc.iconLink} className={classes.image} />
          </IconButton>
        </Grid>
        <Grid item zeroMinWidth xs>
          <Typography noWrap variant="body2">
            <span style={{ fontWeight: 500 }}>{props.doc.name}</span>
          </Typography>
        </Grid>
        {!props.isSmall && (
          <Grid item sm={2}>
            <Grid container spacing={1} alignItems="center">
              <AvatarList people={people as any} shouldDisplayNone={false} />
            </Grid>
          </Grid>
        )}
        {!props.isSmall && (
          <Grid item className={classes.time}>
            <Typography variant="caption" color="textSecondary">
              {format(new Date(props.doc.updatedAt!), "MMM do, yyyy 'at' hh:mm a")}
            </Typography>
          </Grid>
        )}
      </Grid>
    </ListItem>
  );
};

export default DocumentRow;
