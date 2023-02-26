import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CategoriesComponent } from './components/categories/categories.component';
import { CategoryFormComponent } from './components/category-form/category-form.component';
import { CategoryDetailComponent } from './components/category-detail/category-detail.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { CategoriesComponentModule } from './components/categories/categories.component-module';
import { CategoryServiceModule } from './services/category.service-module';
import { TaskServiceModule } from './services/task.service-module';
import { CategoryFormComponentModule } from './components/category-form/category-form.component-module';
import { CategoryDetailComponentModule } from './components/category-detail/category-detail.component-module';
import { TaskFormComponentModule } from './components/task-form/task-form.component-module';
import { TeamMemberServiceModule } from './services/team-member.service-module';
import { FileServiceModule } from './services/file.service-module';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '', component: CategoriesComponent },
      { path: 'categories/create', component: CategoryFormComponent },
      { path: 'categories/edit/:id', component: CategoryFormComponent },
      { path: 'categories/:id', component: CategoryDetailComponent },
      { path: 'tasks/create', component: TaskFormComponent },
      { path: 'tasks/edit/:id', component: TaskFormComponent },
      { path: '**', redirectTo: '' },
    ]),
    CategoriesComponentModule,
    CategoryServiceModule,
    TaskServiceModule,
    TeamMemberServiceModule,
    FileServiceModule,
    CategoryFormComponentModule,
    CategoryDetailComponentModule,
    TaskFormComponentModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
