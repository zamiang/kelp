import RollbarErrorTracking from '../../error-tracking/rollbar';
import { ITask } from '../data-types';
import { dbType } from '../db';

export default class TaskModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up task store');
    this.db = db;
  }

  async addTasksToStore(tasks: ITask[], shouldClearStore?: boolean) {
    if (shouldClearStore) {
      const existingTasks = await this.getAll();
      const existingTaskIds = existingTasks.map((t) => t.id);
      const newTaskIds = tasks.map((t) => t.id);
      const idsToDelete = existingTaskIds.filter(
        (existingTaskId) => !newTaskIds.includes(existingTaskId),
      );
      await Promise.allSettled(idsToDelete.map((id) => this.db.delete('task', id)));
    }

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
    return (await this.db.getAll('task')).filter((t) => t.status === 'needsAction');
  }

  async getAllByParentId(parentId: string) {
    return (await this.db.getAllFromIndex('task', 'by-parent', parentId)).filter(
      (t) => t.status === 'needsAction',
    );
  }

  async completeTask(id: string) {
    const task = await this.getById(id);
    if (task) {
      (task as any).completedAt = new Date();
      (task as any).status = 'completed';
      return this.db.put('task', task);
    }
  }
}
