# Apresentação Executiva – Auditoria UX/UI

## Principais Achados
- Quebra crítica no fluxo de autenticação por ausência de `AuthProvider`.
- Inconsistência de paleta e tokens (cores hardcoded em telas-chave).
- Acessibilidade insuficiente (labels/hints ausentes; possíveis alvos < 44x44; contraste a revisar).
- Oportunidades de performance em listas e imagens.

## Impacto no Produto
- Conversão e retenção impactadas pelo login quebrado.
- Percepção de qualidade visual reduzida pela inconsistência de cores.
- Inclusão limitada para usuários com leitores de tela ou baixa visão.
- Desempenho pode degradar em listas maiores sem otimizações.

## Quick Wins (2–5 dias)
- Adicionar `AuthProvider` ao layout raiz.
- Padronizar cores na tela de login e produtos com `bg/text/border` dos tokens.
- Incluir `accessibilityLabel`/`accessibilityHint` em CTAs e inputs principais.

## Próximos Passos
- P1: Refatoração de componentes para Uniwind (e remoção de `StyleSheet.create`).
- P2: Tuning de `FlatList` e adoção de `expo-image` com cache.
- P3: Rodada de testes de usabilidade (5 usuários) e ajustes.

## Métricas-Alvo
- Login: sucesso > 95%.
- SUS ≥ 80.
- Tempo de cadastro de produto P95 < 60s.
- Redução de erros de validação > 30%.

