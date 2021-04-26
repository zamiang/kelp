import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useHistory } from 'react-router-dom';
import BackIcon from '../../public/icons/back.svg';
import CloseIcon from '../../public/icons/close.svg';

const useStyles = makeStyles((theme) => ({
  input: {
    fontSize: 16,
    [theme.breakpoints.down('sm')]: {},
  },
  container: {
    minHeight: 55,
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  },
}));

const SearchBar = (props: { onClose?: () => void }) => {
  const classes = useStyles();
  const router = useHistory();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    void router.push(`/search?query=${e.target.value}`);
  };

  return (
    <Grid container alignItems="center" className={classes.container}>
      <Grid item>
        <IconButton
          onClick={() => {
            router.goBack();
          }}
        >
          <BackIcon width="24" height="24" />
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
          className={classes.input}
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
