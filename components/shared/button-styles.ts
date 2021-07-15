import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  button: {
    width: '100%',
    borderRadius: 30,
    paddingTop: 6,
    paddingBottom: 6,
    transition: 'opacity 0.3s',
    minHeight: 48,
    opacity: 1,
    '&:hover': {
      opacity: 0.6,
    },
  },
  circleButton: {
    marginLeft: 'auto',
    display: 'block',
    background: theme.palette.primary.main,
    color: theme.palette.background.paper,
    opacity: 1,
    transition: 'opacity 0.3s',
    '&:hover': {
      background: theme.palette.primary.main,
      color: theme.palette.background.paper,
      opacity: 0.8,
    },
  },
  selected: {
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    borderRadius: 0,
    transition: 'borderBottom 0.3s',
    textDecoration: 'none',
    color: theme.palette.primary.main,
    background: theme.palette.background.paper,
    opacity: 1,
    '&.Mui-disabled': {
      background: theme.palette.primary.main,
      color: theme.palette.getContrastText(theme.palette.primary.main),
    },
    '&:hover': {
      opacity: 0.6,
      color: theme.palette.primary.main,
      background: theme.palette.background.paper,
    },
  },
  unSelected: {
    borderRadius: 0,
    transition: 'opacity 0.3s',
    borderBottom: `1px solid ${theme.palette.divider}`,
    textDecoration: 'none',
    background: theme.palette.background.paper,
    color: theme.palette.text.hint,
    '&:hover': {
      background: theme.palette.background.paper,
      color: theme.palette.text.hint,
      opacity: 0.6,
    },
  },
}));

export default useStyles;
