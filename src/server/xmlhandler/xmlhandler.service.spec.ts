import { Test, TestingModule } from '@nestjs/testing';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { XmlhandlerService } from './xmlhandler.service';
import path = require('path');


describe('Xmlhandler Service', () => {
  let service: XmlhandlerService;
  let configFunction = () => ({
    "UPLOAD_DEST": path.resolve(__dirname, '../test'),
    "TEMPLATES_DEST": path.resolve(__dirname, '../../../html'),
    "XSD_DEST": path.resolve(__dirname, '../../../xsd'),
  });  
  const validFields = new Map([
    ['date', '20.05.2019'],
    ['seller', 'Seller Organization'],
    ['num', '1'],
    ['name', 'Стол'],
    ['amount', '15'],
    ['price', '20000'],
    ['cost', '1592.00']
  ])  

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XmlhandlerService],
      imports: [
        MulterModule.register({
          dest: '../test',
        }), 
        ConfigModule.forRoot({
          load: [configFunction],
        })],        
    }).compile();
    service = module.get<XmlhandlerService>(XmlhandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should be get fields from xml', async () => {
    const fields = await service.getFieldsFromXml('14.xml');  
    expect(fields).toEqual(validFields);
  });
  it('should be throws xsd validation error on get fields from xml', async () => { 
    try {
      await service.getFieldsFromXml('11.xml');
    } catch (e) {
      expect(e.message).toEqual('XsdValidationError');
    }
  });
  it('should be create pdf', () => {
    expect(service.createPdf('14', validFields)).resolves;
  });
  
  it('should be get download pdf path', () => {
    const filename = 'testFilename!@#3';
    expect(service.getDownloadPdfPath(filename)).toEqual(path.resolve(__dirname, '../test',filename + '.pdf'));
  });
});
