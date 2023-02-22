import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskModel } from '../models/task.model';

@Injectable()
export class TaskService {
  private readonly _apiUrl: string = `${environment.apiUrl}/tasks`;

  constructor(private _httpClient: HttpClient) {}

  getAll(): Observable<TaskModel[]> {
    return this._httpClient.get<TaskModel[]>(this._apiUrl);
  }

  getOne(id: string): Observable<TaskModel> {
    return this._httpClient.get<TaskModel>(`${this._apiUrl}/${id}`);
  }

  create(task: Omit<TaskModel, 'id' | 'teamMemberIds'>): Observable<TaskModel> {
    return this._httpClient.post<TaskModel>(this._apiUrl, task);
  }

  update(id: string, task: Omit<TaskModel, 'id' | 'teamMemberIds'>): Observable<TaskModel> {
    return this._httpClient.put<TaskModel>(`${this._apiUrl}/${id}`, task);
  }

  delete(id: string): Observable<TaskModel> {
    return this._httpClient.delete<TaskModel>(`${this._apiUrl}/${id}`);
  }
}
