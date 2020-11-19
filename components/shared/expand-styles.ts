import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  topContainer: {
    padding: theme.spacing(4),
    paddingTop: theme.spacing(6),
    margin: 0,
    width: 'auto',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  container: {
    padding: theme.spacing(4),
    paddingTop: theme.spacing(2),
    margin: 0,
    width: 'auto',
    overflowX: 'auto',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  relativeContainer: {
    position: 'relative',
  },
  edit: {},
  title: {
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(3),
    },
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
  overflowEllipsis: {
    textOverflow: 'ellipsis',
    width: '100%',
    display: 'block',
    overflow: 'hidden',
  },
  smallCaption: {
    marginTop: theme.spacing(-1),
    color: theme.palette.text.hint,
    display: 'block',
  },
  inlineList: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
    width: '100%',
  },
  content: {
    marginTop: theme.spacing(1),
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
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
  description: {
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    '& a': {
      color: theme.palette.primary.dark,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  },
  center: {
    textAlign: 'center',
  },
  hideForMobile: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

export default useStyles;
