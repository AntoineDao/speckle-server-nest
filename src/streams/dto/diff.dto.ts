import { Expose } from 'class-transformer';

export class DiffObjectDto {

  @Expose()
  common: Array<String>

  @Expose()
  inA: Array<String>

  @Expose()
  inB: Array<String>

}

export class DiffResponseDto {

  @Expose()
  success: boolean = true;

  @Expose()
  message?: string;

  @Expose()
  objects?: DiffObjectDto;
  
  @Expose()
  layers?: DiffObjectDto

}