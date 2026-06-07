# 02 — Gameplay e Combate

## Core loop principal

1. Jogador entra no jogo.
2. Ajusta equipamentos, armas, consumíveis e build.
3. Participa de PvP, dungeon, eventos ou atividades sociais/econômicas.
4. Ganha XP, ouro, materiais, itens e recursos.
5. Melhora personagem, equipamentos, acessórios ou contribui com guilda.
6. Retorna ao combate com novas opções estratégicas.

## Combate por turnos

Cada jogador atua em seu turno.

Durante o turno, ele pode:

- Mover-se dentro do limite de mobilidade.
- Ajustar ângulo.
- Ajustar força.
- Usar arma principal.
- Usar item secundário.
- Usar consumível.
- Passar o turno.

## Física

Toda arma deve respeitar física própria.

Variáveis por arma:

- Peso do projétil
- Influência do vento
- Influência da gravidade
- Velocidade inicial
- Tipo de trajetória
- Área de impacto
- Poder de escavação
- Tipo de dano

Exemplos:

### Canhão

- Peso alto
- Pouca influência do vento
- Gravidade alta
- Grande área
- Boa escavação

### Arco

- Peso médio/baixo
- Influência média/alta do vento
- Trajetória mais limpa
- Bom alcance

### Boomerangue

- Trajetória curva
- Pode contornar barreiras
- Alta influência do vento

### TNT

- Muito peso
- Pouca influência do vento
- Grande explosão
- Forte destruição de terreno

## Vento

O vento muda a cada turno.

O vento influencia:

- Direção do projétil
- Força necessária
- Curva da trajetória
- Estratégia de tiro

Como o vento muda, referências anteriores podem não garantir acerto futuro.

## Dano

O dano considera:

- Dano da arma
- Força do jogador
- Tipo de dano
- Defesa física/mítica do alvo
- Distância do impacto ao alvo
- Resistências
- Efeito rúnico, quando ativado

Fórmula base conceitual:

```ts
const danoFinal =
  danoArma
  * multiplicadorForca
  * multiplicadorDistancia
  * reducaoDefesa
  * modificadores;
```

`multiplicadorDistancia` representa o quão próximo o tiro caiu do alvo.

Exemplo:

- Acerto direto: 1.0
- Muito próximo: 0.75
- Próximo: 0.5
- Raspando: 0.25
- Fora da área: 0

## Tipos de dano

### Dano físico

Relacionado a armas materiais, impacto, perfuração e explosões físicas.

### Dano mítico/mágico

Relacionado a magia, runas, livros, orbes, cajados e efeitos arcanos.

### Dano misto

Combina físico e mágico.

Exemplo:

- Canhão Rúnico: impacto físico + explosão mágica.
- Arco Arcano: flecha física + debuff mágico.

## Defesas

Armaduras podem possuir:

- Defesa física
- Defesa mágica/mítica

Exemplo:

### Armadura de Placas

- Alta defesa física
- Baixa defesa mágica

### Veste Arcana

- Baixa defesa física
- Alta defesa mágica

## Efeito rúnico no lugar de crítico

Rune Wars não usa crítico apenas como dano aumentado.

O crítico será chamado preferencialmente de:

- Efeito Rúnico
- Ativação Rúnica
- Proc Rúnico

A Sorte aumenta a chance de ativar o efeito rúnico da arma.

Cada arma pode ter um efeito diferente.

Exemplos:

- Cegueira por 1 turno.
- Sangramento: perde 5% de vida por 2 turnos.
- Imobilização por 1 ou 2 turnos.
- Sem mira: não vê ângulo por 2 turnos.
- Fraqueza: limita força do tiro em 40% por 2 turnos.
- Teleporte aleatório no mapa.
- Bloqueio de itens exceto arma por 1 turno.
- Vulnerabilidade: recebe mais dano por tempo limitado.

## Terreno destrutível

O terreno pode ser destruído por:

- Canhão
- TNT
- Armas explosivas
- Algumas magias
- Chefes
- Mecânicas de dungeon

Usos estratégicos:

- Derrubar inimigos
- Criar buracos
- Remover cobertura
- Abrir caminho
- Prender inimigos

## Terreno construtível

Existe um item secundário voltado para construção de terreno.

Ele pode criar:

### Linha Rúnica

O projétil gera terreno por onde passa.

Usos:

- Criar ponte
- Criar escada
- Criar cobertura
- Fechar passagem

### Bloco Rúnico

Ao tocar o primeiro ponto, cria um quadrado/bloco de tamanho fixo.

Usos:

- Tampar buraco
- Criar plataforma
- Proteger aliado

Regras:

- O terreno criado não sofre gravidade.
- Pode ser destruído.
- Deve ter limite de quantidade ativa para evitar abuso.

## Consumíveis

Cada partida permite levar apenas 3 consumíveis.

Regra geral:

> Todo consumível que precisa ser atirado consome o turno.

Consumíveis definidos:

### Teleporte

- Precisa atirar.
- Consome turno.
- Move o usuário para o ponto de impacto.

### Teleporte aliado

- Precisa atirar.
- Consome turno.
- Move um aliado para o ponto de impacto.

### Cura individual

- Cura instantânea.
- Só afeta o usuário.
- Não consome turno.

### Cura em massa

- Cura aliados.
- Cura menos que a individual.
- Consome turno.

### Mira / Disparo de Calibração

- Precisa atirar.
- Consome turno.
- Mostra referência de força/ângulo para acertar.
- Causa dano mínimo.
- Como o vento muda todo turno, não garante o próximo tiro.

### Gelo

- Precisa atirar.
- Consome turno.
- Imobiliza adversário por 1 turno.

### Invisibilidade

- Deixa invisível por 1 turno.
- Pode ser usada para reposicionamento e estratégia.

## Academia

A academia será o local de treino.

Objetivos:

- Ensinar física das armas.
- Treinar vento.
- Treinar força e ângulo.
- Testar consumíveis.
- Testar efeitos rúnicos.
- Ensinar escavação e construção.

Modos possíveis:

- Campo de tiro.
- Treino de vento.
- Treino de armas.
- Treino de dungeon.
- Desafios de precisão.
- Tutorial de PvP.
