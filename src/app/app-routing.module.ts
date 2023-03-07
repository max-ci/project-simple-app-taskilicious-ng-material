import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CategoriesComponent } from './components/categories/categories.component';
import { CreateCategoryComponent } from './components/create-category/create-category.component';
import { EditCategoryComponent } from './components/edit-category/edit-category.component';
import { CategoryDetailComponent } from './components/category-detail/category-detail.component';
import { CreateTaskComponent } from './components/create-task/create-task.component';
import { EditTaskComponent } from './components/edit-task/edit-task.component';
import { CategoriesComponentModule } from './components/categories/categories.component-module';
import { CategoryServiceModule } from './services/category.service-module';
import { TaskServiceModule } from './services/task.service-module';
import { CreateCategoryComponentModule } from './components/create-category/create-category.component-module';
import { CategoryDetailComponentModule } from './components/category-detail/category-detail.component-module';
import { EditCategoryComponentModule } from './components/edit-category/edit-category.component-module';
import { CreateTaskComponentModule } from './components/create-task/create-task.component-module';
import { EditTaskComponentModule } from './components/edit-task/edit-task.component-module';
import { TeamMemberServiceModule } from './services/team-member.service-module';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '', component: CategoriesComponent },
      { path: 'categories/create', component: CreateCategoryComponent },
      { path: 'categories/edit/:id', component: EditCategoryComponent },
      { path: 'categories/:id', component: CategoryDetailComponent },
      { path: 'tasks/create', component: CreateTaskComponent },
      { path: 'tasks/edit/:id', component: EditTaskComponent },
      { path: '**', redirectTo: '' },
    ]),
    CategoriesComponentModule,
    CategoryServiceModule,
    TaskServiceModule,
    TeamMemberServiceModule,
    CreateCategoryComponentModule,
    CategoryDetailComponentModule,
    EditCategoryComponentModule,
    CreateTaskComponentModule,
    EditTaskComponentModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
