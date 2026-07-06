import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WrongQuestionEntity } from './entities/wrong-question.entity';
import { WrongBookController } from './wrong-book.controller';
import { WrongBookService } from './wrong-book.service';

@Module({
  imports: [TypeOrmModule.forFeature([WrongQuestionEntity])],
  controllers: [WrongBookController],
  providers: [WrongBookService],
  exports: [WrongBookService],
})
export class WrongBookModule {}
