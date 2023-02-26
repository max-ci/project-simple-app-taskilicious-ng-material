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
  catchError,
  of,
  EMPTY,
} from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { TaskModel } from '../../models/task.model';
import { CategoryService } from '../../services/category.service';
import { TaskService } from '../../services/task.service';
import { TeamMemberService } from '../../services/team-member.service';
import { TeamMemberModel } from '../../models/team-member.model';
import { TaskWithTeamMembersModel } from '../../models/task-with-team-members.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-category-detail',
  styleUrls: ['./category-detail.component.scss'],
  templateUrl: './category-detail.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDetailComponent implements OnDestroy {
  private _destroySubject: Subject<void> = new Subject<void>();

  private _loadingDeleteTask: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(
    null
  );
  public loadingDeleteTask$: Observable<string | null> = this._loadingDeleteTask.asObservable();

  readonly category$: Observable<CategoryModel> = this._activatedRoute.params.pipe(
    switchMap((params: Params) => this._categoryService.getOne(params['id'])),
    take(1)
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
    catchError(() => {
      this._showMessage('An error occurred');
      return of([]);
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
    private _router: Router,
    private _snackbar: MatSnackBar
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
        catchError(() => {
          this._loadingDeleteTask.next(null);
          this._showMessage('An error occurred');
          return EMPTY;
        })
      )
      .subscribe(() => {
        this._loadingDeleteTask.next(null);
        this._refreshTaskSubject.next();
        this._showMessage('Task deleted');
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

  private _showMessage(message: string): void {
    this._snackbar.open(message, undefined, {
      duration: 3000,
    });
  }
}
