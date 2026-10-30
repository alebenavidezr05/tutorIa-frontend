import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HistorialPagina, Uuid } from '../models';

@Injectable({ providedIn: 'root' })
export class HistorialApiService {
  private readonly http = inject(HttpClient);

  listar(idUsuario: Uuid, pagina: number, tamano: number): Observable<HistorialPagina> {
    const params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    return this.http.get<HistorialPagina>(`/historial/${encodeURIComponent(idUsuario)}`, {
      params,
    });
  }
}
