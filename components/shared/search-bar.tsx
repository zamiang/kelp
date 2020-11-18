import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { makeStyles } from '@material-ui/core/styles';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
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
  return (
    <form onSubmit={onSubmit} className={clsx(classes.form, 'ignore-react-onclickoutside')}>
      <OutlinedInput
        id="search-input"
        autoFocus={true}
        type="text"
        placeholder="Search…"
        autoComplete="off"
        defaultValue={props.query || ''}
        onChange={handleChange}
        name="query"
        className={classes.inputInput}
        margin="dense"
        startAdornment={
          isClearVisible && (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }
        endAdornment={
          <IconButton
            size="small"
            onClick={() => {
              setClearVisible(false);
              return setValue('query', '');
            }}
          >
            <ClearIcon />
          </IconButton>
        }
        inputRef={register}
      />
      <Button variant="contained" color="primary" disableElevation onClick={onSubmit}>
        Search
      </Button>
    </form>
  );
};

export default Search;
