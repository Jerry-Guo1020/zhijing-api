import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { UpdateWrongQuestionStatusDto } from './dto/update-wrong-question-status.dto';
import { WrongBookService } from './wrong-book.service';

@ApiTags('Wrong Book')
@Controller('wrong-book')
export class WrongBookController {
  constructor(private readonly wrongBookService: WrongBookService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.wrongBookService.findAll(user.sub);
  }

  @Get(':id')
  findDetail(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.wrongBookService.findDetail(id, user.sub);
  }

  @Put(':id/status')
  updateStatus(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateWrongQuestionStatusDto,
  ) {
    return this.wrongBookService.updateStatus(id, user.sub, dto);
  }
}
