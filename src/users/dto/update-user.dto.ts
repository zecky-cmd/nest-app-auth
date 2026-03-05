import { PartialType } from "@nestjs/mapped-types";
import { CreaateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreaateUserDto) {}
