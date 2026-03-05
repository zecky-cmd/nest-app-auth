import { Optional } from "@nestjs/common";
import { IsNotEmpty, IsString, IsEmail, MinLength, MaxLength, IsEnum, IsOptional } from "class-validator";

export class LoginDto {

    @IsNotEmpty({message: 'L\'email est requis'})
    @IsEmail({}, {message: 'L\'email doit être une adresse email valide'})
    email: string;

    @IsNotEmpty({message: 'Le mot de passe est requis'})
    @IsString({message: 'Le mot de passe doit être une chaîne de caractères'})
    @MinLength(8, {message: 'Le mot de passe doit contenir au moins 8 caractères'})
    @MaxLength(20, {message: 'Le mot de passe doit contenir au plus 20 caractères'})
    password: string;


}