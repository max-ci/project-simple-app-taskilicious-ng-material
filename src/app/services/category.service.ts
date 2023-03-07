import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryModel } from '../models/category.model';
import { environment } from '../../environments/environment';

@Injectable()
export class CategoryService {
  private readonly _apiUrl: string = `${environment.apiUrl}/categories`;

  constructor(private _httpClient: HttpClient) {}

  getAll(): Observable<CategoryModel[]> {
    return this._httpClient.get<CategoryModel[]>(this._apiUrl);
  }

  getOne(id: string): Observable<CategoryModel> {
    return this._httpClient.get<CategoryModel>(`${this._apiUrl}/${id}`);
  }

  create(category: Omit<CategoryModel, 'id'>): Observable<CategoryModel> {
    return this._httpClient.post<CategoryModel>(this._apiUrl, category);
  }

  update(id: string, category: Omit<CategoryModel, 'id'>): Observable<CategoryModel> {
    return this._httpClient.put<CategoryModel>(`${this._apiUrl}/${id}`, category);
  }
}
