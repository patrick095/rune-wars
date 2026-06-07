# 14 — Mapas, Terrenos e Biomas

## Decisão central

Todo mapa do Rune Wars deve conter terreno destrutível e terreno indestrutível.

O jogador precisa distinguir visualmente os dois tipos de terreno através de textura, cor, brilho e leitura clara.

## Terreno destrutível

Pode ser:

- Explodido.
- Escavado.
- Perfurado.
- Removido por armas.
- Modificado por efeitos.

Exemplos:

- Terra.
- Areia.
- Madeira.
- Gelo frágil.
- Rocha quebradiça.
- Cristal instável.

## Terreno indestrutível

Não pode ser removido por armas, TNT, escavação ou efeitos.

Serve para:

- Evitar que o mapa seja completamente destruído.
- Manter rotas permanentes.
- Garantir pontos estratégicos.
- Proteger o balanceamento competitivo.

Exemplos:

- Pedra rúnica.
- Cristal primordial.
- Metal ancestral.
- Núcleo mágico.
- Estruturas sagradas.

## Terreno criado por jogador

O Kit/Construtor Rúnico cria terreno especial:

- Não sofre gravidade.
- Pode formar linha seguindo a trajetória do projétil.
- Pode formar bloco fixo no primeiro ponto de impacto.
- Deve ter limite de quantidade ativa por jogador/equipe.
- Pode ser destruído mais facilmente que terreno natural, se necessário para balanceamento.

## PvP — 20 mapas iniciais

### Região 1 — Floresta Rúnica

1. Ponte Quebrada
   - Abismo central, ponte destrutível e pilares indestrutíveis.
   - Estratégia: construção, escavação e controle de travessia.

2. Vale dos Druidas
   - Terreno irregular e árvores destrutíveis.
   - Estratégia: cobertura e ângulos curtos.

3. Ruínas Antigas
   - Pilares rúnicos indestrutíveis.
   - Estratégia: precisão e boomerangue.

4. Floresta Profunda
   - Vários níveis de altura.
   - Estratégia: mobilidade, teleporte e arco.

### Região 2 — Montanhas

5. Pico Congelado
   - Plataformas pequenas e abismos.
   - Estratégia: knockback, construção e posicionamento.

6. Cânion dos Ventos
   - Vento forte e variável.
   - Estratégia: domínio de física das armas.

7. Mina Abandonada
   - Túneis naturais e áreas destrutíveis.
   - Estratégia: escavador e TNT.

8. Penhasco dos Gigantes
   - Diferença extrema de altura.
   - Estratégia: armas com trajetória alta e teleporte.

### Região 3 — Vulcânica

9. Cratera Escarlate
   - Lago de lava como zona perigosa.
   - Estratégia: empurrões e controle de queda.

10. Forja dos Titãs
    - Plataformas pequenas e estruturas metálicas indestrutíveis.
    - Estratégia: precisão e defesa.

11. Rio de Magma
    - Ilhas separadas por magma.
    - Estratégia: pontes rúnicas e mobilidade.

12. Templo Vulcânico
    - Estruturas ancestrais indestrutíveis.
    - Estratégia: combate em corredores e explosões.

### Região 4 — Deserto

13. Dunas Eternas
    - Muito terreno destrutível.
    - Estratégia: escavação agressiva.

14. Pirâmide Perdida
    - Salas, rampas e blocos indestrutíveis.
    - Estratégia: tiros indiretos.

15. Oásis Rúnico
    - Mapa equilibrado, ideal para competitivo.
    - Estratégia: leitura geral e adaptabilidade.

16. Vale das Tempestades
    - Vento muda muito entre turnos.
    - Estratégia: experiência com referências.

### Região 5 — Reino Celestial

17. Ilhas Flutuantes
    - Muitas quedas e plataformas isoladas.
    - Estratégia: teleporte e controle de terreno.

18. Ponte Celestial
    - Corredor central com laterais frágeis.
    - Estratégia: disputa de posição.

19. Jardim das Runas
    - Mapa simétrico competitivo.
    - Estratégia: PvP ranqueado balanceado.

20. Trono dos Céus
    - Arena final com múltiplos níveis.
    - Estratégia: domínio completo de mecânicas.

## Regras de design dos mapas PvP

Cada mapa deve ter:

- Pelo menos 30% de terreno destrutível.
- Pelo menos 10% de terreno indestrutível.
- Pontos de cobertura.
- Rotas alternativas ou possibilidade de criação de rotas.
- Boa leitura visual em telas mobile.
- Compatibilidade com 1v1, 2v2 e até 4v4 quando possível.

## Mapas de dungeon

Cada fase da dungeon deve ter mapa próprio, com temática, objetivo e leitura estratégica distinta. Os mapas podem reutilizar tilesets, mas devem alterar layout, objetivo e pontos destrutíveis/indestrutíveis.
