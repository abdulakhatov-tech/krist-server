import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from 'src/entities';
import { SignUpUserDto } from '../auth/dto';
import { ResponseType } from 'src/common/interfaces/general';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserRoleDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(role: UserRole): Promise<ResponseType<User[]>> {
    if (
      role &&
      ![UserRole.ADMIN, UserRole.SELLER, UserRole.CUSTOMER].includes(role)
    ) {
      throw new NotFoundException(`User role "${role}" doesn't exist!`);
    }

    const whereCondition = role ? { role } : {};

    const users = await this.userRepository.find({ where: whereCondition });

    return {
      success: true,
      message: `${role ? role[0].toUpperCase() + role.slice(1) : 'Users'} fetched successfully`,
      data: users,
    };
  }

  async findById(id: string): Promise<ResponseType<User>> {
    const user = await this.userRepository.findOne({ where: { id }});

    if(!user) {
      throw new NotFoundException('User not found.')
    }

    return {
      success: true,
      message: 'User fetched successfully.',
      data: user
    }
  }

  async editUserRole(id: string, dto: UserRoleDto): Promise<ResponseType<User>> {
    const user = await this.userRepository.findOne({ where: { id }});

    if(!user) {
      throw new NotFoundException('User not found!');
    }

    Object.assign(user, dto);

    const updatedUser = await this.userRepository.save(user);

    return {
      success: true,
      message: "User role edited successfully.",
      data: updatedUser
    }
  }

  async deleteUser(id: string): Promise<ResponseType> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    await this.userRepository.delete(user.id);

    return {
      success: true,
      message: 'User deleted successfully.',
    };
  }

  async findOneById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findOneByIdentifier(identifier: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ email: identifier }, { phoneNumber: identifier }],
    });
  }

  async createUser(body: SignUpUserDto): Promise<User> {
    const { identifier, password } = body;

    const existingUser = await this.findOneByIdentifier(identifier);

    if (existingUser) {
      throw new ConflictException('User already exists!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      ...body,
      email: identifier.includes('@') ? identifier : null,
      phoneNumber: identifier.includes('@') ? null : identifier,
      password: hashedPassword,
    });

    try {
      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException('Error creating user!');
    }
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  async saveOtp(
    userId: string,
    otpCode: string | null,
    expiresAt: number | null,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      otpCode,
      otpExpiresAt: expiresAt ? new Date(expiresAt) : null,
    });
  }

  async updateUser(
    userId: string,
    updateDate: Partial<User>,
  ): Promise<User | null> {
    await this.userRepository.update(userId, updateDate);

    return this.findOneById(userId);
  }
}
