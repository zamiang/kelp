import { flatten, uniq } from 'lodash';
import config from '../../constants/config';

const getTargetInfo = (target: gapi.client.driveactivity.Target) => {
  if (target.drive) {
    // Not handling these
    console.warn('unable to get target info for', target);
    return null;
  } else if (target.driveItem) {
    return {
      title: target.driveItem.title,
      link: target.driveItem.name
        ? `https://docs.google.com/document/d/${target.driveItem.name.replace('items/', '')}`
        : null,
    };
  } else if (target.fileComment) {
    const parent = target.fileComment.parent;
    return {
      title: parent && parent.title,
      link:
        parent && parent.name
          ? `https://docs.google.com/document/d/${parent.name.replace('items/', '')}`
          : null,
    };
  } else {
    console.warn('unable to get target info for', target);
    return null;
  }
};

export interface IFormattedDriveActivity {
  id: string;
  time: Date;
  action: string;
  actorPersonId?: string | null;
  title?: string | null;
  link: string;
}

type ExcludesFalse = <T>(x: T | false) => x is T;

const fetchDriveActivityForDocument = async (documentId: string) => {
  try {
    const activityResponse = await gapi.client.driveactivity.activity.query({
      pageSize: 50,
      filter: `detail.action_detail_case:(CREATE EDIT COMMENT RENAME) AND time >= "${config.startDate.toISOString()}"`,
      itemName: `items/${documentId}`,
    } as any);
    const activity =
      activityResponse && activityResponse.result && activityResponse.result.activities
        ? activityResponse.result.activities.filter(
            (activity) => activity.actors && activity.actors[0] && activity.actors[0].user,
          )
        : [];

    const formattedDriveActivity = activity
      .map((activity) => {
        const action = activity.primaryActionDetail
          ? Object.keys(activity.primaryActionDetail)[0]
          : 'unknown';
        const targetInfo = activity.targets ? getTargetInfo(activity.targets[0]) : null;
        const actor = activity.actors && activity.actors[0];
        const actorPersonId =
          actor && actor.user && actor.user.knownUser && actor.user.knownUser.personName;
        if (!targetInfo || !targetInfo.link) {
          return false; // typescript and filter don't get along
        }
        return {
          id: activity.timestamp || 'noid',
          time: activity.timestamp ? new Date(activity.timestamp) : new Date(),
          action,
          actorPersonId,
          title: targetInfo && targetInfo.title,
          link: targetInfo && targetInfo.link,
        };
      })
      .filter((Boolean as any) as ExcludesFalse);

    // these are returned as 'people ids'
    const peopleIds = formattedDriveActivity
      .filter((activity) => activity.actorPersonId)
      .map((activity) => activity.actorPersonId!);

    return { peopleIds, activity: formattedDriveActivity };
  } catch (e) {
    return { peopleIds: [], activity: [] };
  }
};

const fetchDriveActivityForDocumentIds = async (ids: string[]) => {
  const result = await Promise.all(ids.map((id) => fetchDriveActivityForDocument(id)));
  const peopleIds = uniq(flatten(result.map((result) => result.peopleIds)));
  const activity = flatten(result.map((result) => result.activity));
  return { peopleIds, activity };
};

export default fetchDriveActivityForDocumentIds;
