import { UserRole } from "src/common/enums/user-role.enum";
import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 50 })
	firstName: string;

	@Column({ type: "varchar", length: 50 })
	lastName: string;

	@Column({ type: "varchar", unique: true, nullable: true, length: 50 })
	@Index()
	email: string | null;

	@Column({ type: "varchar", unique: true, nullable: true, length: 20 })
	@Index()
	phoneNumber: string | null;

	@Column({ type: "varchar" })
	password: string;

	@Column({ type: "enum", enum: UserRole, default: UserRole.CUSTOMER })
	role: UserRole;

	@Column({ type: "varchar", nullable: true })
	profilePhoto: string | null;

	@Column({ type: "varchar", nullable: true, length: 100 })
	region: string | null;

	@Column({ type: "varchar", nullable: true, length: 100 })
	district: string | null;

	@Column({ type: "varchar", nullable: true, length: 200 })
	extraAddress: string | null;

	@Column({ type: "varchar", nullable: true })
	refreshToken: string | null;

	@CreateDateColumn({ type: "timestamp" })
	createdAt: Date;

	@UpdateDateColumn({ type: "timestamp" })
	updatedAt: Date;
}
