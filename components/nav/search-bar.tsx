import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import SearchIcon from '../../public/icons/search.svg';

const useStyles = makeStyles((theme) => ({
  inputContainer: {},
  input: {
    width: 282,
    fontSize: 16,
    [theme.breakpoints.down('sm')]: {
      width: 240,
    },
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
  const router = useHistory();

  const onSubmit = handleSubmit(async (data) => {
    void router.push(`/search?query=${data.query}`);
    setValue('query', '');
  });
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue('query', e.target.value);
    void router.push(`/search?query=${e.target.value}`);
  };

  return (
    <form onSubmit={onSubmit} className={classes.inputContainer}>
      <Grid container alignItems="center">
        <Grid item>
          <IconButton disabled>
            <SearchIcon width="24" height="24" />
          </IconButton>
        </Grid>
        <Grid item>
          <TextField
            id="search-input-for-nav"
            type="text"
            placeholder="Search…"
            fullWidth
            autoComplete="off"
            autoFocus={true}
            onChange={handleChange}
            name="query"
            margin="dense"
            className={classes.input}
            inputRef={register}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default SearchBar;
