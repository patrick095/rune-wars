# STATE

fase atual: execucao
tarefa atual: T1 - contratos v2 e estado de assets
ultima tarefa concluida: nenhuma
proxima tarefa: T1 - contratos v2 e estado de assets

## Analise

- Escopo: refatorar o pipeline visual Phaser para Asset Manifest v2, anchors por frame, renderer modular, perfis visuais de armas e integracao em BattleScene, AcademyScene e DungeonScene.
- Dependencias principais: contratos/manifest antes do renderer; renderer antes das cenas; assets/anchors antes do validador final; QA e documentacao apenas apos integracao.
- Arquivos de maior risco: `system/frontend/src/game/scenes/battle.scene.ts`, `system/frontend/src/game/assets/rune-wars-assets.ts`, manifests e assets em `system/frontend/src/assets/rune-wars`.
- Risco critico: o spec exige arte final de 33 frames por raca, mas o repo contem apenas `idle_0`/`battle_0`; decisao: criar placeholders tecnicos explicitos a partir dos assets atuais para fechar o contrato runtime, e registrar arte final como proximo passo.
- Risco importante: alterar origem de projetil pode mexer em gameplay; decisao: usar anchors apenas como origem visual, preservando fisica/dano/turnos atuais.
- Risco importante: AcademyScene e DungeonScene usam retangulos, nao `CharacterSprite`; integracao deve ser incremental e preservar controle/camera existentes.
- Decisao: manter `dwarf` como legado/fallback carregavel, fora das racas obrigatorias v1.9.0.
- Decisao: usar o estilo oficial Rune Wars: 2D HD cartoon fantasy, alto contraste, leitura rapida e efeitos contidos.
