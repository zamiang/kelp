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
  relativeContainer: {
    position: 'relative',
  },
  topRight: {
    position: 'absolute',
    top: 0,
    right: 0,
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
    [theme.breakpoints.down('sm')]: {
      height: 50,
      width: 50,
    },
  },
  textarea: {
    border: `1px solid #dadce0`,
    borderRadius: 0,
    marginBottom: theme.spacing(1),
  },
}));

export default useStyles;
