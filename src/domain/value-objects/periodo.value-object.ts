export class Periodo {
  constructor(public readonly value: string) {
    this.validatePeriodo(value);
  }

  private validatePeriodo(value: string): void {
    const validPeriodos = ['pago_unico', 'mensual', 'semestral'];
    if (!validPeriodos.includes(value)) {
      throw new Error(`Periodo inválido: ${value}`);
    }
  }

  get displayValue(): string {
    const periodoMap: Record<string, string> = {
      'pago_unico': 'Pago Único',
      'mensual': 'Mensual',
      'semestral': 'Semestral'
    };
    return periodoMap[this.value] || this.value;
  }

  static fromString(value: string): Periodo {
    return new Periodo(value);
  }

  static getAll(): { value: string; displayValue: string }[] {
    return [
      { value: 'pago_unico', displayValue: 'Pago Único' },
      { value: 'mensual', displayValue: 'Mensual' },
      { value: 'semestral', displayValue: 'Semestral' }
    ];
  }

  equals(other: Periodo): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}