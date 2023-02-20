import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, Subject, combineLatest, of, tap, map, takeUntil } from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { OrderByName } from '../../enum/order-by-name.enum';

@Component({
  selector: 'app-categories',
  styleUrls: ['./categories.component.scss'],
  templateUrl: './categories.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent implements OnInit {
  private _destroySubject: Subject<void> = new Subject<void>();

  private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public loading$: Observable<boolean> = this._loadingSubject.asObservable();

  private readonly _orderByNameDefaultValue: OrderByName = OrderByName.Asc;

  private _orderByNameSubject: BehaviorSubject<OrderByName | null> =
    new BehaviorSubject<OrderByName | null>(this._orderByNameDefaultValue);
  public orderByName$: Observable<OrderByName | null> = this._orderByNameSubject.asObservable();

  public ordersByName: Observable<OrderByName[]> = of([OrderByName.Asc, OrderByName.Desc]);
  public orderByNameSelect: FormControl = new FormControl(this._orderByNameDefaultValue);

  readonly categories$: Observable<CategoryModel[]> = combineLatest([
    this.orderByName$,
    this._categoryService.getAll(),
  ]).pipe(
    map(([order, categories]: [OrderByName | null, CategoryModel[]]) =>
      categories.sort((category1: CategoryModel, category2: CategoryModel) =>
        order === OrderByName.Desc
          ? category2.name.localeCompare(category1.name)
          : category1.name.localeCompare(category2.name)
      )
    ),
    tap(() => {
      this._loadingSubject.next(false);
    })
  );

  constructor(private _categoryService: CategoryService) {}

  ngOnInit(): void {
    this.orderByNameSelect.valueChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe((value: OrderByName | null) => this._orderByNameSubject.next(value));
  }

  ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }
}
