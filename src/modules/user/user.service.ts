import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Brackets, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from 'src/entities';
import { AddUserDto, EditUserDto, UserRoleDto } from './dto';
import { SignUpUserDto } from '../auth/dto';
import { ResponseType } from 'src/common/interfaces/general';
import { UserRole } from 'src/common/enums/user-role.enum';
import { AuthResponseType } from '../auth/auth.interface';
import { UserResponseType } from './user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll({
    page = 1,
    limit = 24,
    role,
    search,
    startDate,
    endDate,
  }: {
    page: number;
    limit: number;
    role?: UserRole;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ResponseType<User[]>> {
    if (
      role &&
      ![UserRole.ADMIN, UserRole.SELLER, UserRole.CUSTOMER].includes(role)
    ) {
      throw new NotFoundException(`User role "${role}" doesn't exist!`);
    }

    // Validate date range if provided
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    // Create query builder for more complex queries
  const queryBuilder = this.userRepository.createQueryBuilder('user');

  // Role condition
  if (role) {
    queryBuilder.andWhere('user.role = :role', { role });
  }

  // Search condition - handles "john+doe" or "john doe" format
  if (search) {
    // Replace '+' with space and trim
    const searchTerm = search.replace(/\+/g, ' ').trim();
    
    // Split into parts for first/last name search
    const searchParts = searchTerm.split(/\s+/);
    
    queryBuilder.andWhere(
      new Brackets(qb => {
        // Search for exact full name match
        qb.where(
          "CONCAT(LOWER(user.firstName), ' ', LOWER(user.lastName)) LIKE LOWER(:fullName)",
          { fullName: `%${searchTerm}%` }
        );
        
        // Also search each part individually in both fields
        searchParts.forEach(part => {
          qb.orWhere('LOWER(user.firstName) LIKE LOWER(:part)', { part: `%${part}%` })
            .orWhere('LOWER(user.lastName) LIKE LOWER(:part)', { part: `%${part}%` });
        });
      })
    );
  }

  // Date range condition
  if (startDate || endDate) {
    if (startDate) {
      queryBuilder.andWhere('user.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('user.createdAt <= :endDate', { endDate });
    }
  }

  // Get total count
  const total = await queryBuilder.getCount();

  // Get paginated results
  const users = await queryBuilder
    .orderBy('user.createdAt', 'DESC')
    .skip((page - 1) * limit)
    .take(limit)
    .getMany();

  const totalPages = Math.ceil(total / limit);


    return {
      success: true,
      message: `${role ? role[0].toUpperCase() + role.slice(1) : 'Users'} fetched successfully`,
      data: users,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        perPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string): Promise<ResponseType<User>> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return {
      success: true,
      message: 'User fetched successfully.',
      data: user,
    };
  }

  async editUserRole(
    id: string,
    dto: UserRoleDto,
  ): Promise<ResponseType<User>> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    Object.assign(user, dto);

    const updatedUser = await this.userRepository.save(user);

    return {
      success: true,
      message: 'User role edited successfully.',
      data: updatedUser,
    };
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

  async addUser(dto: AddUserDto): Promise<UserResponseType> {
    const { email, phoneNumber } = dto;

     // Check if the new email or phone number exists in another user (except the current user)
     const existingUserWithEmail = await this.userRepository.findOne({
      where: [
        { email: dto.email, },
      ],
    });
  
    if (existingUserWithEmail) {
      throw new ConflictException('Email already exists for another user!');
    }

    const existingUserWithPhoneNumber = await this.userRepository.findOne({
      where: [
        { phoneNumber: dto.phoneNumber, },
      ],
    });
  
    if (existingUserWithPhoneNumber) {
      throw new ConflictException('Phone Number already exists for another user!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = this.userRepository.create({
      ...dto,
      email: email || null,
      phoneNumber: phoneNumber || null,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.userRepository.save(newUser);
      return {
        success: true,
        message: 'User added successfully.',
        data: savedUser,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error adding user!');
    }
  }

  async editUser(userId: string, dto: EditUserDto): Promise<UserResponseType> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
  
    if (!user) {
      throw new NotFoundException('User not found!');
    }
  
    // Check if the new email or phone number exists in another user (except the current user)
    const existingUserWithEmail = await this.userRepository.findOne({
      where: [
        { email: dto.email, id: Not(userId) },
      ],
    });
  
    if (existingUserWithEmail) {
      throw new ConflictException('Email already exists for another user!');
    }

    const existingUserWithPhoneNumber = await this.userRepository.findOne({
      where: [
        { phoneNumber: dto.phoneNumber, id: Not(userId) },
      ],
    });
  
    if (existingUserWithPhoneNumber) {
      throw new ConflictException('Phone Number already exists for another user!');
    }
  
    // If email or phone number is not updated, we can keep the original values.
    const updatedUser = await this.userRepository.save({
      ...user,
      ...dto,
      email: dto.email || user.email,  // Keep original email if not updated
      phoneNumber: dto.phoneNumber || user.phoneNumber,  // Keep original phone number if not updated
    });
  
    return {
      success: true,
      message: 'User updated successfully.',
      data: updatedUser,
    };
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
