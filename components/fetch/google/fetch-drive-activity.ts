import { flatten, uniq } from 'lodash';
import config from '../../../constants/config';
import ErrorTracking from '../../error-tracking/error-tracking';
import { IFormattedDriveActivity } from '../../store/data-types';

type mimeType =
  | 'application/vnd.google-apps.audio'
  | 'application/vnd.google-apps.document' //	Google Docs
  | 'application/vnd.google-apps.drive-sdk' // 3rd party shortcut
  | 'application/vnd.google-apps.drawing' //	Google Drawing
  | 'application/vnd.google-apps.file' //Google Drive file
  | 'application/vnd.google-apps.folder' //	Google Drive folder
  | 'application/vnd.google-apps.form' //	Google Forms
  | 'application/vnd.google-apps.fusiontable' //	Google Fusion Tables
  | 'application/vnd.google-apps.map' //	Google My Maps
  | 'application/vnd.google-apps.photo'
  | 'application/vnd.google-apps.presentation' //Google Slides
  | 'application/vnd.google-apps.script' // Google Apps Scripts
  | 'application/vnd.google-apps.shortcut' // Shortcut
  | 'application/vnd.google-apps.site' // Google Sites
  | 'application/vnd.google-apps.spreadsheet' // Google Sheets
  | 'application/vnd.google-apps.unknown'
  | 'application/vnd.google-apps.video';

const getUrlForMimeType = (id: string, mt?: mimeType) => {
  if (mt === 'application/vnd.google-apps.spreadsheet') {
    return `https://docs.google.com/spreadsheets/d/${id}/edit`;
  }
  return `https://docs.google.com/${
    mt ? mt.replace('application/vnd.google-apps.', '') : 'document'
  }/d/${id}/edit`;
};

const getTargetInfo = (target: gapi.client.driveactivity.Target) => {
  if (target.drive) {
    // Not handling these
    console.warn('unable to get target info for', target);
    return null;
  } else if (target.driveItem) {
    return {
      title: target.driveItem.title,
      link: target.driveItem.name
        ? getUrlForMimeType(
            target.driveItem.name.replace('items/', ''),
            target.driveItem.mimeType as any,
          )
        : null,
    };
  } else if (target.fileComment) {
    const parent = target.fileComment.parent;
    return {
      title: parent && parent.title,
      link:
        parent && parent.name
          ? getUrlForMimeType(
              parent.name.replace('items/', ''),
              target.fileComment.parent?.mimeType as any,
            )
          : null,
    };
  } else {
    console.warn('unable to get target info for', target);
    return null;
  }
};

type ExcludesFalse = <T>(x: T | false) => x is T;

const fetchDriveActivityForDocument = async (
  documentId: string,
  googleOauthToken: string,
  idsToRefetch: string[],
  limit: any,
) => {
  const params = {
    pageSize: '50', // NOTE: does nothing
    filter: `detail.action_detail_case:(CREATE EDIT COMMENT RENAME) AND time >= "${config.startDate.toISOString()}"`,
    itemName: `items/${documentId}`,
  };

  const activityResponse = await limit(async () =>
    fetch(`https://content-driveactivity.googleapis.com/v2/activity:query?alt=json`, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        authorization: `Bearer ${googleOauthToken}`,
        'Content-Type': 'application/json',
      },
    }),
  );

  if (activityResponse.status !== 200) {
    if (activityResponse.status === 429) {
      idsToRefetch.push(documentId);
    }
    return { peopleIds: [], activity: [] };
  }

  if (!activityResponse.ok) {
    ErrorTracking.logErrorInfo(JSON.stringify(params));
    ErrorTracking.logErrorInRollbar(activityResponse.statusText);
  }

  const response: {
    activities: gapi.client.driveactivity.DriveActivity[];
  } = await activityResponse.json();
  const activity =
    response && response.activities
      ? response.activities.filter(
          (activity) => activity?.actors && activity.actors[0] && activity.actors[0].user,
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
      if (!targetInfo || !targetInfo.link || !activity.timestamp) {
        console.error('Bad data in formatted drive activity', activity);
        return false; // typescript and filter don't get along
      }

      return {
        id: `${activity.timestamp}-${actorPersonId}`,
        time: activity.timestamp ? new Date(activity.timestamp) : new Date(),
        action,
        actorPersonId,
        title: targetInfo && targetInfo.title,
        link: targetInfo && targetInfo.link,
      } as IFormattedDriveActivity;
    })
    .filter(Boolean as any as ExcludesFalse);

  // these are returned as 'people ids'
  const peopleIds = formattedDriveActivity
    .filter((activity) => activity.actorPersonId)
    .map((activity) => activity.actorPersonId!);

  return { peopleIds, activity: formattedDriveActivity };
};

const fetchDriveActivityForDocumentIds = async (
  ids: string[],
  googleOauthToken: string,
  limit: any,
) => {
  const idsToRefetch: string[] = [];
  const results = await Promise.all(
    ids.map(async (id) => fetchDriveActivityForDocument(id, googleOauthToken, idsToRefetch, limit)),
  );
  const peopleIds = uniq(flatten(results.map((result) => result.peopleIds)));
  const activity = flatten(results.map((result) => result.activity));
  return { peopleIds, activity, driveActivityIdsToRefetch: idsToRefetch };
};

export default fetchDriveActivityForDocumentIds;
