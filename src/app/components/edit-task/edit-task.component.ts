import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, switchMap, take, combineLatest, map } from 'rxjs';
import { TaskModel } from '../../models/task.model';
import { CategoryModel } from '../../models/category.model';
import { TaskService } from '../../services/task.service';
import { CategoryService } from '../../services/category.service';
import { TeamMemberModel } from '../../models/team-member.model';
import { TeamMemberService } from '../../services/team-member.service';

@Component({
  selector: 'app-edit-task',
  styleUrls: ['./edit-task.component.scss'],
  templateUrl: './edit-task.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTaskComponent {
  readonly form: FormGroup = new FormGroup({
    name: new FormControl(),
    categoryId: new FormControl(),
    teamMemberIds: new FormArray([]),
  });

  private _loadingUpdateTaskSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loadingUpdateTask$: Observable<boolean> = this._loadingUpdateTaskSubject.asObservable();

  private _loadingTaskAndTeamMembersSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(true);
  public loadingTaskAndTeamMembers$: Observable<boolean> =
    this._loadingTaskAndTeamMembersSubject.asObservable();

  public teamMembers$: Observable<TeamMemberModel[]> = this._activatedRoute.params.pipe(
    switchMap((params: Params) =>
      combineLatest([this._taskService.getOne(params['id']), this._teamMemberService.getAll()])
    ),
    take(1),
    map(([task, teamMembers]: [TaskModel, TeamMemberModel[]]) => {
      this.form.patchValue(task);

      teamMembers.forEach((teamMember: TeamMemberModel) => {
        const teamMemberTask = task.teamMemberIds?.includes(teamMember.id) ? true : null;

        this.teamMemberIdsFormArray.push(
          new FormGroup({
            [teamMember.id]: new FormControl(teamMemberTask),
          })
        );
      });

      this._loadingTaskAndTeamMembersSubject.next(false);

      return teamMembers;
    })
  );

  readonly categories$: Observable<CategoryModel[]> = this._categoryService.getAll();

  get teamMemberIdsFormArray(): FormArray {
    return this.form.controls['teamMemberIds'] as FormArray;
  }

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _taskService: TaskService,
    private _teamMemberService: TeamMemberService,
    private _categoryService: CategoryService
  ) {}

  onFormSubmitted(form: FormGroup): void {
    const teamMemberIds: string[] = form.value.teamMemberIds.reduce(
      (acc: string[], curr: { [key: string]: true | null }) => {
        for (let key in curr) {
          if (curr[key] === true) {
            acc.push(key);
          }
        }
        return acc;
      },
      []
    );

    this._loadingUpdateTaskSubject.next(true);
    this._activatedRoute.params
      .pipe(
        switchMap((params: Params) =>
          this._taskService.update(params['id'], {
            name: form.value.name,
            categoryId: form.value.categoryId,
            teamMemberIds: teamMemberIds,
          })
        ),
        take(1),
        catchError((err) => {
          this._loadingUpdateTaskSubject.next(false);
          throw err;
        })
      )
      .subscribe(() => {
        this._router.navigateByUrl(`categories/${form.value.categoryId}`);
      });
  }
}
