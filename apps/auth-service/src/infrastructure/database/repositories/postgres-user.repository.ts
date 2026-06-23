import { PrismaClient, UserModel } from '@prisma/client';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';

export class PostgresUserRepository implements UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Mapea un modelo de la base de datos de Prisma a la Entidad de Dominio
   */
  private toDomain(model: UserModel): User {
    return new User({
      id: model.id,
      name: model.name,
      phoneNumber: model.phoneNumber,
      passwordHash: model.passwordHash,
      createdAt: model.createdAt,
    });
  }

  async save(user: User): Promise<User> {
    // Si el usuario ya tiene ID, hacemos un update, de lo contrario un create.
    const data = {
      name: user.name,
      phoneNumber: user.phoneNumber,
      passwordHash: user.passwordHash,
    };

    let savedModel: UserModel;

    if (user.id) {
      savedModel = await this.prisma.userModel.update({
        where: { id: user.id },
        data,
      });
    } else {
      savedModel = await this.prisma.userModel.create({
        data,
      });
    }

    return this.toDomain(savedModel);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const model = await this.prisma.userModel.findUnique({
      where: { phoneNumber },
    });

    if (!model) return null;
    return this.toDomain(model);
  }

  async findById(id: string): Promise<User | null> {
    const model = await this.prisma.userModel.findUnique({
      where: { id },
    });

    if (!model) return null;
    return this.toDomain(model);
  }
}