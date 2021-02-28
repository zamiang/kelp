import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  inputContainer: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginTop: -10,
    marginBottom: -12,
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
    <React.Fragment>
      <form onSubmit={onSubmit} className={classes.inputContainer}>
        <Grid container alignItems="center">
          <Grid item>
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          </Grid>
          <Grid item>
            <TextField
              id="search-input-for-nav"
              type="text"
              placeholder="Search…"
              fullWidth
              autoComplete="off"
              onChange={handleChange}
              name="query"
              margin="dense"
              className={classes.input}
              inputRef={register}
            />
          </Grid>
        </Grid>
      </form>
    </React.Fragment>
  );
};

export default SearchBar;
