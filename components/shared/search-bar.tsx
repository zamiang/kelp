import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import ClearIcon from '@material-ui/icons/Clear';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { IStore } from '../store/use-store';

const useStyles = makeStyles((theme) => ({
  inputInput: {
    minWidth: '44ch',
    borderBottom: '0px solid',
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      width: 'auto',
      minWidth: 0,
    },
  },
  form: {
    // don't want the height to change with or w/o the input
    display: 'flex',
    alignItems: 'center',
  },
}));

type FormValues = {
  query: string;
};

const Search = (props: { query?: string } & IStore) => {
  const [isClearVisible, setClearVisible] = useState(!!props.query && props.query.length > 0);
  const { handleSubmit, register, setValue } = useForm<FormValues>({
    defaultValues: {
      query: props.query || '',
    },
  });
  const classes = useStyles();
  const router = useRouter();

  const onSubmit = handleSubmit(async (data) => {
    void router.push(`?tab=search&query=${data.query}`);
  });
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue('query', e.target.value);
    setClearVisible(e.target.value.length > 0);
  };
  const inputProps = isClearVisible
    ? {
        endAdornment: (
          <IconButton
            size="small"
            onClick={() => {
              setClearVisible(false);
              return setValue('query', '');
            }}
          >
            <ClearIcon />
          </IconButton>
        ),
      }
    : undefined;
  return (
    <form onSubmit={onSubmit} className={clsx(classes.form, 'ignore-react-onclickoutside')}>
      <TextField
        id="search-input"
        autoFocus={true}
        type="text"
        placeholder="Search…"
        autoComplete={undefined}
        defaultValue={props.query || ''}
        onChange={handleChange}
        name="query"
        className={classes.inputInput}
        InputProps={inputProps}
        inputRef={register}
      />
      <Button variant="contained" color="primary" disableElevation onClick={onSubmit}>
        Search
      </Button>
    </form>
  );
};

export default Search;
