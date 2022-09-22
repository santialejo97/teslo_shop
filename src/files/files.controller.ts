import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';

import { fileFilter, fileNamer } from './helpers';
import { ParseUUIDPipe } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('files')
@Controller('files')
export class FilesController {
  url: string = '';
  constructor(
    private readonly filesService: FilesService,
    private readonly configServices: ConfigService,
  ) {
    this.url = this.configServices.get<string>('HOST_API');
  }

  @Get('product/:images')
  uploadImages(@Res() res: Response, @Param('images') images: string) {
    const path = this.filesService.getStaticProduct(images);
    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      // limits: { fieldNameSize: 100 },
      storage: diskStorage({
        destination: './static/uploads',
        filename: fileNamer,
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file)
      throw new BadRequestException('Make sure that the file is an image');

    const secureUrl = `${this.url}/files/product/${file.filename}`;

    return { secureUrl };
  }
}
