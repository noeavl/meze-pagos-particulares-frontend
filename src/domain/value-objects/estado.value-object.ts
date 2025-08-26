export enum EstadoType {
  PENDIENTE = 'pendiente',
  PAGADO = 'pagado',
  VENCIDO = 'vencido',
}

export class Estado {
  private constructor(private readonly value: EstadoType) {}

  static create(value: string): Estado {
    const normalizedValue = value?.toLowerCase();

    if (!Object.values(EstadoType).includes(normalizedValue as EstadoType)) {
      throw new Error(`Estado inválido: ${value}`);
    }

    return new Estado(normalizedValue as EstadoType);
  }

  static createFromRaw(value: string): Estado {
    try {
      return this.create(value);
    } catch {
      return new Estado(EstadoType.PENDIENTE);
    }
  }

  get rawValue(): string {
    return this.value;
  }

  get displayValue(): string {
    switch (this.value) {
      case EstadoType.PENDIENTE:
        return 'Pendiente';
      case EstadoType.PAGADO:
        return 'Pagado';
      case EstadoType.VENCIDO:
        return 'Vencido';
      default:
        return this.value;
    }
  }

  get colorClass(): string {
    switch (this.value) {
      case EstadoType.PENDIENTE:
        return 'text-yellow-600 bg-yellow-100';
      case EstadoType.PAGADO:
        return 'text-green-600 bg-green-100';
      case EstadoType.VENCIDO:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  equals(other: Estado): boolean {
    return this.value === other.value;
  }

  static getAll(): { value: string; displayValue: string }[] {
    return Object.values(EstadoType).map(value => ({
      value,
      displayValue: Estado.create(value).displayValue
    }));
  }

  static fromString(value: string): Estado {
    return Estado.create(value);
  }
}