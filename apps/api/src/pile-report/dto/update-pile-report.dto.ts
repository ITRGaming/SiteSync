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

class BoringLogDto {
  @IsDateString()
  fromTime: string;

  @IsDateString()
  toTime: string;

  @IsOptional()
  @IsNumber()
  depth?: number;

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

  @IsNumber()
  barDiameter: number;

  @IsNumber()
  numberOfBars: number;

  @IsNumber()
  length: number;

  @IsNumber()
  totalLengthRmt: number;

  @IsNumber()
  weightPerRmt: number;

  @IsNumber()
  totalWeight: number;
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
  @IsNumber()
  totalCageWeight?: number;

  @IsOptional()
  @IsNumber()
  msLinerLength?: number;

  @IsOptional()
  @IsString()
  integrityStatus?: string;

  @IsOptional()
  @IsString()
  cube7DayStatus?: string;

  @IsOptional()
  @IsString()
  cube28DayStatus?: string;

  @IsOptional()
  @IsString()
  eccentricityStatus?: string;

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
