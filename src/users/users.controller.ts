import { 
    Controller, Post, Body, 
    Get, Param, Put, Delete, 
    Query, HttpCode, HttpStatus, BadRequestException, NotFoundException, ParseIntPipe } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApitResponse, ApiBody, ApiParam, ApiQuery, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreaateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @HttpCode(201)
    createUser(@Body() createUserDto: CreaateUserDto) {
        const user = this.usersService.createUser(createUserDto);   
       if(!user) {
        throw new BadRequestException('Erreur lors de la création de l\'utilisateur');
       }
       return user;
    }

    @Get()
    @HttpCode(200)
    findAll(@Query('role') role?: string) {
        const users = this.usersService.findAll(role);
        if(!users) {
            throw new NotFoundException('Utilisateurs non trouvés');
        }
        return users;
    }

    @Get(':id')
    @HttpCode(200)
    findOne(@Param('id', ParseIntPipe) id: number) {
        const user = this.usersService.findOne(id);
        if(!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }
        return user;
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        const user = this.usersService.update(id, updateUserDto);
        if(!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }
        return user;
    }

    @Delete(':id')
    remove(@Param('id') id: number): Promise<User> {
        return this.usersService.remove(id);
    }
}
