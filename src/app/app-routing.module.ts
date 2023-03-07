import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CategoriesComponent } from './components/categories/categories.component';
import { CreateCategoryComponent } from './components/create-category/create-category.component';
import { CategoryDetailComponent } from './components/category-detail/category-detail.component';
import { CategoriesComponentModule } from './components/categories/categories.component-module';
import { CategoryServiceModule } from './services/category.service-module';
import { CreateCategoryComponentModule } from './components/create-category/create-category.component-module';
import { CategoryDetailComponentModule } from './components/category-detail/category-detail.component-module';
import { EditCategoryComponent } from './components/edit-category/edit-category.component';
import { EditCategoryComponentModule } from './components/edit-category/edit-category.component-module';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '', component: CategoriesComponent },
      { path: 'categories/create', component: CreateCategoryComponent },
      { path: 'categories/edit/:id', component: EditCategoryComponent },
      { path: 'categories/:id', component: CategoryDetailComponent },
    ]),
    CategoriesComponentModule,
    CategoryServiceModule,
    CreateCategoryComponentModule,
    CategoryDetailComponentModule,
    EditCategoryComponentModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
