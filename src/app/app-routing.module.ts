import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CategoriesComponent } from './components/categories/categories.component';
import { CategoryFormComponent } from './components/category-form/category-form.component';
import { CategoryDetailComponent } from './components/category-detail/category-detail.component';
import { CreateTaskComponent } from './components/create-task/create-task.component';
import { EditTaskComponent } from './components/edit-task/edit-task.component';
import { CategoriesComponentModule } from './components/categories/categories.component-module';
import { CategoryServiceModule } from './services/category.service-module';
import { TaskServiceModule } from './services/task.service-module';
import { CategoryFormComponentModule } from './components/category-form/category-form.component-module';
import { CategoryDetailComponentModule } from './components/category-detail/category-detail.component-module';
import { CreateTaskComponentModule } from './components/create-task/create-task.component-module';
import { EditTaskComponentModule } from './components/edit-task/edit-task.component-module';
import { TeamMemberServiceModule } from './services/team-member.service-module';
import { FileServiceModule } from './services/file.service-module';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '', component: CategoriesComponent },
      { path: 'categories/create', component: CategoryFormComponent },
      { path: 'categories/edit/:id', component: CategoryFormComponent },
      { path: 'categories/:id', component: CategoryDetailComponent },
      { path: 'tasks/create', component: CreateTaskComponent },
      { path: 'tasks/edit/:id', component: EditTaskComponent },
      { path: '**', redirectTo: '' },
    ]),
    CategoriesComponentModule,
    CategoryServiceModule,
    TaskServiceModule,
    TeamMemberServiceModule,
    FileServiceModule,
    CategoryFormComponentModule,
    CategoryDetailComponentModule,
    CreateTaskComponentModule,
    EditTaskComponentModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
