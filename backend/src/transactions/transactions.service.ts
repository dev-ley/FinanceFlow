
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        type: dto.type,
        description: dto.description.trim(),
        amount: dto.amount,
        date: dto.date ? new Date(dto.date) : new Date(),
        userId,
      },
      select: {
        id: true,
        type: true,
        description: true,
        amount: true,
        date: true,
        createdAt: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        type: true,
        description: true,
        amount: true,
        date: true,
        createdAt: true,
      },
    });
  }

  async findOne(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      select: {
        id: true,
        type: true,
        description: true,
        amount: true,
        date: true,
        createdAt: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada.');
    }

    return transaction;
  }

  async update(
    userId: string,
    transactionId: string,
    dto: UpdateTransactionDto,
  ) {
    await this.findOne(userId, transactionId);

    return this.prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        ...(dto.type !== undefined && {
          type: dto.type,
        }),
        ...(dto.description !== undefined && {
          description: dto.description.trim(),
        }),
        ...(dto.amount !== undefined && {
          amount: dto.amount,
        }),
        ...(dto.date !== undefined && {
          date: new Date(dto.date),
        }),
      },
      select: {
        id: true,
        type: true,
        description: true,
        amount: true,
        date: true,
        createdAt: true,
      },
    });
  }

  async remove(userId: string, transactionId: string) {
    await this.findOne(userId, transactionId);

    await this.prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });

    return {
      message: 'Transação excluída com sucesso.',
    };
  }
}
