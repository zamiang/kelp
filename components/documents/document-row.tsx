import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import AvatarList from '../shared/avatar-list';
import PopperContainer from '../shared/popper';
import useRowStyles from '../shared/row-styles';
import { IDocument } from '../store/document-store';
import { IStore } from '../store/use-store';
import ExpandedDocument from './expand-document';

const useStyles = makeStyles((theme) => ({
  imageContainer: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  image: {
    display: 'block',
    width: '100%',
    paddingRight: theme.spacing(1),
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
  const router = useRouter();
  const rowStyles = useRowStyles();
  const classes = useStyles();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const activity = props.store.driveActivityStore.getDriveActivityForDocument(props.doc.id) || [];
  const people = props.store.personDataStore.getPeopleForDriveActivity(activity).slice(0, 5);

  React.useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [referenceElement]);

  const [isOpen, setIsOpen] = React.useState(isSelected);
  const handleClick = () => {
    setIsOpen(true);
    void router.push(`?tab=docs&slug=${props.doc.id}`);
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
        props.isSmall && rowStyles.rowBorderRadius,
        !props.isSmall && rowStyles.rowDefault,
        !props.isSmall && classes.row,
        isSelected && rowStyles.pinkBackground,
        props.isSmall && rowStyles.rowNoLeftMargin,
      )}
    >
      <Grid container spacing={1} alignItems="center">
        <PopperContainer anchorEl={referenceElement} isOpen={isOpen} setIsOpen={setIsOpen}>
          <ExpandedDocument
            documentId={props.doc.id}
            close={() => setIsOpen(false)}
            {...props.store}
          />
        </PopperContainer>
        <Grid item className={classes.imageContainer}>
          <img src={props.doc.iconLink} className={classes.image} />
        </Grid>
        <Grid item zeroMinWidth xs>
          <Typography noWrap variant="body2">
            <b>{props.doc.name}</b>
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
