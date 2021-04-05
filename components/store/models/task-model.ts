import { uniq } from 'lodash';
import RollbarErrorTracking from '../../error-tracking/rollbar';
import { dbType } from '../db';

export type ITask = {
  id: string;
  title: string;
  completedAt?: Date;
  updatedAt: Date;
  hidden?: boolean;
  deleted?: boolean;
  status?: 'needsAction' | 'completed';
  /**
   * Due date of the task (as a RFC 3339 timestamp). Optional. The due date only records date information; the time portion of the timestamp is discarded when setting the due date. It
   * isn't possible to read or write the time that a task is due via the API.
   */
  due?: Date;
  /** Collection of links. This collection is read-only. */
  links?: Array<{
    /** The description. In HTML speak: Everything between <a> and </a>. */
    description?: string;
    /** The URL. */
    link?: string;
    /** Type of the link, e.g. "email". */
    type?: string;
  }>;
  /** Notes describing the task. Optional. */
  notes?: string;
  /**
   * Parent task identifier. This field is omitted if it is a top-level task. This field is read-only. Use the "move" method to move the task under a different parent or to the top level.
   */
  parent?: string;
  /**
   * String indicating the position of the task among its sibling tasks under the same parent task or at the top level. If this string is greater than another task's corresponding
   * position string according to lexicographical ordering, the task is positioned after the other task under the same parent task (or at the top level). This field is read-only. Use the
   * "move" method to move the task to another position.
   */
  position?: string;
  /** URL pointing to this task. Used to retrieve, update, or delete this task. */
  selfLink?: string;
};

export default class TaskModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up task store');
    this.db = db;
  }

  async addTasksToStore(tasks: ITask[]) {
    const tx = this.db.transaction('task', 'readwrite');
    // console.log(documents, 'about to save documents');
    const promises = tasks.map((task) => {
      if (task?.id) {
        return tx.store.put(task);
      }
    });

    const results = await Promise.allSettled(promises);
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        RollbarErrorTracking.logErrorInRollbar(result.reason);
      }
    });
    return;
  }

  async getById(id: string): Promise<ITask | undefined> {
    return this.db.get('task', id);
  }

  async getAll() {
    return this.db.getAll('task');
  }

  async getAllByParentId(parentId: string) {
    return this.db.getAllFromIndex('task', 'by-parent', parentId);
  }

  async getBulk(ids: string[]): Promise<ITask[]> {
    const uniqIds = uniq(ids);
    const docs = await Promise.all(uniqIds.map((id) => this.db.get('document', id)));
    return docs.filter(Boolean) as any;
  }
}
