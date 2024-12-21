import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { VinylService } from './vinyl.service';
import { CreateVinylDto } from './dto/create-vinyl.dto';
import { UpdateVinylDto } from './dto/update-vinyl.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { controllerLogger, systemLogger } from '../utils/logger';

@ApiTags('Vinyl')
@Controller('vinyl')
@ApiBearerAuth()
export class VinylController {
  constructor(private readonly vinylService: VinylService) {}

  @ApiOperation({ summary: 'Create a new vinyl record (Admin Role Required)' })
  @ApiResponse({ status: 201, description: 'Vinyl record created successfully' })
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('create')
  async create(@Body() createVinylDto: CreateVinylDto) {
    try {
      controllerLogger.log('Creating a new vinyl record');
      const vinyl = await this.vinylService.create(createVinylDto);
      systemLogger.log(`Vinyl record created: ${vinyl.name}`);
      return { statusCode: HttpStatus.CREATED, message: 'Vinyl record created successfully', data: vinyl };
    } catch (error) {
      controllerLogger.error('Failed to create vinyl record', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('public/all')
  @ApiOperation({
    summary: 'Retrieve list of vinyl records (Public Access)',
    description: 'Fetches all vinyl records.',
  })
  async getFullList() {
    try {
      controllerLogger.log('Fetching full list of vinyl records for unauthenticated user');
      const vinyls = await this.vinylService.getFullList();
      return { statusCode: HttpStatus.OK, data: vinyls };
    } catch (error) {
      controllerLogger.error('Failed to fetch full list of vinyl records', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: 'Retrieve list of vinyl records (Authenticated Access)',
    description: 'Fetches vinyl records with support for pagination, search, and sorting.',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'name', required: false, description: 'Search by vinyl name' })
  @ApiQuery({ name: 'artist', required: false, description: 'Search by artist name' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort by price, name, or artist', example: 'name' })
  @ApiResponse({ status: 200, description: 'List of vinyl records with pagination' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('all')
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('name') name?: string,
    @Query('artist') artist?: string,
    @Query('sortBy') sortBy: 'price' | 'name' | 'artist' = 'name',
  ) {
    try {
      controllerLogger.log('Fetching paginated vinyl records for authenticated user');
      const vinyls = await this.vinylService.findAll(page, pageSize, name, artist, sortBy);
      return { statusCode: HttpStatus.OK, data: vinyls };
    } catch (error) {
      controllerLogger.error('Failed to fetch paginated vinyl records', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Get a vinyl record by ID (Public Access)' })
  @ApiParam({ name: 'id', description: 'ID of the vinyl record' })
  @ApiResponse({ status: 200, description: 'Vinyl record data' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      controllerLogger.log(`Fetching vinyl record by ID: ${id}`);
      const vinyl = await this.vinylService.findOne(id);
      return { statusCode: HttpStatus.OK, data: vinyl };
    } catch (error) {
      controllerLogger.error(`Failed to fetch vinyl record by ID: ${id}`, error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Update a vinyl record by ID (Admin Role Required)' })
  @ApiParam({ name: 'id', description: 'ID of the vinyl record' })
  @ApiResponse({ status: 200, description: 'Vinyl record updated successfully' })
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVinylDto: UpdateVinylDto) {
    try {
      controllerLogger.log(`Updating vinyl record by ID: ${id}`);
      const updatedVinyl = await this.vinylService.update(id, updateVinylDto);
      systemLogger.log(`Vinyl record updated: ${updatedVinyl.name}`);
      return { statusCode: HttpStatus.OK, message: 'Vinyl record updated successfully', data: updatedVinyl };
    } catch (error) {
      controllerLogger.error(`Failed to update vinyl record by ID: ${id}`, error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Delete a vinyl record by ID (Admin Role Required)' })
  @ApiParam({ name: 'id', description: 'ID of the vinyl record' })
  @ApiResponse({ status: 204, description: 'Vinyl record deleted successfully' })
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      controllerLogger.log(`Deleting vinyl record by ID: ${id}`);
      await this.vinylService.remove(id);
      systemLogger.log(`Vinyl record deleted: ${id}`);
      return { statusCode: HttpStatus.NO_CONTENT, message: 'Vinyl record deleted successfully' };
    } catch (error) {
      controllerLogger.error(`Failed to delete vinyl record by ID: ${id}`, error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

