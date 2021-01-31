import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PopperContainer from '../shared/popper';
import useRowStyles from '../shared/row-styles';
import { IPerson } from '../store/models/person-model';
import { IStore } from '../store/use-store';
import ExpandedPerson from './expand-person';

const useStyles = makeStyles(() => ({
  name: { minWidth: 300 },
  email: { minWidth: 200 },
}));

const PersonRow = (props: {
  selectedPersonId: string | null;
  noLeftMargin?: boolean;
  person: IPerson;
  store: IStore;
}) => {
  const isSelected = props.selectedPersonId === props.person.id;
  const classes = useStyles();
  const rowStyles = useRowStyles();
  const router = useHistory();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(isSelected);

  useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  // handle going from person to person
  useEffect(() => {
    setIsOpen(isSelected);
  }, [isSelected]);

  const handleClick = () => router.push(`/people/${props.person.id}`);

  return (
    <ListItem
      button={true}
      onClick={handleClick}
      ref={setReferenceElement as any}
      selected={isSelected}
      className={clsx(
        'ignore-react-onclickoutside',
        rowStyles.row,
        isSelected && rowStyles.orangeBackground,
        props.noLeftMargin && rowStyles.rowNoLeftMargin,
      )}
    >
      <Grid container spacing={2} alignItems="center" wrap="nowrap">
        <PopperContainer anchorEl={referenceElement} isOpen={isOpen} setIsOpen={setIsOpen}>
          <ExpandedPerson
            personId={props.person.id}
            close={() => setIsOpen(false)}
            store={props.store}
          />
        </PopperContainer>
        <Grid item>
          {props.person.imageUrl ? (
            <Avatar className={rowStyles.avatar} src={props.person.imageUrl} />
          ) : (
            <Avatar className={rowStyles.avatar}>
              {(props.person.name || props.person.id)[0]}
            </Avatar>
          )}
        </Grid>
        <Grid item xs zeroMinWidth>
          <Grid container>
            <Grid item xs={12} className={classes.name} zeroMinWidth>
              <Typography variant="body2" noWrap>
                <b>{props.person.name || props.person.id}</b>
              </Typography>
            </Grid>
            <Grid item xs={12} className={classes.email}>
              <Typography variant="body2" noWrap>
                {props.person.emailAddresses.join(', ')}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" noWrap>
                {props.person.notes}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </ListItem>
  );
};

export default PersonRow;
