import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  panel: {
    minHeight: '80vh',
    borderRadius: 36,
    marginRight: theme.spacing(2),
    padding: theme.spacing(6),
    background: theme.palette.secondary.light,
  },
  topRightButton: {
    marginLeft: 'auto',
    marginBottom: theme.spacing(4),
  },
}));

export default useStyles;
