import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** Cada ruta anuncia su título: "Plan de aprendizaje · TutorIA". */
@Injectable()
export class TituloEstrategia extends TitleStrategy {
  private readonly titulo = inject(Title);

  override updateTitle(estado: RouterStateSnapshot): void {
    const propio = this.buildTitle(estado);
    this.titulo.setTitle(propio ? `${propio} · TutorIA` : 'TutorIA');
  }
}
