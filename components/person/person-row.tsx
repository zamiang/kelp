import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useRowStyles from '../shared/row-styles';
import { IPerson } from '../store/models/person-model';

const PersonRow = (props: {
  selectedPersonId: string | null;
  noLeftMargin?: boolean;
  person: IPerson;
  info?: string;
}) => {
  const isSelected = props.selectedPersonId === props.person.id;
  const rowStyles = useRowStyles();
  const router = useHistory();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  const handleClick = () => router.push(`/people/${encodeURIComponent(props.person.id)}`);

  return (
    <ListItem
      button={true}
      onClick={handleClick}
      ref={setReferenceElement as any}
      selected={isSelected}
      className={clsx(
        'ignore-react-onclickoutside',
        rowStyles.row,
        props.noLeftMargin && rowStyles.rowNoLeftMargin,
      )}
    >
      <Grid container spacing={2} alignItems="center" wrap="nowrap">
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
            <Grid item xs={12} zeroMinWidth>
              <Typography noWrap>{props.person.name || props.person.id}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" noWrap>
                {props.person.emailAddresses.join(', ')}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" noWrap>
                {props.person.notes}
              </Typography>
            </Grid>
            {props.info && (
              <Grid item xs={12}>
                <Typography variant="body2" noWrap>
                  {props.info}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
        {props.person.emailAddresses[0] && (
          <Grid item>
            <Button
              className={rowStyles.hoverButton}
              onClick={(event) => {
                event.stopPropagation();
                void navigator.clipboard.writeText(props.person.emailAddresses[0]);
                return false;
              }}
            >
              Copy
            </Button>
          </Grid>
        )}
      </Grid>
    </ListItem>
  );
};

export default PersonRow;
