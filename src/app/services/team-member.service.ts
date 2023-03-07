import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamMemberModel } from '../models/team-member.model';
import { environment } from '../../environments/environment';

@Injectable()
export class TeamMemberService {
  private readonly _apiUrl: string = `${environment.apiUrl}/team-members`;

  constructor(private _httpClient: HttpClient) {}

  getAll(): Observable<TeamMemberModel[]> {
    return this._httpClient.get<TeamMemberModel[]>(this._apiUrl);
  }
}
