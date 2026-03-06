import { IsNotEmpty, IsString, IsEmail, MinLength, MaxLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { Role } from '../../users/entities/user.entity';

export class RegisterDto {
  @IsNotEmpty({ message: "Le nom est requis" })
  @IsString({ message: "Le nom doit être une chaîne de caractères" })
  @MinLength(3, { message: "Le nom doit contenir au moins 3 caractères" })
  @MaxLength(20, { message: "Le nom doit contenir au plus 20 caractères" })
  name: string;

  @IsNotEmpty({ message: "L'email est requis" })
  @IsEmail({}, { message: "L'email doit être une adresse email valide" })
  email: string;

  @IsNotEmpty({ message: "Le mot de passe est requis" })
  @IsString({ message: "Le mot de passe doit être une chaîne de caractères" })
  // @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,20}$/, {
  //   message: "Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial",
  // })
  @MinLength(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
  @MaxLength(20, { message: "Le mot de passe doit contenir au plus 20 caractères" })
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: "Le rôle doit être USER ou ADMIN" })
  role?: Role;
}
