import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Allegato } from '../models/allegato.model';

interface RispostaUploadUrl {
  uploadUrl: string;
  urlKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  richiediUploadUrl(issueId: number, nomeFile: string, tipoMime: string) {
    return this.http.post<RispostaUploadUrl>(
      `${this.apiUrl}/allegati/richiedi-upload`,
      { issueId, nomeFile, tipoMime },
      { withCredentials: true }
    );
  }

  // Upload diretto a S3 tramite URL presigned: non passa dal nostro backend,
  // niente cookie di sessione da inviare (withCredentials: false esplicito).
  caricaSuS3(uploadUrl: string, file: File) {
    return this.http.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      withCredentials: false,
    });
  }

  confermaCaricamento(urlKey: string, nomeFile: string, issueId: number) {
    return this.http.post<Allegato>(
      `${this.apiUrl}/allegati`,
      { urlKey, nomeFile, issueId },
      { withCredentials: true }
    );
  }

  getAllegatiIssue(issueId: number) {
    return this.http.get<Allegato[]>(`${this.apiUrl}/issues/${issueId}/allegati`, { withCredentials: true });
  }

  richiediDownloadUrl(id: number) {
    return this.http.get<{ downloadUrl: string }>(`${this.apiUrl}/allegati/${id}/download`, { withCredentials: true });
  }

  eliminaAllegato(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/allegati/${id}`, { withCredentials: true });
  }
}