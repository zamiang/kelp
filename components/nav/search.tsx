import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React from 'react';
import { IProps } from './left-drawer';

const useStyles = makeStyles(() => ({
  inputInput: {
    width: '18ch',
  },
  listItem: {
    // don't want the height to change with or w/o the input
    height: 48,
  },
}));

type IResult = {
  id: string;
  title: string;
  type: 'document' | 'meeting' | 'person';
};

const getAutocompleteResults = (props: IProps) => {
  const results: IResult[] = [];

  props.meetings
    .filter((meeting) => meeting.summary)
    .map((meeting) => results.push({ id: meeting.id, title: meeting.summary!, type: 'meeting' }));

  props.documents
    .filter((doc) => doc.name)
    .map((doc) => results.push({ id: doc.id, title: doc.name!, type: 'document' }));

  props.people.map((person) =>
    results.push({
      id: person.emailAddress,
      title: person.name || person.emailAddress,
      type: 'person',
    }),
  );
  return results;
};

const onAutocompleteSelect = (_props?: IProps, result?: IResult) => {
  if (!result) {
    return;
  }
  switch (result.type) {
    case 'person':
      alert(`clicked ${result.id} person`);
      break;
    case 'document':
      alert(`clicked ${result.id} document`);
      break;
    case 'meeting':
      alert(`clicked ${result.id} meeting`);
      break;
  }
};

const Search = (props: IProps) => {
  const classes = useStyles();
  const options = getAutocompleteResults(props);

  const handleAutocompleteSelect = (_: React.ChangeEvent<unknown>, result: IResult) =>
    onAutocompleteSelect(props, result);
  return (
    <ListItem button onClick={props.handleDrawerOpen} className={classes.listItem}>
      <ListItemIcon>
        <SearchIcon />
      </ListItemIcon>
      {props.isOpen && (
        <Autocomplete
          options={options.sort((a, b) => -(b.type + b.title).localeCompare(a.type + a.title))}
          groupBy={(option: IResult) => option.type}
          getOptionLabel={(option: IResult) => option.title}
          clearOnEscape
          blurOnSelect
          autoHighlight
          renderInput={(params) => (
            <TextField placeholder="Search…" className={classes.inputInput} {...params} />
          )}
          // Typings are wrong for this library
          onChange={handleAutocompleteSelect as any}
        />
      )}
    </ListItem>
  );
};

export default Search;
