import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
  catchError,
} from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { TaskModel } from '../../models/task.model';
import { CategoryService } from '../../services/category.service';
import { TaskService } from '../../services/task.service';
import { TeamMemberService } from '../../services/team-member.service';
import { TeamMemberModel } from '../../models/team-member.model';
import { TaskWithTeamMembersModel } from '../../models/task-with-team-members.model';

@Component({
  selector: 'app-category-detail',
  styleUrls: ['./category-detail.component.scss'],
  templateUrl: './category-detail.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDetailComponent implements OnDestroy {
  private _destroySubject: Subject<void> = new Subject<void>();

  private _loadingCategorySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public loadingCategory$: Observable<boolean> = this._loadingCategorySubject.asObservable();

  private _loadingTasksSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public loadingTasks$: Observable<boolean> = this._loadingTasksSubject.asObservable();

  private _loadingDeleteTask: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(
    null
  );
  public loadingDeleteTask$: Observable<string | null> = this._loadingDeleteTask.asObservable();

  readonly category$: Observable<CategoryModel> = this._activatedRoute.params.pipe(
    switchMap((params: Params) => this._categoryService.getOne(params['id'])),
    take(1),
    tap(() => {
      this._loadingCategorySubject.next(false);
    })
  );

  private readonly _tasks$: Observable<TaskWithTeamMembersModel[]> = combineLatest([
    this._activatedRoute.params,
    this._taskService.getAll(),
    this._teamMemberService.getAll(),
  ]).pipe(
    takeUntil(this._destroySubject),
    map(([params, tasks, teamMembers]: [Params, TaskModel[], TeamMemberModel[]]) =>
      tasks
        .filter((task: TaskModel) => task.categoryId === params['id'])
        .map((task: TaskModel) => {
          const teamMembersAssignedToTask: TeamMemberModel[] = Array.isArray(task?.teamMemberIds)
            ? teamMembers.filter((teamMember: TeamMemberModel) => {
                return task.teamMemberIds.includes(teamMember.id);
              })
            : [];

          return { ...task, teamMembers: teamMembersAssignedToTask };
        })
    ),
    tap(() => {
      this._loadingTasksSubject.next(false);
    })
  );

  private _refreshTaskSubject: BehaviorSubject<void> = new BehaviorSubject<void>(void 0);
  public refreshTask$: Observable<void> = this._refreshTaskSubject.asObservable();

  readonly refreshedTasks$: Observable<TaskModel[]> = this.refreshTask$.pipe(
    switchMap(() => this._tasks$)
  );

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _categoryService: CategoryService,
    private _taskService: TaskService,
    private _teamMemberService: TeamMemberService,
    private _router: Router
  ) {}

  ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  deleteTask(id: string): void {
    this._loadingDeleteTask.next(id);
    this._taskService
      .delete(id)
      .pipe(
        take(1),
        catchError((err) => {
          this._loadingDeleteTask.next(null);
          throw err;
        })
      )
      .subscribe(() => {
        this._loadingDeleteTask.next(null);
        this._refreshTaskSubject.next();
      });
  }

  redirectToCreateTaskWithCategoryId(): void {
    this._activatedRoute.params
      .pipe(
        take(1),
        map((params: Params) => {
          this._router.navigate(['tasks/create'], {
            queryParams: { initialCategoryId: params['id'] },
          });
        })
      )
      .subscribe();
  }

  taskTrackBy(index: number, task: TaskModel): string {
    return task.id;
  }
}
