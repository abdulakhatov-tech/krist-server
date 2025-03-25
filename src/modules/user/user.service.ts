import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";

import { User } from "src/entities";
import { SignUpUserDto } from "../auth/dto";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
	) {}

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
			throw new ConflictException("User already exists!");
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = this.userRepository.create({
			...body,
			email: identifier.includes("@") ? identifier : null,
			phoneNumber: identifier.includes("@") ? null : identifier,
			password: hashedPassword,
		});

		try {
			return await this.userRepository.save(newUser);
		} catch (error) {
			throw new InternalServerErrorException("Error creating user!");
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
}
