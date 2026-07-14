import { IsEmail, IsString, Length } from 'class-validator';

// OK: a validated class-validator DTO.
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(2, 80)
  name: string;
}
