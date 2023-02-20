import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { CategoryModel } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-detail',
  styleUrls: ['./category-detail.component.scss'],
  templateUrl: './category-detail.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDetailComponent {
  private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public loading$: Observable<boolean> = this._loadingSubject.asObservable();

  readonly category$: Observable<CategoryModel> = this._activatedRoute.params.pipe(
    take(1),
    switchMap((params: Params) => this._categoryService.getOne(params['id'])),
    tap(() => {
      this._loadingSubject.next(false);
    })
  );

  constructor(private _activatedRoute: ActivatedRoute, private _categoryService: CategoryService) {}
}
