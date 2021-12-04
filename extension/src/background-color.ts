import config from '../../constants/config';

const themeHash = {
  nb: config.THEME_NB_COLOR,
  cool: config.THEME_COOL_COLOR,
  light: config.THEME_LIGHT_COLOR,
  dark: config.THEME_DARK_COLOR,
};

const setBgColor = async () => {
  const t = await chrome.storage.sync.get(config.THEME);
  const theme = t[config.THEME] || localStorage.getItem(config.THEME) || 'dark';
  // set a default
  if (!t[config.THEME]) {
    await chrome.storage.sync.set({
      [config.THEME]: localStorage.getItem(config.THEME) || 'dark',
    });
  }
  document.body.style.backgroundColor = (themeHash as any)[theme];
};

void setBgColor();
