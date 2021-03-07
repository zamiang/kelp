import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  border: {
    borderRadius: 4,
    background: theme.palette.secondary.main,
    padding: '0px !important',
    transition: 'background 0.3s',
    width: 9,
    height: 9,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(1),
    },
  },
  heading: {
    fontWeight: 500,
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    textTransform: 'uppercase',
  },
  borderSecondaryMain: {
    background: theme.palette.secondary.main,
    '&.MuiListItem-button:hover': {
      background: theme.palette.secondary.main,
    },
  },
  borderSecondaryLight: {
    background: theme.palette.secondary.light,
    '&.MuiListItem-button:hover': {
      background: theme.palette.secondary.light,
    },
  },
  borderInfoMain: {
    background: theme.palette.info.main,
    '&.MuiListItem-button:hover': {
      background: theme.palette.info.main,
    },
  },
  hoverButton: {
    textTransform: 'uppercase',
    transition: 'opacity 0.3s',
    color: theme.palette.primary.dark,
    '&:active': {
      opacity: 0.7,
    },
  },
  row: {
    background: 'transparent',
    transition: 'background 0.3s, opacity 0.3s',
    cursor: 'pointer',
    textAlign: 'left',
    opacity: 1,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    width: '100%',
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: `1px solid transparent`,
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
    '& > *': {
      borderBottom: 'unset',
    },
    '&.MuiListItem-button:hover': {
      opacity: 0.8,
      borderColor: theme.palette.primary.main,
    },
  },
  rowSmall: {
    width: '100%',
    background: 'transparent',
    transition: 'background 0.3s, opacity 0.3s',
    cursor: 'pointer',
    textAlign: 'left',
  },
  rowHighlight: {
    background: theme.palette.secondary.light,
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
  },
  rowHighlightPadding: {
    paddingLeft: theme.spacing(2),
  },
  rowDefault: {},
  rowText: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    color: theme.palette.secondary.dark,
    fontWeight: 600,
  },
  rowHint: {
    color: theme.palette.text.hint,
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
  rowLineThrough: {
    textDecoration: 'line-through',
    '&.MuiListItem-button:hover': {
      textDecoration: 'line-through',
    },
  },
  rowPrimaryMain: {
    background: theme.palette.primary.light,
    '&.Mui-selected, &.Mui-selected:hover, &.MuiListItem-button:hover': {
      borderColor: theme.palette.primary.light,
      background: theme.palette.primary.light,
    },
  },
}));

export default useStyles;
