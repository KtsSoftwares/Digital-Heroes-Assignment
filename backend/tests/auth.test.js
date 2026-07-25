process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Lead = require('../models/Lead');
const ActivityLog = require('../models/ActivityLog');

describe('Auth & Permission Integration Tests', () => {
    let adminToken;
    let memberToken;
    let testLeadId;

    // Connect to a test DB before running tests
    beforeAll(async () => {
        const mongoUri = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);

        // Clean test collections
        await User.deleteMany({});
        await Lead.deleteMany({});
        await ActivityLog.deleteMany({});
        // 1. Create Admin User
        const adminRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test Admin',
                email: 'admin@test.com',
                password: 'password123',
                role: 'ADMIN'
            });

        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.com', password: 'password123' });

        adminToken = adminLogin.body.token;

        // 2. Create Member User
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test Member',
                email: 'member@test.com',
                password: 'password123',
                role: 'MEMBER'
            });

        const memberLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'member@test.com', password: 'password123' });

        memberToken = memberLogin.body.token;
    });

    // Clean up database connection after tests finish
    afterAll(async () => {
        await User.deleteMany({});
        await Lead.deleteMany({});
        await ActivityLog.deleteMany({});
        await mongoose.connection.close();
    });

    // --- TEST SUITE ---

    describe('1. Public Lead Submission', () => {
        it('should allow public lead submission without token (201 Created)', async () => {
            const res = await request(app)
                .post('/api/leads/public')
                .send({
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    company: 'Acme Corp'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.lead).toHaveProperty('_id');
            expect(res.body.lead.name).toBe('Jane Doe');
            testLeadId = res.body.lead._id;
        });

        it('should reject submission without required fields (400 Bad Request)', async () => {
            const res = await request(app)
                .post('/api/leads/public')
                .send({ company: 'No Name Corp' });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('2. Authentication & Authorization Middleware', () => {
        it('should block unauthenticated access to protected routes (401 Unauthorized)', async () => {
            const res = await request(app).get('/api/leads');
            expect(res.statusCode).toEqual(401);
        });

        it('should allow authenticated users to fetch leads (200 OK)', async () => {
            const res = await request(app)
                .get('/api/leads')
                .set('Authorization', `Bearer ${memberToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body.leads)).toBe(true);
        });

        it('should prevent MEMBER from reassigning a lead (403 Forbidden)', async () => {
            const res = await request(app)
                .patch(`/api/leads/${testLeadId}/assign`)
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ assignedTo: null });

            expect(res.statusCode).toEqual(403);
        });

        it('should allow ADMIN to reassign a lead (200 OK)', async () => {
            const res = await request(app)
                .patch(`/api/leads/${testLeadId}/assign`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ assignedTo: null });

            expect(res.statusCode).toEqual(200);
        });
    });
});