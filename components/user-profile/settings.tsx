import Typography from '@material-ui/core/Typography';
import React from 'react';
import panelStyles from '../shared/panel-styles';

const Settings = () => {
  const styles = panelStyles();
  return (
    <React.Fragment>
      <div className={styles.row}>
        <Typography className={styles.title}>Settings</Typography>
      </div>
    </React.Fragment>
  );
};

export default Settings;
