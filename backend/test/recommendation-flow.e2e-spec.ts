import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';

const runE2E = process.env.RUN_E2E === 'true';

(runE2E ? describe : describe.skip)('Advisor Recommendation Flow (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  const timestamp = Date.now();
  const advisorEmail = `e2e.advisor.${timestamp}@test.local`;
  const clientEmail = `e2e.client.${timestamp}@test.local`;
  const password = 'Password123!';

  let advisorToken = '';
  let clientToken = '';
  let advisorId = '';
  let clientId = '';

  async function cleanupTestData() {
    if (!dataSource) {
      return;
    }
    // Delete recommendations and notifications for our test users
    await dataSource.query(
      `DELETE FROM recomendaciones WHERE usuario_id IN (
        SELECT id FROM usuarios WHERE email = $1 OR email = $2
      )`,
      [advisorEmail, clientEmail],
    );
    await dataSource.query(
      `DELETE FROM notificaciones WHERE usuario_id IN (
        SELECT id FROM usuarios WHERE email = $1 OR email = $2
      )`,
      [advisorEmail, clientEmail],
    );
    // Delete test users roles
    await dataSource.query(
      `DELETE FROM usuario_roles WHERE usuario_id IN (
        SELECT id FROM usuarios WHERE email = $1 OR email = $2
      )`,
      [advisorEmail, clientEmail],
    );
    // Delete test users
    await dataSource.query(
      `DELETE FROM usuarios WHERE email = $1 OR email = $2`,
      [advisorEmail, clientEmail],
    );
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);

    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  it('1. registers advisor and client', async () => {
    // Register advisor
    const advRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'E2E Advisor',
        email: advisorEmail,
        password,
      })
      .expect(201);
    advisorId = advRes.body.id;

    // Register client
    const cliRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'E2E Client',
        email: clientEmail,
        password,
      })
      .expect(201);
    clientId = cliRes.body.id;

    // Verify emails in database directly to bypass verification flow
    await dataSource.query(
      `UPDATE usuarios SET email_verificado = true WHERE id = $1 OR id = $2`,
      [advisorId, clientId],
    );

    // Login advisor
    const advLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: advisorEmail, password })
      .expect(200);
    advisorToken = advLogin.body.access_token;

    // Login client
    const cliLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: clientEmail, password })
      .expect(200);
    clientToken = cliLogin.body.access_token;
  });

  it('2. links client to advisor', async () => {
    // Link via direct SQL for testing
    await dataSource.query(`UPDATE usuarios SET asesor_id = $1 WHERE id = $2`, [
      advisorId,
      clientId,
    ]);

    // Verify relation
    const [user] = await dataSource.query(
      `SELECT asesor_id FROM usuarios WHERE id = $1`,
      [clientId],
    );
    expect(user.asesor_id).toBe(advisorId);
  });

  it('3. advisor sends a recommendation to the client, and verifies client receives recommendation and notification', async () => {
    const recommendationContent = 'Reduce tus gastos hormiga comiendo en casa.';
    const recommendationTitle = 'Control de Gastos';

    // Advisor sends recommendation
    const sendRes = await request(app.getHttpServer())
      .post(`/asesor/clientes/${clientId}/recomendaciones`)
      .set('Authorization', `Bearer ${advisorToken}`)
      .send({
        contenido: recommendationContent,
        titulo: recommendationTitle,
        tipo: 'asesor',
      })
      .expect(201);

    expect(sendRes.body.contenido).toBe(recommendationContent);
    expect(sendRes.body.titulo).toBe(recommendationTitle);

    // Client fetches recommendations
    const recsRes = await request(app.getHttpServer())
      .get('/recommendations')
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(200);

    const advisorRec = recsRes.body.find(
      (r: any) => r.body === recommendationContent,
    );
    expect(advisorRec).toBeDefined();
    expect(advisorRec.title).toBe(recommendationTitle);
    expect(advisorRec.source).toBe('asesor');

    // Client fetches notifications
    const notifsRes = await request(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(200);

    const recNotif = notifsRes.body.find(
      (n: any) =>
        n.mensaje.includes('Control de Gastos') ||
        n.mensaje.includes('recomendación'),
    );
    expect(recNotif).toBeDefined();
    expect(recNotif.mensaje).toContain('Nueva recomendación de tu asesor');
  });
});
