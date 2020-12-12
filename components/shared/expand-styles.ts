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
    wordBreak: 'break-word',
    width: '100%',
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(3),
    },
  },
  smallHeading: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: theme.spacing(1),
    width: '100%',
    display: 'block',
    '&:first-child': {
      marginTop: 0,
    },
  },
  highlight: {
    marginTop: -theme.spacing(1),
  },
  highlightValue: {
    fontSize: theme.typography.h4.fontSize,
    color: theme.palette.primary.dark,
    fontWeight: 600,
  },
  highlightSub: {
    fontSize: '0.875rem',
    color: theme.palette.secondary.main,
    fontWeight: 500,
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
    fontSize: 50,
    [theme.breakpoints.down('sm')]: {
      height: 50,
      width: 50,
      fontSize: 35,
    },
  },
  link: {
    color: theme.palette.primary.dark,
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
  triGroup: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    width: '100%',
  },
  triGroupItem: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  triGroupBorder: {
    width: 1,
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    background: theme.palette.divider,
    height: 'auto',
  },
  triGroupHeading: {
    paddingBottom: theme.spacing(1),
  },
}));

export default useStyles;
