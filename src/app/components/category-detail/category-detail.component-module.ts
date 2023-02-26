import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CategoryDetailComponent } from './category-detail.component';
import { RouterLink } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
  ],
  declarations: [CategoryDetailComponent],
  providers: [],
  exports: [CategoryDetailComponent],
})
export class CategoryDetailComponentModule {}
