import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminService {
  private readonly systemLogPath = path.join(process.cwd(), 'logs', 'system.log');
  private readonly controllerLogPath = path.join(process.cwd(), 'logs', 'controller.log');

  readSystemLogs(): string {
    return this.readLogFile(this.systemLogPath);
  }

  readControllerLogs(): string {
    return this.readLogFile(this.controllerLogPath);
  }

  deleteSystemLogs(): string {
    return this.deleteLogFile(this.systemLogPath, 'system');
  }

  deleteControllerLogs(): string {
    return this.deleteLogFile(this.controllerLogPath, 'controller');
  }

  private readLogFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      throw new HttpException(`Failed to read log file: ${filePath}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private deleteLogFile(filePath: string, logType: string): string {
    try {
      fs.writeFileSync(filePath, '');
      return `${logType} logs cleared successfully.`;
    } catch (error) {
      throw new HttpException(`Failed to clear ${logType} logs`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
