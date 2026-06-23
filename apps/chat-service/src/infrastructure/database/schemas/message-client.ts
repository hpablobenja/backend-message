// apps/chat-service/src/infrastructure/database/schemas/message.schema.ts
import { Schema, model, Document } from 'mongoose';
import { MessageStatus } from '../../../domain/message.entity';

// CORRECCIÓN: Le pasamos el tipo del _id (string) como genérico a Document
export interface MessageDocument extends Document<string> {
  _id: string; 
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  status: MessageStatus;
}

// El resto del archivo (Schema y Model) se mantiene igual:
const MessageSchema = new Schema<MessageDocument>(
  {
    _id: { type: String, required: true }, // Mongoose ya sabe que no usará ObjectId automáticamente
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    status: { 
      type: String, 
      enum: ['sent', 'delivered', 'read'], 
      required: true, 
      default: 'sent' 
    }
  },
  {
    versionKey: false,
    timestamps: false
  }
);

MessageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });
MessageSchema.index({ receiverId: 1, senderId: 1, timestamp: -1 });

export const MessageModel = model<MessageDocument>('Message', MessageSchema);