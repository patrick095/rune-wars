# Decisões da Implementação

| Data | Decisão | Motivo | Impacto |
|------|---------|--------|---------|
| 2026-06-07 | Angular 17+ standalone components | README indica Angular + Phaser; standalone é o padrão atual | Todos os agentes de frontend |
| 2026-06-07 | Phaser 3.x como módulo Angular | Spec v0.1.0 exige PhaserContainerComponent | Agentes 002, 004, 006, 008, 012, 014, 016, 017 |
| 2026-06-07 | Lógica de jogo em TypeScript puro (game-core) | Specs v0.2.0–v0.8.0 explicitam desacoplamento do Phaser | Permite compartilhamento backend/frontend na v0.9.0 |
| 2026-06-07 | NestJS como backend (v0.9.0+) | Spec v0.9.0 especifica explicitamente | Agentes 019, 020, 023–030 |
| 2026-06-07 | TypeORM + PostgreSQL + Redis | Spec v0.9.0 + v1.0.0 especificam | Agente 018 (devops), 019 (backend) |
| 2026-06-07 | Docker obrigatório para todo stack | README exige docker-compose para tudo | Agente 001 (v0.1.0) já cria base; 018 expande |
| 2026-06-07 | Deletar vX.Y.Z.md após cada versão | Instrução do usuário: remover sem confirmação | Cada agente de consolidação de versão |
| 2026-06-07 | 32 agentes com escopo mínimo | Economia de tokens; cada agente lê apenas o necessário | Toda a orquestração |
| 2026-06-07 | localStorage para dados locais v0.1.0–v0.8.0 | Sem backend até v0.9.0 | Agentes 010, 017 |
| 2026-06-07 | Célula de terreno 8×8px, mapa 100×40 células | Spec v0.3.0 sugere esse tamanho | Agentes 005, 006, 013 |
