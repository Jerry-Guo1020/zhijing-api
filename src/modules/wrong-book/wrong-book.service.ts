import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateWrongQuestionStatusDto } from './dto/update-wrong-question-status.dto';
import { WrongQuestionEntity } from './entities/wrong-question.entity';

@Injectable()
export class WrongBookService {
  constructor(
    @InjectRepository(WrongQuestionEntity)
    private readonly wrongQuestionRepository: Repository<WrongQuestionEntity>,
  ) {}

  findAll(userId: string) {
    return this.wrongQuestionRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findDetail(id: string, userId: string) {
    const wrongQuestion = await this.wrongQuestionRepository.findOne({
      where: { id, userId },
    });

    if (!wrongQuestion) {
      throw new NotFoundException('错题不存在');
    }

    return wrongQuestion;
  }

  async updateStatus(id: string, userId: string, dto: UpdateWrongQuestionStatusDto) {
    const wrongQuestion = await this.findDetail(id, userId);
    wrongQuestion.status = dto.status;
    return this.wrongQuestionRepository.save(wrongQuestion);
  }
}
