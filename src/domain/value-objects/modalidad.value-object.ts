export enum ModalidadType {
  GENERAL = 'general',
  PRESENCIAL = 'presencial',
  EN_LINEA = 'en_linea',
}

export class Modalidad {
  private constructor(private readonly value: ModalidadType) {}

  static create(value: string): Modalidad {
    const normalizedValue = value?.toLowerCase();

    if (
      !Object.values(ModalidadType).includes(normalizedValue as ModalidadType)
    ) {
      throw new Error(`Modalidad inválida: ${value}`);
    }

    return new Modalidad(normalizedValue as ModalidadType);
  }

  static createFromRaw(value: string): Modalidad {
    try {
      return this.create(value);
    } catch {
      return new Modalidad(ModalidadType.PRESENCIAL);
    }
  }

  get rawValue(): string {
    return this.value;
  }

  get displayValue(): string {
    switch (this.value) {
      case ModalidadType.GENERAL:
        return 'General (Todas las modalidades)';
      case ModalidadType.PRESENCIAL:
        return 'Presencial';
      case ModalidadType.EN_LINEA:
        return 'En Línea';
      default:
        return this.value;
    }
  }

  equals(other: Modalidad): boolean {
    return this.value === other.value;
  }

  static getAll(): { value: string; displayValue: string }[] {
    return Object.values(ModalidadType).map(value => ({
      value,
      displayValue: Modalidad.create(value).displayValue
    }));
  }

  static fromString(value: string): Modalidad {
    return Modalidad.create(value);
  }
}
