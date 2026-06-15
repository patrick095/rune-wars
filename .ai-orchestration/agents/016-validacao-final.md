# Sub-spec — Agent 016: Validação Final (TypeCheck + Build)

## Objetivo
Rodar typecheck e build de produção em backend e frontend. Identificar e corrigir erros de tipo ou build. Este agente é o gatekeeper final — a implementação só está completa quando este agente retorna sem erros.

## O que pode fazer
- Corrigir erros de TypeScript em qualquer arquivo do projeto
- Instalar dependências faltando (ex: `@types/sharp`)
- Ajustar imports incorretos

## O que NÃO deve fazer
- Adicionar features novas
- Refatorar lógica além do necessário para corrigir erros de tipo

## Comandos obrigatórios a executar

```bash
# Backend
cd system/backend && npm install && npm run build

# Frontend
cd system/frontend && npm install && npm run build
```

## Dependências obrigatórias
- Todos os agentes 001–015 concluídos

## Critérios de aceite
- [ ] `npm run build` no backend: zero erros
- [ ] `npm run build` no frontend: zero erros
- [ ] `sharp` instalado com sucesso (ou fallback documentado)
- [ ] Nenhum import de Phaser em arquivos do backend

## Instrução para execução

```
Você é um engenheiro de QA/DevOps TypeScript no projeto Rune Wars.

Sua tarefa é validar que o backend e frontend compilam sem erros após a implementação do v1.8.0.

1. Rode no backend:
   cd system/backend && npm install && npm run build
   
2. Se houver erros, corrija-os (erros de tipo, imports incorretos, etc.)
3. Rode no frontend:
   cd system/frontend && npm install && npm run build
   
4. Se houver erros, corrija-os.
5. Rode novamente até ter zero erros nos dois.

Documente TODOS os erros encontrados e como foram resolvidos.

ATENÇÃO: Não adicione lógica nova. Apenas corrija erros de compilação.

Resumo final:
# Resumo — Agent 016: Validação Final
## Status
## Build backend: passou? Erros encontrados e corrigidos?
## Build frontend: passou? Erros encontrados e corrigidos?
## Arquivos alterados (para correções)
## Riscos pendentes
## Recomendações para testes manuais
```

## Memory — Agent 016

### Objetivo
Typecheck + build backend + frontend. Corrigir erros de compilação.

### Arquivos autorizados
- QUALQUER arquivo (apenas para corrigir erros de tipo/import — sem adicionar lógica)

### Dependências
- Todos os agentes 001–015

### Critérios de aceite
- npm run build: zero erros em backend e frontend
