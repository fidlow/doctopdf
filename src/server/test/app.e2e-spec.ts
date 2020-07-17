import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import supertest from 'supertest';
import { AppModule } from "./../app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("upload and download", async () => {
    const res1 = await supertest(app.getHttpServer())
      .post("/upload")
      .attach("file", __dirname + "/14.xml")
      .expect(201)
    const filename = res1.body.message;
    const res2 = await supertest(app.getHttpServer())
    .post("/download")
    .send({filename})
    .expect(201)
    .expect('content-disposition', /attachment; filename="[a-z0-9]+.pdf"/)
    expect(res2.body).toBeInstanceOf(Buffer)
    return res2;
  });
  it("should send error on upload", async () => {
    const res = await supertest(app.getHttpServer())
      .post("/upload")
      .attach("file", __dirname + "/11.xml")
      .expect(201)
    const validBody = {error: true, message: "XsdValidationError"};  
    expect(res.body).toEqual(validBody);
  }); 
});
