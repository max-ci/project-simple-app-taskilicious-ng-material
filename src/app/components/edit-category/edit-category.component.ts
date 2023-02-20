import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { CategoryService } from '../../services/category.service';
import { CategoryModel } from '../../models/category.model';

@Component({
  selector: 'app-edit-category',
  styleUrls: ['./edit-category.component.scss'],
  templateUrl: './edit-category.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCategoryComponent implements OnInit {
  readonly form: FormGroup = new FormGroup({ name: new FormControl() });

  private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public loading$: Observable<boolean> = this._loadingSubject.asObservable();

  private readonly _getInitialData$: Observable<CategoryModel> = this._activatedRoute.params.pipe(
    take(1),
    switchMap((params: Params) => this._categoryService.getOne(params['id'])),
    tap((data: CategoryModel) => {
      this.form.patchValue(data);
      this._loadingSubject.next(false);
    })
  );

  constructor(
    private _categoryService: CategoryService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this._getInitialData$.subscribe();
  }

  onFormSubmitted(form: FormGroup): void {
    this._loadingSubject.next(true);
    this._activatedRoute.params
      .pipe(
        take(1),
        switchMap((params: Params) => this._categoryService.update(params['id'], form.value)),
        catchError((err) => {
          this._loadingSubject.next(false);
          throw err;
        })
      )
      .subscribe(() => {
        this._loadingSubject.next(false);
        this._router.navigateByUrl('');
      });
  }
}
