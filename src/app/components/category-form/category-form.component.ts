import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  catchError,
  filter,
  switchMap,
  take,
  tap,
  EMPTY,
} from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-category-form',
  styleUrls: ['./category-form.component.scss'],
  templateUrl: './category-form.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFormComponent {
  readonly form: FormGroup = new FormGroup({ name: new FormControl() });

  private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this._loadingSubject.asObservable();

  private _headingTextSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public headingText$: Observable<string> = this._headingTextSubject.asObservable();

  private _submitButtonText: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public submitButtonText$: Observable<string> = this._submitButtonText.asObservable();

  private readonly _createRoute$: Observable<Params> = this._activatedRoute.params.pipe(
    filter((params) => !params['id']),
    take(1),
    tap(() => {
      this._headingTextSubject.next('Create category');
      this._submitButtonText.next('Create');
    })
  );

  private readonly _updateRoute$: Observable<Params> = this._activatedRoute.params.pipe(
    filter((params) => params['id']),
    take(1),
    tap(() => {
      this._headingTextSubject.next('Edit category');
      this._submitButtonText.next('Submit');
    })
  );

  private readonly _getInitialCategoryData$: Subscription = this._updateRoute$
    .pipe(
      switchMap((params: Params) => this._categoryService.getOne(params['id'])),
      take(1),
      catchError(() => {
        this._showMessage(`Category doesn't exist or an error occurred`);
        this._router.navigateByUrl('');
        return EMPTY;
      }),
      tap((data: CategoryModel) => {
        this.form.patchValue(data);
        this._loadingSubject.next(false);
      })
    )
    .subscribe();

  constructor(
    private _categoryService: CategoryService,
    private _router: Router,
    private _snackbar: MatSnackBar,
    private _activatedRoute: ActivatedRoute
  ) {
    this._createRoute$.subscribe();
  }

  onFormSubmitted(form: FormGroup): void {
    if (!form.valid) {
      return;
    }
    this._loadingSubject.next(true);
    this._onFormSubmittedCreateRoute(form);
    this._onFormSubmittedUpdateRoute(form);
  }

  private _onFormSubmittedCreateRoute(form: FormGroup): void {
    this._createRoute$
      .pipe(
        switchMap(() => this._categoryService.create(form.value)),
        take(1),
        catchError(() => {
          this._loadingSubject.next(false);
          this._showMessage('An error occurred');
          return EMPTY;
        })
      )
      .subscribe(() => {
        this._showMessage('Category added');
        this._router.navigateByUrl('');
      });
  }

  private _onFormSubmittedUpdateRoute(form: FormGroup): void {
    this._updateRoute$
      .pipe(
        switchMap((params: Params) => this._categoryService.update(params['id'], form.value)),
        take(1),
        catchError(() => {
          this._loadingSubject.next(false);
          this._showMessage('An error occurred');
          return EMPTY;
        })
      )
      .subscribe(() => {
        this._showMessage('Category updated');
        this._router.navigateByUrl('');
      });
  }

  private _showMessage(message: string): void {
    this._snackbar.open(message, undefined, {
      duration: 3000,
    });
  }
}
