import { Controller, Get, Post, Body, UseGuards, OnModuleInit } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CraftService } from './craft.service';

@Controller('craft')
@UseGuards(JwtAuthGuard)
export class CraftController implements OnModuleInit {
  constructor(private service: CraftService) {}

  async onModuleInit() {
    await this.service.seed();
  }

  @Get('recipes')
  getRecipes() {
    return this.service.getAllRecipes();
  }

  @Post('attempt')
  craft(@Body() body: { characterId: string; recipeId: string; luck: number }) {
    return this.service.craft(body.characterId, body.recipeId, body.luck ?? 0);
  }

  @Post('dismantle')
  dismantle(@Body() body: { itemRarity: string; luck: number }) {
    return this.service.dismantle(body.itemRarity, body.luck ?? 0);
  }
}
