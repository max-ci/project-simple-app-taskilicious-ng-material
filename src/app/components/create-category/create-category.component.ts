import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, catchError, take } from 'rxjs';
import { Router } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-category',
  styleUrls: ['./create-category.component.scss'],
  templateUrl: './create-category.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCategoryComponent {
  readonly form: FormGroup = new FormGroup({ name: new FormControl() });

  private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this._loadingSubject.asObservable();

  constructor(
    private _categoryService: CategoryService,
    private _router: Router,
    private _snackbar: MatSnackBar
  ) {}

  onFormSubmitted(form: FormGroup): void {
    if (!form.valid) {
      return;
    }
    this._loadingSubject.next(true);
    this._categoryService
      .create({ name: form.value.name })
      .pipe(
        take(1),
        catchError((err) => {
          this._loadingSubject.next(false);
          throw err;
        })
      )
      .subscribe(() => {
        this._snackbar.open('Category added', undefined, {
          duration: 3000,
        });
        this._router.navigateByUrl('');
      });
  }
}
