import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, catchError, take } from 'rxjs';
import { Router } from '@angular/router';
import { CategoryService } from '../../services/category.service';

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

  constructor(private _categoryService: CategoryService, private _router: Router) {}

  onFormSubmitted(form: FormGroup): void {
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
        this._loadingSubject.next(false);
        this._router.navigateByUrl('');
      });
  }
}
