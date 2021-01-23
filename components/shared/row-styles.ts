import { makeStyles } from '@material-ui/core/styles';
import config from '../../constants/config';

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
  row: {
    background: 'transparent',
    transition: 'background 0.3s, opacity 0.3s',
    cursor: 'pointer',
    opacity: 1,
    marginBottom: theme.spacing(0.5),
    paddingLeft: theme.spacing(4),
    '&:hover': {
      backgroundColor: theme.palette.secondary.light,
    },
    '& > *': {
      borderBottom: 'unset',
    },
    '&.MuiListItem-button:hover': {
      opacity: 0.8,
      borderColor: theme.palette.secondary.main,
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
      marginLeft: 0,
      borderRadius: `${theme.spacing(1)}px 0 0 ${theme.spacing(1)}px`,
    },
  },
  rowNoLeftMargin: {
    paddingLeft: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(0),
    },
  },
  rowBorderRadius: {
    borderRadius: theme.spacing(4),
  },
  rowDefault: {},
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
    background: config.BLUE_BACKGROUND,
    '&.Mui-selected, &.Mui-selected:hover, &.MuiListItem-button:hover': {
      borderColor: config.BLUE_BACKGROUND,
      background: config.BLUE_BACKGROUND,
    },
  },
  yellowBackground: {
    backgroundColor: config.YELLOW_BACKGROUND,
    '&.Mui-selected, &.Mui-selected:hover, &.MuiListItem-button:hover': {
      borderColor: config.YELLOW_BACKGROUND,
      backgroundColor: config.YELLOW_BACKGROUND,
    },
  },
  orangeBackground: {
    backgroundColor: config.ORANGE_BACKGROUND,
    '&.Mui-selected, &.Mui-selected:hover, &.MuiListItem-button:hover': {
      borderColor: config.ORANGE_BACKGROUND,
      backgroundColor: config.ORANGE_BACKGROUND,
    },
  },
  purpleBackground: {
    backgroundColor: config.PURPLE_BACKGROUND,
    '&.Mui-selected, &.Mui-selected:hover, &.MuiListItem-button:hover': {
      borderColor: config.PURPLE_BACKGROUND,
      backgroundColor: config.PURPLE_BACKGROUND,
    },
  },
  pinkBackground: {
    backgroundColor: config.PINK_BACKGROUND,
    '&.Mui-selected, &.Mui-selected:hover, &.MuiListItem-button:hover': {
      borderColor: config.PINK_BACKGROUND,
      backgroundColor: config.PINK_BACKGROUND,
    },
  },
}));

export default useStyles;
