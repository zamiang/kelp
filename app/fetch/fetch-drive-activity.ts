import { flatten, uniq } from 'lodash';
import config from '../config';
import { DriveActivity, Target } from '../types/activity';

const getTargetInfo = (target: Target) => {
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
  link?: string | null;
}

const fetchDriveActivityForDocument = async (documentId: string) => {
  // Todo: Make driveactivity types
  const activityResponse = await (gapi.client as any).driveactivity.activity.query({
    pageSize: 100,
    filter: `detail.action_detail_case:(CREATE EDIT COMMENT) AND time >= "${config.startDate.toISOString()}"`,
    itemName: `items/${documentId}`,
  });
  const activity: DriveActivity[] =
    activityResponse && activityResponse.result && activityResponse.result.activities
      ? activityResponse.result.activities.filter(
          (activity: DriveActivity) =>
            activity.actors && activity.actors[0] && activity.actors[0].user,
        )
      : [];

  const formattedDriveActivity: IFormattedDriveActivity[] = activity.map((activity) => {
    const action = activity.primaryActionDetail
      ? Object.keys(activity.primaryActionDetail)[0]
      : 'unknown';
    const targetInfo = activity.targets ? getTargetInfo(activity.targets[0]) : null;
    const actor = activity.actors && activity.actors[0];
    const actorPersonId =
      actor && actor.user && actor.user.knownUser && actor.user.knownUser.personName;
    return {
      id: targetInfo && targetInfo.title ? targetInfo.title : 'no id',
      time: activity.timestamp ? new Date(activity.timestamp) : new Date(),
      action,
      actorPersonId,
      title: targetInfo && targetInfo.title,
      link: targetInfo && targetInfo.link,
    };
  });

  // these are returned as 'people ids'
  const peopleIds = formattedDriveActivity
    .filter((activity) => activity.actorPersonId)
    .map((activity) => activity.actorPersonId!);

  return { peopleIds, activity: formattedDriveActivity };
};

const fetchDriveActivityForDocumentIds = async (ids: string[]) => {
  const result = await Promise.all(ids.map((id) => fetchDriveActivityForDocument(id)));
  const peopleIds = uniq(flatten(result.map((result) => result.peopleIds)));
  const activity = flatten(result.map((result) => result.activity));
  return { peopleIds, activity };
};

export default fetchDriveActivityForDocumentIds;
