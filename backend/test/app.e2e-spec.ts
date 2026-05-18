import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';

const runE2E = process.env.RUN_E2E === 'true';

(runE2E ? describe : describe.skip)('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

const runRbacE2E = runE2E && process.env.RUN_RBAC_E2E === 'true';

(runRbacE2E ? describe : describe.skip)('RBAC flows (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  const timestamp = Date.now();
  const adminEmail = `rbac.admin.${timestamp}@test.local`;
  const userEmail = `rbac.user.${timestamp}@test.local`;
  const password = 'test1234';

  let adminToken = '';
  let userToken = '';
  let userId = '';
  let usuarioRoleId = 0;

  async function cleanupRbacTestData() {
    if (!dataSource) {
      return;
    }

    await dataSource.query(
      `DELETE FROM public.usuario_roles
       WHERE usuario_id IN (
         SELECT id FROM public.usuarios WHERE email = $1 OR email = $2
       )`,
      [adminEmail, userEmail],
    );

    await dataSource.query(
      `DELETE FROM public.usuarios
       WHERE email = $1 OR email = $2`,
      [adminEmail, userEmail],
    );

    await dataSource.query(`DELETE FROM public.roles WHERE nombre = $1`, [
      `blocked-${timestamp}`,
    ]);
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);

    await cleanupRbacTestData();
  });

  afterAll(async () => {
    await cleanupRbacTestData();
    await app.close();
  });

  it('creates users and logs in', async () => {
    await request(app.getHttpServer()).post('/users').send({
      name: 'RBAC Admin',
      email: adminEmail,
      password,
    });

    const createUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'RBAC User',
        email: userEmail,
        password,
      })
      .expect(201);

    userId = createUserResponse.body.id;

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);

    adminToken = adminLoginResponse.body.access_token;

    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password })
      .expect(200);

    userToken = userLoginResponse.body.access_token;
  });

  it('bootstraps admin once', async () => {
    await request(app.getHttpServer())
      .post('/user-roles/bootstrap-admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/user-roles/bootstrap-admin')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(409);
  });

  it('rejects role creation for non-admin user', async () => {
    await request(app.getHttpServer())
      .post('/roles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: `blocked-${timestamp}`, description: 'must fail' })
      .expect(403);
  });

  it('allows admin to list default roles', async () => {
    const rolesResponse = await request(app.getHttpServer())
      .get('/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const usuarioRole = rolesResponse.body.find(
      (role: { nombre: string }) => role.nombre === 'usuario',
    );

    expect(usuarioRole).toBeDefined();
    usuarioRoleId = usuarioRole.id;
  });

  it('assigns default user role and rejects duplicates', async () => {
    await request(app.getHttpServer())
      .post('/user-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId, roleId: usuarioRoleId })
      .expect(201);

    await request(app.getHttpServer())
      .post('/user-roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId, roleId: usuarioRoleId })
      .expect(409);
  });

  it('returns current user role assignments from /user-roles/me', async () => {
    const myRolesResponse = await request(app.getHttpServer())
      .get('/user-roles/me')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(myRolesResponse.body)).toBe(true);
    expect(
      myRolesResponse.body.some(
        (assignment: { role?: { nombre?: string } }) =>
          assignment.role?.nombre === 'usuario',
      ),
    ).toBe(true);
  });
});
