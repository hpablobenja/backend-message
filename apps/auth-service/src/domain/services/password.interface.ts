export interface PasswordService {
  /**
   * Transforma una contraseña en texto plano en un hash seguro y asimétrico.
   */
  hash(password: string): Promise<string>;

  /**
   * Compara una contraseña en texto plano con un hash almacenado.
   */
  compare(password: string, hash: string): Promise<boolean>;
}