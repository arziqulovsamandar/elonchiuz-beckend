import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User} from './models/user.model';
import { Response } from 'express';
import { LoginUserDto } from './dto/login-user.dto';
import { NUMBER } from 'sequelize';
import { UserGuard } from '../guards/user.guard';
import { CookieGetter } from '../decorators/cookieGetter.decorator';


@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly adminService: UserService) {}

  @ApiOperation({ summary: 'Register Admin' })
  @ApiResponse({ status: 201, type: User })
  @Post('signup')
  registration(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.registration(createUserDto, res);
  }

  @ApiOperation({ summary: 'Login User' })
  @ApiResponse({ status: 200, type: User })
  @HttpCode(HttpStatus.OK)
  @UseGuards(UserGuard)
  @Post('signin')
  login(
    @Body() loginAdminDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.login(loginAdminDto, res);
  }

  @ApiOperation({ summary: 'Logout Admin' })
  @ApiResponse({ status: 200, type: User })
  @HttpCode(HttpStatus.OK)
  @UseGuards(UserGuard)
  @Post('signout')
  logout(
    @CookieGetter('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.logout(refreshToken, res);
  }

  @ApiOperation({ summary: 'RefreshToken User' })
  @ApiResponse({ status: 200, type: User })
  @HttpCode(HttpStatus.OK)
  @Post(':id/refresh')
  refresh(
    @Param('id') id: string,
    @CookieGetter('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.refreshToken(+id, refreshToken, res);
  }

  @ApiOperation({ summary: 'All Admin' })
  @ApiResponse({ status: 200, type: User })
  @UseGuards(UserGuard)
  @Get('all')
  findAll() {
    return this.adminService.findAllAdmin();
  }

  @ApiOperation({ summary: 'Update by id yourself' })
  @ApiResponse({ status: 201, type: User })
  @HttpCode(HttpStatus.OK)
  @UseGuards(UserGuard)
  @Put('yourself/:id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateUserDto) {
    return this.adminService.updateYourself(+id, updateAdminDto);
  }

  @ApiOperation({ summary: 'Update by id by User' })
  @ApiResponse({ status: 201, type: User })
  @HttpCode(HttpStatus.OK)
  @UseGuards(UserGuard)
  @Put('update/:id')
  updateAdmin(@Param('id') id: string, @Body() updateAdminDto: UpdateUserDto) {
    return this.adminService.updateYourself(+id, updateAdminDto);
  }

  @ApiOperation({ summary: 'find One by User' })
  @ApiResponse({ status: 200, type: User })
  @HttpCode(HttpStatus.OK)
  @UseGuards(UserGuard)
  @Get('findOne/:id')
  findOne(@Param('id') id: string) {
    return this.adminService.findByAdmin(+id);
  }

  @ApiOperation({ summary: 'delete by id by User' })
  @ApiResponse({ status: 200, type: NUMBER })
  @UseGuards(UserGuard)
  @Delete('remove/:id')
  remove(@Param('id') id: string) {
    return this.adminService.removeByAdmin(+id);
  }
}
