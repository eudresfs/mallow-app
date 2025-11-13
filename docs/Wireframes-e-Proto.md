# Wireframes e Protótipos (Low-fi)

## Login
- Layout
  - Cabeçalho com logotipo e saudação.
  - Botão Google (primário secundário): `bg-card border-border h-14`.
  - Inputs (email/senha): `bg-white border-border h-14` com ícone à esquerda.
  - CTA principal: `bg-primary-DEFAULT h-14` com `text-white font-bold`.
- Acessibilidade
  - `accessibilityLabel` para botões e inputs.
  - `accessibilityHint` descrevendo ação (ex.: "Entra na sua conta").
  - Áreas de toque ≥ 44x44.

## Produtos (Lista)
- Layout
  - Barra de busca: `h-12 bg-white border-border` com ícone e `TextInput`.
  - Cards: `bg-card p-4 border-border shadow-sm` com título e preço.
  - FAB: `h-16 w-16 bg-primary-DEFAULT rounded-full`.
- Performance
  - `FlatList` com `initialNumToRender`, `windowSize`, `removeClippedSubviews`.
  - Item memoizado.

## Fluxo Novo Produto (3 passos)
- Passo 1
  - Detalhes: `FormField` padronizado com tokens; barra de progresso (33%).
- Passo 2/3
  - Insumos e custos; validações e feedback.
- CTA próximo: consistente com `bg-primary-DEFAULT`.

