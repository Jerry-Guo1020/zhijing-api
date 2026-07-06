import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { LearningTaskEntity } from './entities/learning-task.entity';
import { TaskStatus } from '../../common/enums/app.enums';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(LearningTaskEntity)
    private readonly taskRepository: Repository<LearningTaskEntity>,
  ) {}

  findAll(userId: string) {
    return this.taskRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  create(userId: string, dto: CreateTaskDto) {
    const task = this.taskRepository.create({
      userId,
      title: dto.title,
      type: dto.type,
      packId: dto.packId,
      chapterId: dto.chapterId,
      targetValue: dto.targetValue ?? 1,
      deadlineAt: dto.deadlineAt ? new Date(dto.deadlineAt) : null,
      reminderAt: dto.reminderAt ? new Date(dto.reminderAt) : null,
    });

    return this.taskRepository.save(task);
  }

  async complete(userId: string, id: string, dto: CompleteTaskDto) {
    const task = await this.taskRepository.findOne({ where: { id, userId } });
    if (!task) {
      return null;
    }

    task.currentValue = dto.currentValue ?? task.targetValue;
    if (task.currentValue >= task.targetValue) {
      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();
    } else {
      task.status = TaskStatus.IN_PROGRESS;
    }

    return this.taskRepository.save(task);
  }
}
