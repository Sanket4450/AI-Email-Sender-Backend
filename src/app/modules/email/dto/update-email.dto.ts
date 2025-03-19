import { IsDateString, IsOptional } from "class-validator";

export class UpdateDraftDto {
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
