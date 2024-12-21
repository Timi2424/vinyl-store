import { Controller, Get, Delete, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Admin (Admin role required)')
@Controller('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Get system logs' })
  @ApiResponse({ status: 200, description: 'System logs retrieved successfully' })
  @Get('logs/system')
  getSystemLogs() {
    try {
      const logs = this.adminService.readSystemLogs();
      return { logs };
    } catch (error) {
      throw new HttpException('Failed to retrieve system logs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Get controller logs' })
  @ApiResponse({ status: 200, description: 'Controller logs retrieved successfully' })
  @Get('logs/controller')
  getControllerLogs() {
    try {
      const logs = this.adminService.readControllerLogs();
      return { logs };
    } catch (error) {
      throw new HttpException('Failed to retrieve controller logs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Delete system logs' })
  @ApiResponse({ status: 204, description: 'System logs deleted successfully' })
  @Delete('logs/system')
  deleteSystemLogs() {
    try {
      const message = this.adminService.deleteSystemLogs();
      return { message };
    } catch (error) {
      throw new HttpException('Failed to delete system logs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Delete controller logs' })
  @ApiResponse({ status: 204, description: 'Controller logs deleted successfully' })
  @Delete('logs/controller')
  deleteControllerLogs() {
    try {
      const message = this.adminService.deleteControllerLogs();
      return { message };
    } catch (error) {
      throw new HttpException('Failed to delete controller logs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
