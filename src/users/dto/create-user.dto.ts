import { IsNotEmpty, IsString, MaxLength, IsEmail, MinLength, IsOptional, IsEnum} from "class-validator";
import { Role } from "../entities/user.entity";
// import { Unique } from "typeorm";

export class CreaateUserDto {
    @IsNotEmpty({message: 'Le nom est requis'})
    @IsString({message: 'Le nom doit être une chaîne de caractères'})
    @MinLength(3, {message: 'Le nom doit contenir au moins 3 caractères'})
    @MaxLength(20, {message: 'Le nom doit contenir au plus 20 caractères'})
    name: string;

    @IsNotEmpty({message: 'L\'email est requis'})
    @IsEmail({}, {message: 'L\'email doit être une adresse email valide'})
    email: string;
    
    @IsNotEmpty({message: 'Le mot de passe est requis'})
    @IsString({message: 'Le mot de passe doit être une chaîne de caractères'})
    @MinLength(8, {message: 'Le mot de passe doit contenir au moins 8 caractères'})
    @MaxLength(20, {message: 'Le mot de passe doit contenir au plus 20 caractères'})
    password: string;

    @IsOptional()
    @IsEnum(Role, {message: 'Le rôle doit être un rôle valide'})
    role?: 'admin' | 'user';
    
}