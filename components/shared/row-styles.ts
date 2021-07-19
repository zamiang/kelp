import { makeStyles } from '@material-ui/core/styles';
import { mediumFontFamily } from '../../constants/theme';

const useStyles = makeStyles((theme) => ({
  '@keyframes fadeInAnimation': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  border: {
    borderRadius: 4,
    background: theme.palette.secondary.main,
    padding: '0px !important',
    transition: 'background 0.3s',
    width: 9,
    height: 9,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(1),
    },
  },
  heading: {
    fontWeight: 500,
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    textTransform: 'uppercase',
    fontFamily: mediumFontFamily,
  },
  borderSecondaryMain: {
    background: theme.palette.secondary.main,
    '&.MuiListItem-button:hover': {
      background: theme.palette.secondary.main,
    },
  },
  borderSecondaryLight: {
    background: theme.palette.secondary.light,
    '&.MuiListItem-button:hover': {
      background: theme.palette.secondary.light,
    },
  },
  borderInfoMain: {
    background: theme.palette.info.main,
    '&.MuiListItem-button:hover': {
      background: theme.palette.info.main,
    },
  },
  rightIcon: {
    float: 'right',
    marginTop: -theme.spacing(1),
    marginRight: -theme.spacing(1),
  },
  row: {
    background: 'transparent',
    transition: 'background 0.3s, opacity 0.3s',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    animation: '$fadeInAnimation ease 0.4s',
    animationIterationCount: 1,
    animationFillMode: 'forwards',
    '&.MuiListItem-button:hover': {
      opacity: 0.8,
    },
  },
  rowTopPadding: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  hoverText: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  rowNoHover: {
    background: 'transparent',
    transition: 'background 0.3s, opacity 0.3s',
    cursor: 'pointer',
    textAlign: 'left',
    opacity: 1,
    padding: theme.spacing(2),
    width: '100%',
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: `1px solid transparent`,
    },
  },
  rowExtraPadding: {
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
  },
  rowSmall: {
    padding: 0,
  },
  rowHighlight: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
  },
  rowHighlightPadding: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  rowDefault: {},
  rowText: {
    color: '#9D9D99',
    fontWeight: 500,
    fontFamily: mediumFontFamily,
  },
  rowHeading: {
    color: '#9D9D99',
    fontWeight: 500,
    fontFamily: mediumFontFamily,
    marginLeft: theme.spacing(2),
  },
  rowHint: {
    color: theme.palette.text.hint,
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
  rowLineThrough: {
    textDecoration: 'line-through',
    '&.MuiListItem-button:hover': {
      textDecoration: 'line-through',
    },
  },
  rowLeft: {
    textAlign: 'center',
    marginRight: theme.spacing(2),
  },
  rowPrimaryMain: {
    background: theme.palette.divider,
    '&.Mui-selected, &.Mui-selected:hover, &.MuiListItem-button:hover': {
      borderColor: theme.palette.secondary.light,
      background: theme.palette.secondary.light,
    },
  },
}));

export default useStyles;
