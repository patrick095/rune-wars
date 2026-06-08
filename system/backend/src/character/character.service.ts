import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './character.entity';

@Injectable()
export class CharacterService {
  constructor(@InjectRepository(Character) private repo: Repository<Character>) {}

  async create(userId: string, dto: Partial<Character>) {
    const char = this.repo.create({ ...dto, user_id: userId });
    return this.repo.save(char);
  }

  async findByUser(userId: string) {
    return this.repo.find({ where: { user_id: userId } });
  }

  async findOne(id: string, userId: string) {
    const char = await this.repo.findOne({ where: { id, user_id: userId } });
    if (!char) throw new NotFoundException('Character not found');
    return char;
  }

  async update(id: string, userId: string, dto: Partial<Character>) {
    const char = await this.findOne(id, userId);
    Object.assign(char, dto);
    return this.repo.save(char);
  }
}
