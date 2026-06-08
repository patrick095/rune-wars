import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private jwt: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');
    const password_hash = await bcrypt.hash(password, 10);
    const user = this.users.create({ email, password_hash });
    await this.users.save(user);
    return this.sign(user);
  }

  async login(email: string, password: string) {
    const user = await this.users.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.sign(user);
  }

  private sign(user: User) {
    return {
      access_token: this.jwt.sign({ sub: user.id, email: user.email }),
      user_id: user.id,
    };
  }
}
