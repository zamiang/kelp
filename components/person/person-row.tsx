import Avatar from '@material-ui/core/Avatar';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import PopperContainer from '../shared/popper';
import useRowStyles from '../shared/row-styles';
import { IPerson } from '../store/person-store';
import { IStore } from '../store/use-store';
import ExpandedPerson from './expand-person';

const useStyles = makeStyles(() => ({
  name: { minWidth: 300 },
  email: { minWidth: 200 },
}));

const PersonRow = (props: { selectedPersonId: string | null; person: IPerson; store: IStore }) => {
  const isSelected = props.selectedPersonId === props.person.id;
  const classes = useStyles();
  const rowStyles = useRowStyles();
  const router = useRouter();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [referenceElement]);

  const [isOpen, setIsOpen] = React.useState(isSelected);
  const handleClick = () => {
    setIsOpen(true);
    void router.push(`?tab=people&slug=${props.person.id}`);
    return false;
  };
  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <ListItem
        onClick={handleClick}
        ref={setReferenceElement as any}
        className={clsx(
          'ignore-react-onclickoutside',
          rowStyles.row,
          isSelected && rowStyles.orangeBackground,
        )}
      >
        <Grid container spacing={2} alignItems="center">
          <PopperContainer anchorEl={referenceElement} isOpen={isOpen}>
            <ExpandedPerson
              personId={props.person.id}
              close={() => setIsOpen(false)}
              {...props.store}
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
          <Grid item xs={8} sm container>
            <Grid item className={classes.name} zeroMinWidth>
              <Typography variant="body2" noWrap>
                <b>{props.person.name || props.person.id}</b>
              </Typography>
            </Grid>
            <Grid item className={classes.email}>
              <Typography variant="body2" noWrap>
                {props.person.emailAddress}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" noWrap>
                {props.person.notes}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </ListItem>
    </ClickAwayListener>
  );
};

export default PersonRow;
