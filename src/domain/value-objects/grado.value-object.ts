import { NivelType } from './nivel.value-object';

export class Grado {
  private static readonly gradosPorNivel = {
    [NivelType.PREESCOLAR]: [1, 2, 3],
    [NivelType.PRIMARIA]: [1, 2, 3, 4, 5, 6],
    [NivelType.SECUNDARIA]: [1, 2, 3],
    [NivelType.BACHILLERATO]: [1, 2],
    [NivelType.BACHILLERATO_SABATINO]: [1, 2],
    [NivelType.GENERAL]: []
  };

  static getGradosByNivel(nivel: string): { value: string; displayValue: string }[] {
    const grados = this.gradosPorNivel[nivel as NivelType] || [];
    return grados.map(grado => ({
      value: grado.toString(),
      displayValue: `${grado}°`
    }));
  }

  static getAllGrados(): { value: string; displayValue: string }[] {
    const allGrados = new Set<number>();
    Object.values(this.gradosPorNivel).forEach(grados => {
      grados.forEach(grado => allGrados.add(grado));
    });
    
    return Array.from(allGrados)
      .sort((a, b) => a - b)
      .map(grado => ({
        value: grado.toString(),
        displayValue: `${grado}°`
      }));
  }
}