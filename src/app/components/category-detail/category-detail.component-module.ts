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
import { GoBackDirectiveModule } from '../../directives/go-back.module';
import { DialogRef } from '@angular/cdk/dialog';
import { MatDialogModule } from '@angular/material/dialog';

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
    GoBackDirectiveModule,
    MatDialogModule,
  ],
  declarations: [CategoryDetailComponent],
  providers: [{ provide: DialogRef, useValue: {} }],
  exports: [CategoryDetailComponent],
})
export class CategoryDetailComponentModule {}
