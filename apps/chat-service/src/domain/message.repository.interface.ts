// apps/chat-service/src/domain/message.repository.interface.ts
import { Message } from './message.entity';

export interface IMessageRepository {
  save(message: Message): Promise<void>;
  findChatHistory(userId: string, recipientId: string, limit: number, offset: number): Promise<Message[]>;
  updateStatus(messageId: string, status: 'delivered' | 'read'): Promise<void>;
}