import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(5),
    margin: 0,
    width: 'auto',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  title: {
    paddingTop: 5,
    paddingLeft: theme.spacing(2),
  },
  smallHeading: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    fontSize: theme.typography.body2.fontSize,
    textTransform: 'uppercase',
    '&:first-child': {
      marginTop: 0,
    },
  },
  content: {
    marginTop: theme.spacing(1),
  },
  link: {
    color: theme.palette.primary.dark,
    display: 'block',
    marginTop: theme.spacing(2),
  },
  avatar: {
    height: 77,
    width: 77,
  },
}));

export default useStyles;
