import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import * as fs from 'fs';

jest.mock('fs');

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should read system logs', () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue('System log content');
    const result = service.readSystemLogs();
    expect(result).toBe('System log content');
  });

  it('should throw an error if system logs cannot be read', () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('File read error');
    });
    expect(() => service.readSystemLogs()).toThrow('Failed to read log file');
  });

  it('should delete system logs', () => {
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const result = service.deleteSystemLogs();
    expect(result).toBe('system logs cleared successfully.');
  });

  it('should throw an error if system logs cannot be deleted', () => {
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      throw new Error('File write error');
    });
    expect(() => service.deleteSystemLogs()).toThrow('Failed to clear system logs');
  });

  it('should read controller logs', () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue('Controller log content');
    const result = service.readControllerLogs();
    expect(result).toBe('Controller log content');
  });

  it('should throw an error if controller logs cannot be read', () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('File read error');
    });
    expect(() => service.readControllerLogs()).toThrow('Failed to read log file');
  });

  it('should delete controller logs', () => {
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const result = service.deleteControllerLogs();
    expect(result).toBe('controller logs cleared successfully.');
  });

  it('should throw an error if controller logs cannot be deleted', () => {
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      throw new Error('File write error');
    });
    expect(() => service.deleteControllerLogs()).toThrow('Failed to clear controller logs');
  });
});
