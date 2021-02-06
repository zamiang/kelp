import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  button: {
    border: `1px solid ${theme.palette.primary.main}`,
    textTransform: 'none',
    background: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
    fontWeight: 600,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    borderRadius: theme.spacing(3),
    fontSize: 14,
    transition: 'opacity 0.3s',
    textDecoration: 'none',
    opacity: 1,
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.typography.body2.fontSize,
    },
    '&.Mui-disabled': {
      background: theme.palette.primary.main,
      color: theme.palette.getContrastText(theme.palette.primary.main),
    },
    '&:hover': {
      background: theme.palette.primary.main,
      opacity: 0.6,
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
  smallButton: {
    textTransform: 'uppercase',
    fontSize: theme.typography.caption.fontSize,
    width: '100%',
    paddingLeft: 0,
    paddingRight: 0,
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
