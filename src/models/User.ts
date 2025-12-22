import bcrypt from 'bcryptjs';
import { User, UserPublic, UserCreateData } from '../types';

// In-memory user storage (replace with actual database in production)
// Admin password will be hashed on first initialization
let users: User[] = [];

class UserModel {
  static async findByEmail(email: string): Promise<User | undefined> {
    return users.find((u) => u.email === email);
  }

  static async findById(id: number | string): Promise<User | undefined> {
    return users.find((u) => u.id === parseInt(id.toString()));
  }

  static async findByUsername(username: string): Promise<User | undefined> {
    return users.find((u) => u.username === username);
  }

  static async create(userData: UserCreateData): Promise<UserPublic> {
    const { username, email, password, role = 'user' } = userData;

    // Check if user already exists
    if (await this.findByEmail(email)) {
      throw new Error('Já existe um usuário com este email');
    }

    if (await this.findByUsername(username)) {
      throw new Error('Já existe um usuário com este nome de usuário');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    };

    users.push(newUser);
    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };
  }

  static async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static getAll(): UserPublic[] {
    return users.map(({ password, ...user }) => user);
  }

  // Initialize default admin user
  static async initializeAdmin(): Promise<void> {
    const existingAdmin = await this.findByEmail('admin@example.com');
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      users.push({
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
      });
    }
  }

  // Helper method for testing - clear all users
  static clearAll(): void {
    users = [];
  }
}

// Initialize admin user on module load
UserModel.initializeAdmin().catch(console.error);

export default UserModel;

