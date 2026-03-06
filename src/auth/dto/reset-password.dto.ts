import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Le code est requis' })
  @IsString({ message: 'Le code doit être une chaîne de caractères' })
  code: string;

  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
  @IsString({ message: 'Le nouveau mot de passe doit être une chaîne de caractères' })
  @MinLength(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' })
  @MaxLength(20, { message: 'Le nouveau mot de passe doit contenir au plus 20 caractères' })
  newPassword: string;
}

