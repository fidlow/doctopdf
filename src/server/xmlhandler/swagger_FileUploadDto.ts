import { ApiProperty } from "@nestjs/swagger";

export default class FileUploadDto {
    @ApiProperty({ type: 'file', format: 'xml' })
    file: any;
  }
  