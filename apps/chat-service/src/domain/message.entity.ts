// apps/chat-service/src/domain/message.entity.ts

export type MessageStatus = 'sent' | 'delivered' | 'read';

export class Message {
  constructor(
    public readonly id: string,
    public readonly senderId: string,
    public readonly receiverId: string,
    public readonly content: string,
    public readonly timestamp: Date,
    public status: MessageStatus = 'sent'
  ) {}

  // Lógica de negocio: Cambiar el estado del mensaje de forma segura
  public markAsDelivered(): void {
    if (this.status === 'sent') {
      this.status = 'delivered';
    }
  }

  public markAsRead(): void {
    if (this.status === 'sent' || this.status === 'delivered') {
      this.status = 'read';
    }
  }
}