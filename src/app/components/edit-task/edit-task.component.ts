import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, Subscription, switchMap, take, tap } from 'rxjs';
import { TaskModel } from '../../models/task.model';
import { CategoryModel } from '../../models/category.model';
import { TaskService } from '../../services/task.service';
import { CategoryService } from '../../services/category.service';

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
  });

  private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this._loadingSubject.asObservable();

  readonly task$: Subscription = this._activatedRoute.params
    .pipe(
      switchMap((params: Params) => this._taskService.getOne(params['id'])),
      take(1),
      tap((task: TaskModel) => this.form.patchValue(task))
    )
    .subscribe();

  readonly categories$: Observable<CategoryModel[]> = this._categoryService.getAll();

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _taskService: TaskService,
    private _categoryService: CategoryService,
    private _router: Router
  ) {}

  onFormSubmitted(form: FormGroup): void {
    this._loadingSubject.next(true);
    this._activatedRoute.params
      .pipe(
        switchMap((params: Params) => this._taskService.update(params['id'], form.value)),
        take(1),
        catchError((err) => {
          throw err;
        })
      )
      .subscribe(() => {
        this._router.navigateByUrl(`categories/${form.get('categoryId')?.value}`);
      });
  }
}
