import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, Role } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
    constructor(private readonly databaseService: DatabaseService) { }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, SALT_ROUNDS);
        const user = await this.databaseService.user.create({
            data: {
                name: createUserDto.name,
                email: createUserDto.email,
                role: createUserDto.role?.toUpperCase() as Role ?? Role.USER,
                password: hashedPassword,
            },
        });
        return user;
    }


    async findAll(role?: string): Promise<User[]> {
        if (role) {
            return this.databaseService.user.findMany({
                where: { role: role.toUpperCase() as Role }
            });
        } else {
            return this.databaseService.user.findMany();
        }
    }

    async findOne(id: number): Promise<User | null> {
        const user = await this.databaseService.user.findUnique({
            where: { id }
        });
        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.databaseService.user.findUnique({
            where: {
                email
            }
        });
        if (!user) {
            return null;
        }
        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        let hashedPassword: string | undefined = undefined;
        if (updateUserDto.password) {
            hashedPassword = await bcrypt.hash(updateUserDto.password, SALT_ROUNDS);
        }

        return this.databaseService.user.update({
            where: {
                id
            },
            data: {
                ...updateUserDto,
                password: hashedPassword ?? undefined,
                role: updateUserDto.role 
                 ? updateUserDto.role.toUpperCase() as Role : undefined,
            }
        });
    }

    async remove(id: number): Promise<User> {
       return this.databaseService.user.delete({ 
        where: { id } 
    });
    }


    async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // async hashPassword(password: string): Promise<string> {
    //     return await bcrypt.hash(password, SALT_ROUNDS);
    // }

    // async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    //     return await bcrypt.compare(plainPassword, hashedPassword);
    // }
}
