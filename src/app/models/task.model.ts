export interface TaskModel {
  readonly id: string;
  readonly name: string;
  readonly categoryId: string;
  readonly teamMemberIds: string[];
}
