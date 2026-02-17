import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReportStatus } from '../pile-execution-report.entity';

class PileDto {
  @IsNumber()
  id: number;

  @IsNumber()
  diameter: number;

  @IsOptional()
  @IsNumber()
  groundLevel?: number;

  @IsOptional()
  @IsNumber()
  cutOffLevel?: number;

  @IsOptional()
  @IsNumber()
  linerTopLevel?: number;

  @IsOptional()
  @IsString()
  location?: string;
}

class BoringLogDto {
  @IsDateString()
  fromTime: string;

  @IsDateString()
  toTime: string;

  @IsNumber()
  depth: number;

  @IsOptional()
  @IsString()
  toolType?: string;

  @IsOptional()
  @IsString()
  activity?: string;

  @IsOptional()
  @IsString()
  strata?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

class ReinforcementDto {
  @IsString()
  barShape: string;

  @IsOptional()
  @IsNumber()
  barDiameter?: number;

  @IsOptional()
  @IsNumber()
  numberOfBars?: number;

  @IsOptional()
  @IsNumber()
  length?: number;

  @IsOptional()
  @IsNumber()
  totalLengthRmt?: number;

  @IsOptional()
  @IsNumber()
  weightPerRmt?: number;

  @IsOptional()
  @IsNumber()
  totalWeight?: number;
}

export class UpdatePileReportDto {
  @IsOptional()
  @IsDateString()
  reportDate?: string;

  @IsOptional()
  @IsString()
  concreteGrade?: string;

  @IsOptional()
  @IsNumber()
  theoreticalQuantity?: number;

  @IsOptional()
  @IsNumber()
  actualQuantity?: number;

  @IsOptional()
  @IsNumber()
  tremieLength?: number;

  @IsOptional()
  @IsDateString()
  pourStartTime?: string;

  @IsOptional()
  @IsDateString()
  pourEndTime?: string;

  @IsOptional()
  @IsString()
  rmcSupplierName?: string;

  @IsOptional()
  @IsDateString()
  boringDate?: string;

  @IsOptional()
  @IsNumber()
  totalCageWeight: number;

  @IsOptional()
  @IsNumber()
  msLinerLength: number;

  @ValidateNested()
  @Type(() => PileDto)
  pile: PileDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BoringLogDto)
  @IsArray()
  boringLogs?: BoringLogDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReinforcementDto)
  @IsArray()
  reinforcementEntries?: ReinforcementDto[];
}
