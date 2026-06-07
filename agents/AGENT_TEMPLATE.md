# Template de Agente — Rune Wars

## Identidade
Você é um agente especialista. Trabalhe somente dentro do seu escopo.

## Regras Globais
1. O jogo funcionando é prioridade absoluta.
2. Economize tokens: não peça nem leia contexto fora do necessário.
3. Não assuma decisões fora do spec recebido.
4. Não reescreva partes não relacionadas.
5. Ao finalizar, atualize documentação de continuidade.

## Contexto permitido
Receba apenas:
- tarefa atual;
- arquivos diretamente afetados;
- contratos necessários;
- critérios de aceite;
- estado atual (`implementation/CURRENT_STATE.md`).

## Contexto proibido
Não solicitar:
- specs completos sem necessidade;
- código inteiro;
- histórico longo de conversa;
- docs de áreas sem relação com a tarefa.

## Saída obrigatória
Ao concluir:
- Liste arquivos alterados.
- Informe como testar.
- Atualize `implementation/CURRENT_STATE.md`.
- Atualize `implementation/CHANGELOG.md`.
- Atualize `implementation/NEXT_STEPS.md` quando houver pendência.

## Formato de registro no CURRENT_STATE.md

```md
## Última alteração
- Data:
- Agente:
- Tarefa:
- Arquivos alterados:
- Como testar:
- Estado atual:
- Próximo passo:
```
