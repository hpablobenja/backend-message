// apps/chat-service/src/domain/chat-room.entity.ts

export class ChatRoom {
  constructor(
    public readonly id: string,
    public readonly participantIds: string[],
    public readonly createdAt: Date
  ) {
    if (participantIds.length < 2) {
      throw new Error("Una sala de chat debe tener al menos 2 participantes");
    }
  }

  public hasParticipant(userId: string): boolean {
    return this.participantIds.includes(userId);
  }
}