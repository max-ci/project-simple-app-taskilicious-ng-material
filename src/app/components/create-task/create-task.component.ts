import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  catchError,
  take,
  tap,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { TeamMemberModel } from '../../models/team-member.model';
import { CategoryService } from '../../services/category.service';
import { TaskService } from '../../services/task.service';
import { TeamMemberService } from '../../services/team-member.service';

@Component({
  selector: 'app-create-task',
  styleUrls: ['./create-task.component.scss'],
  templateUrl: './create-task.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTaskComponent {
  readonly form: FormGroup = new FormGroup({
    name: new FormControl(),
    categoryId: new FormControl(),
    teamMemberIds: new FormArray([]),
  });

  private _loadingCreateTaskSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loadingCreateTask$: Observable<boolean> = this._loadingCreateTaskSubject.asObservable();

  private _loadingTeamMembersSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public loadingTeamMembers$: Observable<boolean> = this._loadingTeamMembersSubject.asObservable();

  private _categoriesSubject: Subject<CategoryModel[]> = new Subject<CategoryModel[]>();
  public categories$: Observable<CategoryModel[]> = this._categoriesSubject.asObservable();

  private readonly _getCategoriesAndSetInitialValue$: Subscription = this._categoryService
    .getAll()
    .pipe(
      tap((categories: CategoryModel[]) => {
        this._categoriesSubject.next(categories);
      }),
      switchMap(() => this._activatedRoute.queryParams),
      take(1),
      tap((queryParams: Params) => {
        this.form.patchValue({ categoryId: queryParams['initialCategoryId'] });
      })
    )
    .subscribe();

  readonly teamMembers$: Observable<TeamMemberModel[]> = this._teamMemberService.getAll().pipe(
    take(1),
    tap((teamMembers: TeamMemberModel[]) => {
      teamMembers.forEach((teamMember: TeamMemberModel) => {
        this.teamMemberIdsFormArray.push(
          new FormGroup({
            [teamMember.id]: new FormControl(),
          })
        );
        this._loadingTeamMembersSubject.next(false);
      });
    })
  );

  get teamMemberIdsFormArray(): FormArray {
    return this.form.controls['teamMemberIds'] as FormArray;
  }

  constructor(
    private _categoryService: CategoryService,
    private _taskService: TaskService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _teamMemberService: TeamMemberService
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

    this._loadingCreateTaskSubject.next(true);
    this._taskService
      .create({
        name: form.value.name,
        categoryId: form.value.categoryId,
        teamMemberIds: teamMemberIds,
      })
      .pipe(
        take(1),
        catchError((err) => {
          this._loadingCreateTaskSubject.next(false);
          throw err;
        })
      )
      .subscribe(() => {
        this._router.navigateByUrl(`/categories/${form.value.categoryId}`);
      });
  }
}
