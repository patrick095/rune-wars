# Como Jogar — Rune Wars v1.2.0 (Beta)

## Pré-requisitos
- Node.js 20+
- PostgreSQL rodando (para o backend)

## Iniciar o projeto

**Backend:**
```bash
cd system/backend
npm install
npm run start:dev
```

**Frontend:**
```bash
cd system/frontend
npm install
ng serve
```

Acesse: `http://localhost:4200`

---

## O que testar na v1.2.0

### Barra de Força
- Vá para `/playground` ou entre em uma batalha PvP
- Pressione e **segure** o botão de disparo (mouse ou ESPAÇO)
- A barra de força deve crescer visualmente em tempo real
- Solte para disparar com a força acumulada
- Cores: verde (fraco) → laranja (médio) → vermelho (máximo)

### Ghost Trace (Linha do Último Tiro)
- Após disparar, uma linha pontilhada branca indica a trajetória do projétil
- A linha desaparece no início do seu próximo turno

### Inventário
- Vá para `/character`
- Clique na aba **Inventário**
- Arraste itens entre os 36 slots do grid 6×6
- Arraste itens para os slots de equipamento ao lado da silhueta do personagem

### Cofre
- Na tela de personagem, clique na aba **Cofre**
- O cofre tem 60 slots (6×10) compartilhados entre todos os seus personagens
- **Depositar item/gold:** gratuito
- **Retirar item:** custa 100 gold
- **Retirar gold:** custa 3% do valor retirado

### Mapas de Batalha
Ao entrar em uma partida, você pode escolher entre 5 mapas:
- **Castle** — clássico com castelo
- **Plains** — campo aberto
- **Deep Mines** — minas verticais com pilares e terra escavável
- **Arcane Ruins** — plataformas escalonadas com colunas mágicas
- **Runic Forest** — floresta aberta com árvores e raízes

### Navegação no Hub
- Os POIs do hub (Academia, PvP, Dungeon, etc.) agora abrem como overlay
- O canvas do hub **não recarrega** ao abrir/fechar telas
- Pressione **ESC** para fechar qualquer overlay

### Desktop = Playground
- Os controles de teclado são idênticos em `/playground`, `/dungeon` e batalhas
- **Setas esquerda/direita:** mover personagem
- **Setas cima/baixo:** ajustar ângulo de tiro
- **ESPAÇO segurado:** carregar força; **soltar:** disparar

---

## Bugs conhecidos
- Assets visuais são placeholders (1×1px) — as imagens reais serão geradas com IA de imagem
- O budget de CSS gera warnings no console (não afeta funcionalidade)
- `characterGold` no cofre mostra 0 até integração completa com o perfil do personagem

## Reportar bugs
Descreva o que aconteceu, em qual tela, e qual era o comportamento esperado.
