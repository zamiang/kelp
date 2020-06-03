import AppBar from "@material-ui/core/AppBar";
import Badge from "@material-ui/core/Badge";
import IconButton from "@material-ui/core/IconButton";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import NotificationsIcon from "@material-ui/icons/Notifications";
import clsx from "clsx";
import React from "react";
import { styles } from "./app";

interface IProps {
  isOpen: boolean;
  classes: styles;
  handleDrawerOpen: () => void;
}

const TopBar = (props: IProps) => (
  <AppBar
    position="absolute"
    className={clsx(
      props.classes.appBar,
      props.isOpen && props.classes.appBarShift
    )}
  >
    <Toolbar className={props.classes.toolbar}>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="open drawer"
        onClick={props.handleDrawerOpen}
        className={clsx(
          props.classes.menuButton,
          props.isOpen && props.classes.menuButtonHidden
        )}
      >
        <MenuIcon />
      </IconButton>
      <Typography
        component="h1"
        variant="h6"
        color="inherit"
        noWrap
        className={props.classes.title}
      >
        Time
      </Typography>
      <IconButton color="inherit">
        <Badge badgeContent={4} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Toolbar>
  </AppBar>
);

export default TopBar;
