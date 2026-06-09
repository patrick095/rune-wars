import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './character.entity';

@Injectable()
export class CharacterService {
  constructor(@InjectRepository(Character) private repo: Repository<Character>) {}

  async create(userId: string, dto: Partial<Character>) {
    const count = await this.repo.count({ where: { user_id: userId } });
    if (count >= 5) throw new BadRequestException('Limite de 5 personagens atingido');

    const exists = await this.repo.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException('Este nome já está em uso');

    const validRaces = ['human', 'dwarf', 'elf'];
    if (!dto.race || !validRaces.includes(dto.race)) throw new BadRequestException('Raça inválida');

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

  async delete(id: string, userId: string) {
    const char = await this.findOne(id, userId);
    return this.repo.remove(char);
  }
}
