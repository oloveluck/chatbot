import { IsString, Max, Min } from 'class-validator';

export class VectorDto {
  @IsString()
  id: 'vec1';
  @Min(0, {
    each: true,
    message: 'Each element in the list must be greater than or equal to 0.',
  })
  @Max(1, {
    each: true,
    message: 'Each element in the list must be less than or equal to 1.',
  })
  values: number[];
  metadata: Record<string, unknown>;
}
