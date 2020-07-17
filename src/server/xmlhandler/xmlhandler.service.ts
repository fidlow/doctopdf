import { Injectable } from "@nestjs/common";
import PDFDocument = require("pdfkit");
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
@Injectable()
export class XmlhandlerService {
  templatesDest: string;
  xsdDest: string;
  uploadDest: string;
  libxml: any;
  constructor(private configService: ConfigService) {
    this.templatesDest = this.configService.get<string>("TEMPLATES_DEST");
    this.xsdDest = this.configService.get<string>("XSD_DEST");
    this.uploadDest = this.configService.get<string>("UPLOAD_DEST");
    this.libxml = require("libxmljs");
  }

  async getFieldsFromXml(filename): Promise<Map<string, string>> {
    let xsd = await fs.promises.readFile(this.xsdDest + "/ON_NSCHFDOPPR.xsd");
    let xml = await fs.promises.readFile(this.uploadDest + "/" + filename);
    const decoder = new TextDecoder("windows-1251");
    let xsdText = decoder.decode(xsd).replace("windows-1251","utf-8");
    let xmlText = decoder.decode(xml).replace("windows-1251","utf-8");
    let xsdDoc = this.libxml.parseXml(xsdText);
    let xmlDoc = this.libxml.parseXml(xmlText);
    const isValid = xmlDoc.validate(xsdDoc);
    if(isValid) {
      const fields = new Map<string, string>();
      fields.set("date",xmlDoc.get('//Документ')[0].attr('ДатаИнфПр').value());
      fields.set("seller",xmlDoc.get('//СвЮЛУч')[0].attr('НаимОрг').value());
      fields.set("num",xmlDoc.get('//СведТов')[0].attr('НомСтр').value());
      fields.set("name",xmlDoc.get('//СведТов')[0].attr('НаимТов').value());
      fields.set("amount",xmlDoc.get('//СведТов')[0].attr('КолТов').value());
      fields.set("price",xmlDoc.get('//СведТов')[0].attr('ЦенаТов').value());
      fields.set("cost",xmlDoc.get('//СумАкциз')[0].text());
      return fields;
    } else 
      throw Error('XsdValidationError');
  }

  async createPdf(filename: string, fields: Map<string, string>): Promise<void> {
    const puppeteer = require("puppeteer");
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let contentHtml = await fs.promises.readFile(this.templatesDest + "/akt-vypolnennyh-rabot.html", 'utf-8');
    fields.forEach(async (value, key) => {
      const findStr = `{${key}}`;
      contentHtml = contentHtml.replace(new RegExp(findStr, 'g'), value);
    });
    await page.setContent(contentHtml);
      // const url = "file:///" + this.templatesDest + "/akt-vypolnennyh-rabot.html";
      // await page.goto(url);
    const buffer = await page.pdf({ format: "A4" });
    await fs.promises.writeFile(this.uploadDest + "/" + filename + ".pdf", buffer, "binary");
    await browser.close();
  }

  getDownloadPdfPath(filename: string) {
    return this.uploadDest + "/" + filename + ".pdf";
  }
}
