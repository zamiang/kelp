import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useExpandStyles from '../shared/expand-styles';
import { IPerson } from '../store/person-store';
import { updateContactNotes } from './update-contact';

type FormValues = {
  note: string;
};

const NotesEditForm = (props: { person: IPerson; onCloseEdit: () => void }) => {
  const { handleSubmit, register, setValue } = useForm<FormValues>();
  const classes = useExpandStyles();
  const onSubmit = handleSubmit(async (data) => {
    await updateContactNotes(props.person.googleId!, data.note, props.person);
    props.onCloseEdit();
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue('note', e.target.value);
  };
  return (
    <Grid container>
      <FormControl fullWidth>
        <TextareaAutosize
          rowsMin={3}
          className={classes.textarea}
          placeholder="Add a contact note. This is saved in Google Contacts."
          defaultValue={props.person.notes || ''}
          onChange={handleChange}
          name="note"
          ref={register({ required: 'Required' })}
        />
        <Button variant="contained" color="primary" disableElevation onClick={onSubmit}>
          Save
        </Button>
      </FormControl>
    </Grid>
  );
};

const PersonNotes = (props: { person: IPerson; refetch: () => void }) => {
  const classes = useExpandStyles();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const onEdit = () => setIsEditing(true);
  const onCloseEdit = () => setIsEditing(false);
  if (!props.person.googleId) {
    return null;
  }
  return (
    <div className={classes.relativeContainer}>
      <Typography variant="h6" className={classes.smallHeading}>
        Notes
      </Typography>
      {!isEditing && props.person.notes && (
        <Typography variant="body2">{props.person.notes}</Typography>
      )}
      {!isEditing && props.person.googleId && !props.person.isCurrentUser && (
        <Button onClick={onEdit} className={classes.edit} size="small">
          <EditIcon />
          <Typography variant="subtitle2">Edit</Typography>
        </Button>
      )}
      {isEditing && <NotesEditForm person={props.person} onCloseEdit={onCloseEdit} />}
      {isEditing && (
        <IconButton onClick={onCloseEdit} size="small">
          <CloseIcon />
        </IconButton>
      )}
    </div>
  );
};

export default PersonNotes;
