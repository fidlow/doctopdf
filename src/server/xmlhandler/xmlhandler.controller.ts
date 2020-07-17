import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  Body,
  Header
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiBody } from "@nestjs/swagger";
import FileUploadDto from "./swagger_FileUploadDto";
import { XmlhandlerService } from "./xmlhandler.service";
import { Response } from "express";
import { ResponseInterface}  from '../../common/ResponseInterface'

@Controller("")
export class XmlhandlerController {
  constructor(private xmlhandlerservice: XmlhandlerService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Upload XML",
    type: FileUploadDto,
  })
  @Header('content-type', 'application/json')
  async uploadFile(@UploadedFile() file, @Res() res: Response) {
    try {
      const fields = await this.xmlhandlerservice.getFieldsFromXml(file.filename);
      // console.log(file.filename, fields)
      await this.xmlhandlerservice.createPdf(file.filename, fields); 
      const result: ResponseInterface = {error:false , message: file.filename};
      res.send(result);
    } catch(e) {
      let error: ResponseInterface = {error: true, message: e.message};
      res.send(error);
    }
  }

  @Post("download")
  @ApiBody({
    description: "Download PDF"
  })
  async downloadFile(@Body('filename') filename: string, @Res() res: Response) {
    const filepath = this.xmlhandlerservice.getDownloadPdfPath(filename); 
    res.download(filepath); 
  }
}
