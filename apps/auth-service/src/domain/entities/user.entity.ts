import { DomainException } from '../exceptions/domain.exception';

export interface UserProperties {
  id?: string;
  name: string;
  phoneNumber: string;
  passwordHash: string;
  createdAt?: Date;
}

export class User {
  private readonly _id?: string;
  private _name: string;
  private _phoneNumber: string;
  private _passwordHash: string;
  private readonly _createdAt: Date;

  constructor(properties: UserProperties) {
    this.validateName(properties.name);
    this.validatePhoneNumber(properties.phoneNumber);
    this.validatePasswordHash(properties.passwordHash);

    this._id = properties.id ?? '';
    this._name = properties.name;
    this._phoneNumber = properties.phoneNumber;
    this._passwordHash = properties.passwordHash;
    this._createdAt = properties.createdAt ?? new Date();
  }

  // Getters para proteger la lectura de las propiedades
  get id(): string | undefined { return this._id; }
  get name(): string { return this._name; }
  get phoneNumber(): string { return this._phoneNumber; }
  get passwordHash(): string { return this._passwordHash; }
  get createdAt(): Date { return this._createdAt; }

  // Validaciones internas de dominio (Invariantes)
  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new DomainException('El nombre debe tener al menos 2 caracteres.');
    }
  }

  private validatePhoneNumber(phoneNumber: string): void {
    // Expresión regular estándar internacional (ej: +34600000000 o +5411223344)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new DomainException('El número de teléfono debe incluir el código de país (ej: +5411234567).');
    }
  }

  private validatePasswordHash(passwordHash: string): void {
    if (!passwordHash || passwordHash.trim().length === 0) {
      throw new DomainException('El hash de la contraseña no puede estar vacío.');
    }
  }
}