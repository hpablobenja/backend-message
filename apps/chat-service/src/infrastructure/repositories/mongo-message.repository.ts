// apps/chat-service/src/infrastructure/repositories/mongo-message.repository.ts
import { IMessageRepository } from '../../domain/message.repository.interface';
import { Message } from '../../domain/message.entity';
import { MessageModel } from '../database/schemas/message-client';

export class MongoMessageRepository implements IMessageRepository {
  
  async save(message: Message): Promise<void> {
    const mongoMessage = new MessageModel({
      _id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      timestamp: message.timestamp,
      status: message.status,
    });
    await mongoMessage.save();
  }

  async findChatHistory(userId: string, recipientId: string, limit: number, offset: number): Promise<Message[]> {
    // Busca mensajes enviados de A a B OR de B a A, ordenados por fecha descendente
    const records = await MessageModel.find({
      $or: [
        { senderId: userId, receiverId: recipientId },
        { senderId: recipientId, receiverId: userId },
      ],
    })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    // Mapeamos los documentos de MongoDB a Entidades de Dominio puras
    return records.map(
      (record) =>
        new Message(
          record._id,
          record.senderId,
          record.receiverId,
          record.content,
          record.timestamp,
          record.status
        )
    );
  }

  async updateStatus(messageId: string, status: 'delivered' | 'read'): Promise<void> {
    await MessageModel.updateOne({ _id: messageId }, { $set: { status } }).exec();
  }
}