import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CreateTaskComponent } from './create-task.component';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
  ],
  declarations: [CreateTaskComponent],
  providers: [],
  exports: [CreateTaskComponent],
})
export class CreateTaskComponentModule {}
