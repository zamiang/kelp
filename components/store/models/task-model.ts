import { uniq } from 'lodash';
import RollbarErrorTracking from '../../error-tracking/rollbar';
import { dbType } from '../db';

export type ITask = gapi.client.tasks.Task;

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
