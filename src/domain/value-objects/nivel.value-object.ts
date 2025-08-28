export enum NivelType {
  GENERAL = 'general',
  PREESCOLAR = 'preescolar',
  PRIMARIA = 'primaria',
  SECUNDARIA = 'secundaria',
  BACHILLERATO = 'bachillerato',
  BACHILLERATO_SABATINO = 'bachillerato_sabatino',
}

export class Nivel {
  private constructor(private readonly value: NivelType) {}

  static create(value: string): Nivel {
    const normalizedValue = value?.toLowerCase();

    if (!Object.values(NivelType).includes(normalizedValue as NivelType)) {
      throw new Error(`Nivel inválido: ${value}`);
    }

    return new Nivel(normalizedValue as NivelType);
  }

  static createFromRaw(value: string): Nivel {
    try {
      return this.create(value);
    } catch {
      return new Nivel(NivelType.PREESCOLAR);
    }
  }

  get rawValue(): string {
    return this.value;
  }

  get displayValue(): string {
    switch (this.value) {
      case NivelType.GENERAL:
        return 'General (Todos los niveles)';
      case NivelType.PREESCOLAR:
        return 'Preescolar';
      case NivelType.PRIMARIA:
        return 'Primaria';
      case NivelType.SECUNDARIA:
        return 'Secundaria';
      case NivelType.BACHILLERATO:
        return 'Bachillerato';
      case NivelType.BACHILLERATO_SABATINO:
        return 'Bachillerato Sabatino';
      default:
        return this.value;
    }
  }

  equals(other: Nivel): boolean {
    return this.value === other.value;
  }

  static getAll(): { value: string; displayValue: string }[] {
    return Object.values(NivelType).map((value) => ({
      value,
      displayValue: Nivel.create(value).displayValue,
    }));
  }

  static fromString(value: string): Nivel {
    return Nivel.create(value);
  }
}
