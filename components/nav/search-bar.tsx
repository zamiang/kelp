import InputAdornment from '@material-ui/core/InputAdornment';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import { useRouter } from 'next/router';
import React from 'react';
import { useForm } from 'react-hook-form';

const useStyles = makeStyles((theme) => ({
  inputContainer: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  input: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

type FormValues = {
  query: string;
};

const SearchBar = () => {
  const classes = useStyles();
  const { handleSubmit, register, setValue } = useForm<FormValues>({
    defaultValues: {
      query: '',
    },
  });
  const router = useRouter();

  const onSubmit = handleSubmit(async (data) => {
    void router.push(`?tab=search&query=${data.query}`);
    setValue('query', '');
  });
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setValue('query', e.target.value);

  return (
    <form onSubmit={onSubmit} className={classes.inputContainer}>
      <OutlinedInput
        id="search-input-for-nav"
        type="text"
        placeholder="Search…"
        fullWidth
        autoComplete="off"
        onChange={handleChange}
        name="query"
        margin="dense"
        className={classes.input}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
        inputRef={register}
      />
    </form>
  );
};

export default SearchBar;
