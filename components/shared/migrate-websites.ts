import { uniqBy } from 'lodash';
import WebsiteStore from '../store/models/website-item-model';
import DeprecatedWebsiteStore from '../store/models/website-model';
import WebsiteVisitStore from '../store/models/website-visit-model';

export const migrateWebsites = async (props: {
  deprecatedWebsiteStore: DeprecatedWebsiteStore;
  websiteVisitStore: WebsiteVisitStore;
  websiteStore: WebsiteStore;
}) => {
  const oldWebsites = await props.deprecatedWebsiteStore.getAll();

  await props.websiteStore.addOldWebsites(uniqBy(oldWebsites, 'url'));
  await props.websiteVisitStore.addOldWebsites(oldWebsites);

  await props.deprecatedWebsiteStore.deleteAll(oldWebsites);

  return true;
};
