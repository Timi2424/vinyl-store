import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateVinylDto } from './dto/create-vinyl.dto';
import { UpdateVinylDto } from './dto/update-vinyl.dto';
import { Vinyl } from '../model/vinyl.model';
import { systemLogger } from '../utils/logger';
import { Review } from '../model/review.model';
import { Op } from 'sequelize';

@Injectable()
export class VinylService {
  async create(createVinylDto: CreateVinylDto): Promise<Vinyl> {
    try {
      const vinyl = await Vinyl.create(createVinylDto);
      systemLogger.log(`Vinyl record ${vinyl.id} created`);
      return vinyl;
    } catch (error) {
      systemLogger.error('Failed to create vinyl record', error);
      throw new InternalServerErrorException('Failed to create vinyl record');
    }
  }

  async getFullList(): Promise<
  {
    id: string;
    name: string;
    artist: string;
    description: string;
    price: number;
    image: string | null;
    averageRating: number | null;
    reviews: { content: string; rating: number }[];
  }[]
> {
  try {
    const vinyls = await Vinyl.findAll({
      include: [
        {
          model: Review,
          attributes: ['content', 'rating'],
          limit: 1,
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    return vinyls.map((vinyl) => ({
      id: vinyl.id,
      name: vinyl.name,
      artist: vinyl.artist,
      description: vinyl.description,
      price: vinyl.price,
      image: vinyl.image || null,
      averageRating:
        vinyl.reviews.reduce((sum, review) => sum + review.rating, 0) /
          (vinyl.reviews.length || 1),
      reviews: vinyl.reviews.map((review) => ({
          content: review.content,
          rating: review.rating,
        })),
      }));
  } catch (error) {
    systemLogger.error('Failed to fetch full vinyl list', error);
    throw new InternalServerErrorException('Failed to fetch full vinyl list');
  }
}

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    searchName?: string,
    searchArtist?: string,
    sortBy: 'price' | 'name' | 'artist' = 'name',
  ) {
    const offset = (page - 1) * pageSize;
    const where: any = {};

    if (searchName) where.name = { [Op.iLike]: `%${searchName}%` };
    if (searchArtist) where.artist = { [Op.iLike]: `%${searchArtist}%` };

    try {
      const { count, rows } = await Vinyl.findAndCountAll({
        where,
        include: [
          {
            model: Review,
            attributes: ['content', 'rating'],
            limit: 1,
            order: [['createdAt', 'ASC']],
          },
        ],
        offset,
        limit: pageSize,
        order: [[sortBy, 'ASC']],
      });

      const vinyls = rows.map((vinyl) => ({
        ...vinyl.get(),
        averageRating:
          vinyl.reviews.reduce((sum, review) => sum + review.rating, 0) /
          vinyl.reviews.length || null,
      }));

      return { data: vinyls, totalPages: Math.ceil(count / pageSize), page };
    } catch (error) {
      systemLogger.error('Failed to retrieve paginated vinyl records', error);
      throw new InternalServerErrorException('Failed to retrieve vinyl records');
    }
  }

  async findOne(id: string): Promise<Vinyl> {
    try {
      const vinyl = await Vinyl.findByPk(id, { include: { all: true } });
      if (!vinyl) {
        systemLogger.warn(`Vinyl record with id ${id} not found`);
        throw new NotFoundException(`Vinyl with id ${id} not found`);
      }
      return vinyl;
    } catch (error) {
      systemLogger.error(`Failed to retrieve vinyl with id ${id}`, error);
      throw error;
    }
  }
  

  async update(id: string, updateVinylDto: UpdateVinylDto): Promise<Vinyl> {
    const vinyl = await Vinyl.findByPk(id);
    if (!vinyl) {
      systemLogger.warn(`Vinyl record with id ${id} not found for update`);
      throw new NotFoundException(`Vinyl record with id ${id} not found`);
    }

    try {
      await vinyl.update(updateVinylDto);
      systemLogger.log(`Vinyl record with id ${id} updated`);
      return vinyl;
    } catch (error) {
      systemLogger.error(`Failed to update vinyl record with id ${id}`, error);
      throw new InternalServerErrorException(`Failed to update vinyl record with id ${id}`);
    }
  }

  async remove(id: string): Promise<void> {
    const vinyl = await Vinyl.findByPk(id);
    if (!vinyl) {
      systemLogger.warn(`Vinyl record with id ${id} not found for deletion`);
      throw new NotFoundException(`Vinyl record with id ${id} not found`);
    }

    try {
      await vinyl.destroy();
      systemLogger.log(`Vinyl record with id ${id} deleted`);
    } catch (error) {
      systemLogger.error(`Failed to delete vinyl record with id ${id}`, error);
      throw new InternalServerErrorException(`Failed to delete vinyl record with id ${id}`);
    }
  }
}
