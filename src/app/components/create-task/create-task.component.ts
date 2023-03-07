import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
import { CategoryService } from '../../services/category.service';
import { TaskService } from '../../services/task.service';

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
  });

  private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this._loadingSubject.asObservable();

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

  constructor(
    private _categoryService: CategoryService,
    private _taskService: TaskService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) {}

  onFormSubmitted(form: FormGroup): void {
    this._loadingSubject.next(true);
    this._taskService
      .create({ name: form.value.name, categoryId: form.value.categoryId })
      .pipe(
        take(1),
        catchError((err) => {
          this._loadingSubject.next(false);
          throw err;
        })
      )
      .subscribe(() => {
        this._loadingSubject.next(false);
        this._router.navigateByUrl(`/categories/${form.get('categoryId')?.value}`);
      });
  }
}
