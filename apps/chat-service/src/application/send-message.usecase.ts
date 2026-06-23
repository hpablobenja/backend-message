// apps/chat-service/src/application/send-message.usecase.ts
import { Message } from '../domain/message.entity';
import { IMessageRepository } from '../domain/message.repository.interface';
import * as crypto from 'crypto';

export interface SendMessageCommand {
  senderId: string;
  receiverId: string;
  content: string;
}

export class SendMessageUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(command: SendMessageCommand): Promise<Message> {
    const { senderId, receiverId, content } = command;

    if (!content || content.trim().length === 0) {
      throw new Error("El contenido del mensaje no puede estar vacío");
    }

    if (senderId === receiverId) {
      throw new Error("No puedes enviarte un mensaje a ti mismo");
    }

    // Instanciamos el modelo de dominio puro
    const message = new Message(
      crypto.randomUUID(),
      senderId,
      receiverId,
      content.trim(),
      new Date(),
      'delivered' // Estado inicial estándar por WebSocket
    );

    // Persistimos en la base de datos NoSQL mediante la interfaz del puerto
    await this.messageRepository.save(message);

    return message;
  }
}