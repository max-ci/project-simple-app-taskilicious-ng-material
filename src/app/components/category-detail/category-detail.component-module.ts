import { NgModule } from '@angular/core';
import { CategoryDetailComponent } from './category-detail.component';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  imports: [CommonModule, MatProgressSpinnerModule],
  declarations: [CategoryDetailComponent],
  providers: [],
  exports: [CategoryDetailComponent],
})
export class CategoryDetailComponentModule {}
