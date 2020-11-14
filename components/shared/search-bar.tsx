import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { IStore } from '../store/use-store';

const useStyles = makeStyles((theme) => ({
  inputInput: {
    minWidth: '44ch',
    borderBottom: '0px solid',
    marginRight: theme.spacing(2),
  },
  listItem: {
    // don't want the height to change with or w/o the input
    height: 48,
  },
  iconContainer: {
    minWidth: theme.spacing(5),
  },
}));

type FormValues = {
  query: string;
};

const Search = (props: { query?: string } & IStore) => {
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
  };
  return (
    <ListItem className={clsx(classes.listItem, 'ignore-react-onclickoutside')}>
      <ListItemIcon className={classes.iconContainer}>
        <SearchIcon />
      </ListItemIcon>
      <FormControl fullWidth>
        <form onSubmit={onSubmit}>
          <TextField
            id="search-input"
            type="text"
            placeholder="Search…"
            autoComplete={undefined}
            defaultValue={props.query || ''}
            onChange={handleChange}
            name="query"
            className={classes.inputInput}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setValue('query', '')}>
                  <ClearIcon />
                </IconButton>
              ),
            }}
            inputRef={register}
          />
          <Button variant="contained" color="primary" disableElevation onClick={onSubmit}>
            Search
          </Button>
        </form>
      </FormControl>
    </ListItem>
  );
};

export default Search;
