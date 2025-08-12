import config from '../../../../constants/config';

export const ensureDataRefresh = () => localStorage.removeItem(config.LAST_UPDATED_USER_ID);
