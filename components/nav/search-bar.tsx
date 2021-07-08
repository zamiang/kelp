import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useHistory } from 'react-router-dom';
import CloseIcon from '../../public/icons/close.svg';
import SearchIconOrange from '../../public/icons/search-orange.svg';
import SearchIcon from '../../public/icons/search.svg';

const useStyles = makeStyles((theme) => ({
  input: {
    marginTop: 0,
    [theme.breakpoints.down('sm')]: {},
  },
  container: {
    paddingTop: 5,
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  },
}));

const SearchBar = (props: { tab: string; onClose?: () => void }) => {
  const classes = useStyles();
  const router = useHistory();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    void router.push(`/search?query=${e.target.value}`);
  };

  return (
    <Grid container alignItems="flex-start" justifyContent="space-between">
      <Grid item>
        <IconButton>
          {props.tab === 'search' ? (
            <SearchIconOrange width="24" height="24" />
          ) : (
            <SearchIcon width="24" height="24" />
          )}
        </IconButton>
      </Grid>
      <Grid item xs>
        <TextField
          type="text"
          placeholder="Search…"
          fullWidth
          autoComplete="off"
          autoFocus={true}
          onChange={handleChange}
          name="query"
          margin="dense"
          InputProps={{
            className: classes.input,
            disableUnderline: true,
          }}
        />
      </Grid>
      <Grid item>
        <IconButton
          onClick={() => {
            router.push('/home');
            if (props.onClose) {
              props.onClose();
            }
          }}
        >
          <CloseIcon width="24" height="24" />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default SearchBar;
