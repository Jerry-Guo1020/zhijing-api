import { PartialType } from '@nestjs/swagger';
import { CreateTargetPlanDto } from './create-target-plan.dto';

export class UpdateTargetPlanDto extends PartialType(CreateTargetPlanDto) {}
