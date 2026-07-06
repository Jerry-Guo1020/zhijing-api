import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { CreateTargetPlanDto } from './dto/create-target-plan.dto';
import { UpdateTargetPlanDto } from './dto/update-target-plan.dto';
import { TargetPlansService } from './target-plans.service';

@ApiTags('Target Plans')
@Controller('target-plans')
export class TargetPlansController {
  constructor(private readonly targetPlansService: TargetPlansService) {}

  @Get()
  findPlans(@CurrentUser() user: CurrentUserPayload) {
    return this.targetPlansService.findPlans(user.sub);
  }

  @Get('colleges/search')
  searchColleges(@Query('q') keyword = '') {
    return this.targetPlansService.searchColleges(keyword);
  }

  @Post()
  createPlan(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateTargetPlanDto) {
    return this.targetPlansService.createPlan(user.sub, dto);
  }

  @Put(':id')
  updatePlan(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTargetPlanDto,
  ) {
    return this.targetPlansService.updatePlan(user.sub, id, dto);
  }

  @Get('reports/history')
  findReports(@CurrentUser() user: CurrentUserPayload) {
    return this.targetPlansService.findReports(user.sub);
  }

  @Post('reports/weekly')
  generateWeeklyReport(@CurrentUser() user: CurrentUserPayload) {
    return this.targetPlansService.generateWeeklyReport(user.sub);
  }
}
