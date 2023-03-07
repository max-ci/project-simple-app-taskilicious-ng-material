import { TeamMemberModel } from './team-member.model';
import { TaskModel } from './task.model';

export interface TaskWithTeamMembersModel extends TaskModel {
  readonly teamMembers: TeamMemberModel[];
}
