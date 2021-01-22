import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  selected: {
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
      borderRadius: 0,
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
  unSelected: {
    border: `1px solid ${theme.palette.divider}`,
    textDecoration: 'none',
    textTransform: 'none',
    background: theme.palette.background.paper,
    color: theme.palette.text.hint,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    borderRadius: theme.spacing(3),
    fontWeight: 600,
    fontSize: 14,
  },
}));

export default useStyles;
