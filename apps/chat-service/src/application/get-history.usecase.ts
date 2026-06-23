// apps/chat-service/src/application/get-history.usecase.ts
import { Message } from '../domain/message.entity';
import { IMessageRepository } from '../domain/message.repository.interface';

export interface GetHistoryQuery {
  userId: string;
  recipientId: string;
  limit?: number;
  offset?: number;
}

export class GetHistoryUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(query: GetHistoryQuery): Promise<Message[]> {
    const { userId, recipientId, limit = 50, offset = 0 } = query;

    if (limit > 100) {
      throw new Error("No puedes solicitar más de 100 mensajes por página");
    }

    // Recupera la lista ordenada de forma descendente o ascendente según la interfaz
    return await this.messageRepository.findChatHistory(userId, recipientId, limit, offset);
  }
}