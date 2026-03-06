import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: "L'ancien mot de passe est requis" })
  @IsString({ message: "L'ancien mot de passe doit être une chaîne de caractères" })
  oldPassword: string;

  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
  @IsString({ message: 'Le nouveau mot de passe doit être une chaîne de caractères' })
  @MinLength(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' })
  @MaxLength(20, { message: 'Le nouveau mot de passe doit contenir au plus 20 caractères' })
  newPassword: string;
}

