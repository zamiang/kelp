import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  selected: {
    borderRadius: '0.375rem',
    border: `1px solid ${theme.palette.primary.main}`,
    textTransform: 'none',
    background: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
    fontWeight: 600,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    fontSize: 14,
    transition: 'opacity 0.3s',
    opacity: 1,
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
    borderRadius: '0.375rem',
    border: `1px solid ${theme.palette.divider}`,
    textTransform: 'none',
    background: theme.palette.background.paper,
    color: theme.palette.text.hint,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    fontWeight: 600,
    fontSize: 14,
  },
}));

export default useStyles;
