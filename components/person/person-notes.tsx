import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import BackIcon from '../../public/icons/close.svg';
import EditIcon from '../../public/icons/edit.svg';
import useButtonStyles from '../shared/button-styles';
import { IPerson } from '../store/data-types';
import { IStore } from '../store/use-store';
import { updateContactNotes } from './update-contact';

const useStyles = makeStyles((theme) => ({
  textarea: {
    border: `1px solid #dadce0`,
    borderRadius: 0,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(4),
  },
  relativeContainer: {
    borderRadius: theme.shape.borderRadius,
    background: 'rgba(0,0,0,0.04)',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    padding: theme.spacing(1),
    minWidth: 400,
    position: 'relative',
  },
  edit: {
    display: 'inline-block',
    marginLeft: theme.spacing(1),
    textDecoration: 'underline',
  },
  addNotes: {
    color: theme.palette.grey[600],
  },
  backIcon: {
    position: 'absolute',
    top: theme.spacing(0.5),
    right: theme.spacing(1),
    zIndex: 10,
  },
  button: {
    marginBottom: theme.spacing(2),
  },
}));

type FormValues = {
  note: string;
};

const NotesEditForm = (props: {
  person: IPerson;
  onCloseEdit: () => void;
  setPerson: (p: IPerson) => void;
  personStore: IStore['personDataStore'];
  scope: string;
  accessToken: string;
}) => {
  const { handleSubmit, setValue } = useForm<FormValues>();
  const classes = useStyles();
  const buttonClasses = useButtonStyles();
  const onSubmit = handleSubmit(async (data) => {
    const response = await updateContactNotes(
      props.person.googleId!,
      data.note,
      props.scope,
      props.accessToken,
    );
    if (response) {
      const formattedPerson = await props.personStore.updatePersonFromGoogleContacts(response);
      props.setPerson(formattedPerson);
    }
    props.onCloseEdit();
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue('note', e.target.value);
  };
  return (
    <FormControl fullWidth>
      <TextareaAutosize
        rowsMin={3}
        className={classes.textarea}
        placeholder="Add a contact note. This is saved in Google Contacts."
        defaultValue={props.person.notes || ''}
        onChange={handleChange}
        name="note"
      />
      <Button
        className={clsx(buttonClasses.button, classes.button)}
        variant="contained"
        color="primary"
        disableElevation
        onClick={onSubmit}
      >
        Save
      </Button>
    </FormControl>
  );
};

const PersonNotes = (props: {
  person: IPerson;
  setPerson: (p: IPerson) => void;
  personStore: IStore['personDataStore'];
  scope: string;
  accessToken: string;
}) => {
  const classes = useStyles();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const onEdit = () => setIsEditing(true);
  const onCloseEdit = () => setIsEditing(false);
  return (
    <div className={classes.relativeContainer}>
      {isEditing && (
        <IconButton onClick={onCloseEdit} size="small" className={classes.backIcon}>
          <BackIcon width="24" height="24" />
        </IconButton>
      )}
      <Typography variant="subtitle2">
        {!isEditing && (
          <span>
            {props.person.notes || (
              <span className={classes.addNotes}>Add a contact note to your Google Contact.</span>
            )}
          </span>
        )}
        {!isEditing && props.person.googleId && !props.person.isCurrentUser && (
          <IconButton className={classes.edit} onClick={onEdit} size="small">
            <EditIcon width="24" height="24" />
          </IconButton>
        )}
      </Typography>
      {isEditing && (
        <NotesEditForm
          setPerson={props.setPerson}
          personStore={props.personStore}
          person={props.person}
          onCloseEdit={onCloseEdit}
          scope={props.scope}
          accessToken={props.accessToken}
        />
      )}
    </div>
  );
};

export default PersonNotes;
