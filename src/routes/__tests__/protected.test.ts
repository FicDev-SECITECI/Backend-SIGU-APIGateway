import request from "supertest";
import express from "express";
import protectedRoutes from "../protected";
import User from "../../models/User";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use("/api/v1", protectedRoutes);

describe("Protected Routes", () => {
  let userToken: string;
  let adminToken: string;
  let userId: number;
  let adminId: number;

  beforeEach(async () => {
    User.clearAll();
    process.env.JWT_SECRET = "test-secret";

    // Create regular user
    const user = await User.create({
      username: "testuser",
      email: "user@example.com",
      password: "password123",
      role: "user",
    });
    userId = user.id;
    userToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    // Create admin user
    const admin = await User.create({
      username: "adminuser",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });
    adminId = admin.id;
    adminToken = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );
  });

  afterAll(async () => {
    await User.initializeAdmin();
  });

  describe("GET /api/v1/profile", () => {
    it("should return user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/v1/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("email");
      expect(response.body).toHaveProperty("username");
      expect(response.body).toHaveProperty("role");
      expect(response.body.id).toBe(userId);
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/v1/profile").expect(401);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 403 with invalid token", async () => {
      const response = await request(app)
        .get("/api/v1/profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(403);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/v1/dashboard", () => {
    it("should return dashboard data with valid token", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("data");
      expect(response.body.user.id).toBe(userId);
      expect(response.body.data.stats).toHaveProperty("totalUsers");
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/v1/dashboard").expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/v1/users", () => {
    it("should return all users for admin", async () => {
      const response = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("users");
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
    });

    it("should return 403 for regular user", async () => {
      const response = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Permissões insuficientes");
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/v1/users").expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/v1/admin-only", () => {
    it("should return admin info for admin user", async () => {
      const response = await request(app)
        .get("/api/v1/admin-only")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("adminInfo");
      expect(response.body.adminInfo.id).toBe(adminId);
    });

    it("should return 403 for regular user", async () => {
      const response = await request(app)
        .get("/api/v1/admin-only")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Permissões insuficientes");
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/v1/admin-only").expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });
});
