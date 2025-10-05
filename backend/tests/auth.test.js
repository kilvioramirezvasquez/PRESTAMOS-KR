const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Usuario = require('../models/Usuario');

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        const url = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/sistema-prestamos-test';
        await mongoose.connect(url);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Usuario.deleteMany({});
    });

    describe('POST /api/auth/register', () => {
        it('debe crear un nuevo usuario', async () => {
            const userData = {
                nombre: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                rol: 'cobrador'
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.usuario.email).toBe(userData.email);
            expect(res.body.usuario.password).toBeUndefined();
        });

        it('debe fallar con datos inválidos', async () => {
            const userData = {
                nombre: 'T',
                email: 'invalid-email',
                password: '123'
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.errors).toBeDefined();
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            const usuario = new Usuario({
                nombre: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                rol: 'cobrador'
            });
            await usuario.save();
        });

        it('debe hacer login con credenciales válidas', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.usuario.email).toBe('test@example.com');
        });

        it('debe fallar con credenciales inválidas', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(res.body.success).toBe(false);
            expect(res.body.token).toBeUndefined();
        });
    });
});