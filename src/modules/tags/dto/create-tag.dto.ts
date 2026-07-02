import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty({ message: 'Le nom du tag est obligatoire' })
  @IsString()
  @MaxLength(80)
  name: string;
}
