export class DomainException extends Error {
  public readonly isDomain = true;

  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
    
    // Mantiene un stack trace limpio en Node.js
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DomainException);
    }
  }
}