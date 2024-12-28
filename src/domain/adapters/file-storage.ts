export abstract class FileStorageService {
  abstract uploadFile(
    file: Express.Multer.File,
    imageID: string,
    path?: string,
  ): Promise<string>;
  abstract getFilePath(imageName: string): string;

  validateFile(file: Express.Multer.File): boolean {
    if (!file) return false;

    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if (validExtensions.includes(fileExtension)) {
      return true;
    }
    return false;
  }
}
