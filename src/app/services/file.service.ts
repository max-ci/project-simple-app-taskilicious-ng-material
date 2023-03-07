import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { UploadcareFile, UploadClient } from '@uploadcare/upload-client';
import { environment } from '../../environments/environment';

@Injectable()
export class FileService {
  private readonly _uploadClient: UploadClient = new UploadClient({
    publicKey: environment.uploadCareApiKey,
  });

  upload(fileData: File): Observable<UploadcareFile> {
    return from(this._uploadClient.uploadFile(fileData));
  }
}
