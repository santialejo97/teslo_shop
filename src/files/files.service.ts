import { existsSync } from 'fs';
import { join } from 'path';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FilesService {
  getStaticProduct(imagesName: string) {
    const path = join(__dirname, '../../static/products', imagesName);
    if (!existsSync(path))
      throw new NotFoundException(
        `Not Found an image wiht the name: ${imagesName}`,
      );

    return path;
  }
}
