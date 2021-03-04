import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  button: {
    width: '100%',
    borderRadius: theme.spacing(2),
    fontWeight: 500,
    textTransform: 'uppercase',
  },
  buttonPrimary: {
    color: theme.palette.primary.main,
  },
}));

export default useStyles;
