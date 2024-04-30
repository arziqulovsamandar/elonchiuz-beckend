import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Admin } from './models/admin.model';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { Response } from 'express';
import { LoginAdminDto } from './dto/login-admin.dto';
import { UpdateAdminYourselfDto } from './dto/update-admin-yourself.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin) private readonly adminRepo: typeof Admin,
    private readonly jwtService: JwtService,
  ) {}

  async getTokens(admin: Admin) {
    const jwtPlayload = {
      id: admin.id
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPlayload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(jwtPlayload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async registration(createAdminDto: CreateAdminDto, res: Response) {
    const admin = await this.adminRepo.findOne({
      where: { phone: createAdminDto.phone },
    });

    if (admin) {
      throw new BadRequestException('Phone already exists!');
    }

    if (createAdminDto.password !== createAdminDto.confirim_password) {
      throw new BadRequestException('Password is not match');
    }

    const hashed_password = await bcrypt.hash(createAdminDto.password, 7);
    const newAdmin = await this.adminRepo.create({
      ...createAdminDto,
      password: hashed_password,
    });
    const token = await this.getTokens(newAdmin);

    const hashed_refresh_token = await bcrypt.hash(token.refresh_token, 7);

    const updateAdmin = await this.adminRepo.update(
      {
        hashed_refresh_token: hashed_refresh_token,
      },
      { where: { id: newAdmin.id }, returning: true },
    );

    res.cookie('refresh_token', token.refresh_token, {
      maxAge: 15 * 24 * 60 * 60 * 100,
      httpOnly: true,
    });

    const response = {
      message: 'User registered',
      user: updateAdmin[1][0],
      token,
    };

    return response;
  }

  async login(loginadminDto: LoginAdminDto, res: Response) {
    const { phone, password } = loginadminDto;
    const admin = await this.adminRepo.findOne({ where: { phone } });

    if (!admin) {
      throw new UnauthorizedException('Admin not registered');
    }

    const isMatchPass = await bcrypt.compare(password, admin.password);

    if (!isMatchPass) {
      throw new UnauthorizedException('Admin not registered(pass)');
    }

    const tokens = await this.getTokens(admin);
    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 7);

    const updateAdmin = await this.adminRepo.update(
      {
        hashed_refresh_token: hashed_refresh_token,
      },
      { where: { id: admin.id }, returning: true },
    );

    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: 15 * 24 * 60 * 60 * 100,
      httpOnly: true,
    });

    const response = {
      message: 'Admin logged in',
      user: updateAdmin[1][0],
      tokens,
    };

    return response;
  }

  async logout(refreshToken: string, res: Response) {
    const AdminData = await this.jwtService.verify(refreshToken, {
      secret: process.env.REFRESH_TOKEN_KEY,
    });

    if (!AdminData) {
      throw new ForbiddenException('Admin not found');
    }

    const updatedAdmin = await this.adminRepo.update(
      { hashed_refresh_token: null },
      { where: { id: AdminData.id }, returning: true },
    );

    res.clearCookie('refresh_token');
    const response = {
      message: 'Admin logged out successfully',
      user: updatedAdmin[1][0],
    };

    return response;
  }


  async updateYourself(
    id: number,
    updateAdminYourselfDto: UpdateAdminYourselfDto,
  ) {
    const hashed_password = await bcrypt.hash(
      updateAdminYourselfDto.password,
      7,
    );

    const admin = await this.adminRepo.update(
      { ...updateAdminYourselfDto, password: hashed_password },
      {
        where: { id },
        returning: true,
      },
    );
    if (!admin) {
      throw new BadRequestException('Admin not found');
    }

    return admin;
  }

  async updateByAdmin(id: number, updateAdminDto: UpdateAdminDto) {
    const hashed_password = await bcrypt.hash(updateAdminDto.password, 7);

    const admin = await this.adminRepo.update(
      { ...updateAdminDto, password: hashed_password },
      {
        where: { id },
        returning: true,
      },
    );
    if (!admin) {
      throw new BadRequestException('Admin not found');
    }

    return admin;
  }

  async refreshToken(admin_id: number, refreshToken: string, res: Response) {
    const decodedToken = this.jwtService.decode(refreshToken);

    if (admin_id != decodedToken['id']) {
      throw new BadRequestException('Admin not found');
    }

    const admin = await this.adminRepo.findOne({ where: { id: admin_id } });
    if (!admin || !admin.hashed_refresh_token) {
      throw new BadRequestException('Admin not found');
    }

    const tokentMatch = await bcrypt.compare(
      refreshToken,
      admin.hashed_refresh_token,
    );
    if (!tokentMatch) {
      throw new ForbiddenException('Forbidden');
    }

    const token = await this.getTokens(admin);
    const hashed_refresh_token = await bcrypt.hash(token.refresh_token, 7);

    const updateAdmin = await this.adminRepo.update(
      {
        hashed_refresh_token: hashed_refresh_token,
      },
      { where: { id: admin.id }, returning: true },
    );

    res.cookie('refresh_token', token.refresh_token, {
      maxAge: 15 * 24 * 60 * 60 * 100,
      httpOnly: true,
    });

    const response = {
      message: 'Refresh token successfully',
      user: updateAdmin[1][0],
      token,
    };

    return response;
  }

  async findByAdmin(id: number) {
    const admin = await this.adminRepo.findByPk(id);
    if (!admin) {
      throw new BadRequestException('Admin not found');
    }
    return admin;
  }

  async findAllAdmin() {
    return this.adminRepo.findAll();
  }

  async removeByAdmin(id: number) {
    const admin = await this.adminRepo.findByPk(id);
    if (!admin) {
      throw new BadRequestException('Admin not found');
    }
    return this.adminRepo.destroy({ where: { id } });
  }
}
