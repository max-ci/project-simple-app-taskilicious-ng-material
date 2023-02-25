import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, Subject, combineLatest, of, map } from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { OrderByName } from '../../enum/order-by-name.enum';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-categories',
  styleUrls: ['./categories.component.scss'],
  templateUrl: './categories.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  private _destroySubject: Subject<void> = new Subject<void>();

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
    )
  );

  constructor(private _categoryService: CategoryService) {}

  ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  onOrderByNameSelectionChanged(event: MatSelectChange): void {
    this._orderByNameSubject.next(event.value);
  }
}
