import User from '../User';
import bcrypt from 'bcryptjs';

describe('User Model', () => {
  beforeEach(() => {
    // Clear all users before each test
    User.clearAll();
  });

  afterAll(async () => {
    // Reinitialize admin after all tests
    await User.initializeAdmin();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);

      expect(user).toHaveProperty('id');
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe('user');
      expect(user).not.toHaveProperty('password');
    });

    it('should create a user with admin role when specified', async () => {
      const userData = {
        username: 'adminuser',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin' as const,
      };

      const user = await User.create(userData);

      expect(user.role).toBe('admin');
    });

    it('should hash the password before storing', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      await User.create(userData);
      const foundUser = await User.findByEmail(userData.email);

      expect(foundUser).toBeDefined();
      expect(foundUser?.password).not.toBe(userData.password);
      expect(await bcrypt.compare(userData.password, foundUser!.password)).toBe(
        true
      );
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      await User.create(userData);

      await expect(User.create(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should throw error if username already exists', async () => {
      const userData1 = {
        username: 'testuser',
        email: 'test1@example.com',
        password: 'password123',
      };

      const userData2 = {
        username: 'testuser',
        email: 'test2@example.com',
        password: 'password123',
      };

      await User.create(userData1);

      await expect(User.create(userData2)).rejects.toThrow(
        'User with this username already exists'
      );
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      await User.create(userData);
      const foundUser = await User.findByEmail(userData.email);

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe(userData.email);
    });

    it('should return undefined if user not found', async () => {
      const foundUser = await User.findByEmail('nonexistent@example.com');
      expect(foundUser).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const createdUser = await User.create(userData);
      const foundUser = await User.findById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
    });

    it('should return undefined if user not found', async () => {
      const foundUser = await User.findById(999);
      expect(foundUser).toBeUndefined();
    });

    it('should work with string id', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const createdUser = await User.create(userData);
      const foundUser = await User.findById(createdUser.id.toString());

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      await User.create(userData);
      const foundUser = await User.findByUsername(userData.username);

      expect(foundUser).toBeDefined();
      expect(foundUser?.username).toBe(userData.username);
    });

    it('should return undefined if user not found', async () => {
      const foundUser = await User.findByUsername('nonexistent');
      expect(foundUser).toBeUndefined();
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const isValid = await User.verifyPassword(plainPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const plainPassword = 'password123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const isValid = await User.verifyPassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return all users without passwords', async () => {
      const userData1 = {
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
      };

      const userData2 = {
        username: 'user2',
        email: 'user2@example.com',
        password: 'password123',
      };

      await User.create(userData1);
      await User.create(userData2);

      const users = User.getAll();

      expect(users).toHaveLength(2);
      users.forEach((user) => {
        expect(user).not.toHaveProperty('password');
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
      });
    });

    it('should return empty array when no users exist', () => {
      const users = User.getAll();
      expect(users).toHaveLength(0);
    });
  });

  describe('initializeAdmin', () => {
    it('should create admin user if not exists', async () => {
      User.clearAll();
      await User.initializeAdmin();

      const admin = await User.findByEmail('admin@example.com');
      expect(admin).toBeDefined();
      expect(admin?.role).toBe('admin');
      expect(admin?.username).toBe('admin');
    });

    it('should not create duplicate admin', async () => {
      User.clearAll();
      await User.initializeAdmin();
      await User.initializeAdmin();

      const admins = User.getAll().filter((u) => u.email === 'admin@example.com');
      expect(admins).toHaveLength(1);
    });
  });
});

