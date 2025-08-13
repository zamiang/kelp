import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/person/person-row.css';
import { IPerson } from '../store/data-types';

const PersonRow = (props: {
  selectedPersonId: string | null;
  person: IPerson;
  info?: string;
  responseStatus?: string;
  text?: string;
  noMargin?: boolean;
}) => {
  const isSelected = props.selectedPersonId === props.person.id;
  const navigate = useNavigate();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);

  const name = props.person.name || props.person.id;

  useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  return (
    <div
      onClick={(event: React.MouseEvent) => {
        event.stopPropagation();
        navigate(`/people/${encodeURIComponent(props.person.id)}`);
        return false;
      }}
      ref={setReferenceElement as any}
      className={clsx(
        'person-row',
        'person-row__container',
        props.noMargin && 'person-row__container--small',
        props.responseStatus === 'accepted' && 'person-row--accepted',
        props.responseStatus === 'tentative' && 'person-row--tentative',
        props.responseStatus === 'declined' && 'person-row--declined',
        props.responseStatus === 'needsAction' && 'person-row--needs-action',
        isSelected && 'person-row__container--selected',
      )}
    >
      <Box display="flex" alignItems="center" flexWrap="nowrap">
        <Box className="person-row__left">
          {props.person.imageUrl ? (
            <Avatar
              alt={`Profile photo for ${
                props.person.name || props.person.emailAddresses[0] || undefined
              }`}
              className="person-row__avatar"
              src={props.person.imageUrl}
            />
          ) : (
            <Avatar
              alt={props.person.name || props.person.emailAddresses[0] || undefined}
              className="person-row__avatar"
            >
              {(props.person.name || props.person.id)[0]}
            </Avatar>
          )}
        </Box>
        <Box flex="1" minWidth={0}>
          <div className="person-row__content">
            <Box>
              <Box minWidth={0}>
                <Typography noWrap className="person-row__name">
                  {name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" noWrap>
                  {props.person.notes}
                </Typography>
              </Box>
              {props.info && (
                <Box>
                  <Typography variant="body2" noWrap>
                    {props.info}
                  </Typography>
                </Box>
              )}
            </Box>
          </div>
        </Box>
      </Box>
    </div>
  );
};

export default PersonRow;
