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

  // -------------------------------------------------------------------------
  // Legado (deprecated — mantido para compatibilidade)
  // -------------------------------------------------------------------------

  /** @deprecated */
  @Get('recipes')
  getRecipes() {
    return this.service.getAllRecipes();
  }

  /** @deprecated */
  @Post('attempt')
  craft(@Body() body: { characterId: string; recipeId: string; luck: number }) {
    return this.service.craft(body.characterId, body.recipeId, body.luck ?? 0);
  }

  // -------------------------------------------------------------------------
  // v1.8.0 — Novos endpoints
  // -------------------------------------------------------------------------

  /**
   * Combina 3 fragmentos do mesmo tipo/raridade para obter 1 item de raridade superior.
   * Body: { characterId: string, fragmentInstanceIds: [string, string, string] }
   */
  @Post('combine')
  combine(@Body() body: { characterId: string; fragmentInstanceIds: [string, string, string] }) {
    return this.service.combine(body.characterId, body.fragmentInstanceIds);
  }

  /**
   * Desmonta um item de equipamento e tenta gerar 1 fragmento da mesma categoria.
   * Body: { characterId: string, itemInstanceId: string }
   */
  @Post('dismantle')
  dismantle(@Body() body: { characterId: string; itemInstanceId: string }) {
    return this.service.dismantle(body.characterId, body.itemInstanceId);
  }
}
