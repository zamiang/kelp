import PromisePool from '@supercharge/promise-pool';
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
  documentId?: string;
  link: string;
}

type ExcludesFalse = <T>(x: T | false) => x is T;

const fetchDriveActivityForDocument = async (documentId: string, googleOauthToken: string) => {
  try {
    const params = {
      pageSize: '50',
      filter: `detail.action_detail_case:(CREATE EDIT COMMENT RENAME) AND time >= "${config.startDate.toISOString()}"`,
      itemName: `items/${documentId}`,
    };

    const activityResponse = await fetch(
      `https://content-driveactivity.googleapis.com/v2/activity:query?alt=json`,
      {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          authorization: `Bearer ${googleOauthToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    const response: {
      activities: gapi.client.driveactivity.DriveActivity[];
    } = await activityResponse.json();
    const activity =
      response && response.activities
        ? response.activities.filter(
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

const fetchDriveActivityForDocumentIds = async (ids: string[], googleOauthToken: string) => {
  const { results } = await PromisePool.withConcurrency(3)
    .for(ids)
    .process(async (id) => fetchDriveActivityForDocument(id, googleOauthToken));
  const peopleIds = uniq(flatten(results.map((result) => result.peopleIds)));
  const activity = flatten(results.map((result) => result.activity));
  // console.log(results, errors, 'fetch drive activity');
  return { peopleIds, activity };
};

export default fetchDriveActivityForDocumentIds;
