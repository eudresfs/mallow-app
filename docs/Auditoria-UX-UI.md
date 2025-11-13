# Auditoria Abrangente de UX/UI e Design – Mallow App

## 1. Análise de Contexto
- Arquitetura de navegação: `expo-router` com grupos `(tabs)` e `(auth)` e `Stack` raiz em `app/_layout.tsx:11-14`.
- Provedores globais: `UserProvider` e `ProductFormProvider` aplicados em `app/_layout.tsx:20-25`. O `AuthProvider` não está presente.
- Fluxos principais mapeados:
  - Onboarding/Home: `app/(tabs)/index.tsx:65-98` com cartões de ação e atividade recente.
  - Listagem e CRUD de Produtos: `app/(tabs)/produtos.tsx:114-166` e fluxo multi-step em `app/produtos/novo.tsx:95-146`.
  - Autenticação: telas em `app/(auth)/sign-in.tsx:13-103` e `app/(auth)/sign-up.tsx` (não analisada em detalhe).

### Pontos de Atrito Identificados
- Crítico: Uso de `useAuth` sem `AuthProvider` no escopo de navegação. Tela de login chama `useAuth` (`app/(auth)/sign-in.tsx:15-16`) enquanto o provider não é aplicado em `app/_layout.tsx` nem em `app/(auth)/_layout.tsx:4-11`. Isso causa erro e impede login.
- Alto: Inconsistência de tema e tokens. O design system define cores em `global.css:6-26` (ex.: `--color-primary: #8A2BE2`), porém várias telas usam cores hardcoded como `#E73587`, `fuchsia-500`, `purple-600` (`app/(auth)/sign-in.tsx:27-28,85-96`; `app/(tabs)/produtos.tsx:50-53,159-163`).
- Médio: Mistura de abordagens de estilo (Uniwind + StyleSheet). Componente `components/themed-text.tsx:36-60` usa `StyleSheet.create`, destoando da padronização via classes Uniwind.
- Médio: Acessibilidade limitada. Inputs e botões sem `accessibilityLabel`/`accessibilityHint`; possíveis alvos de toque menores que 44x44 (ex.: ícones com `className="p-2"` em `app/produtos/novo.tsx:101-104`). Contraste de texto cinza em fundo branco precisa verificação sistemática.
- Médio: Performance visual não otimizada. `FlatList` sem ajustes de janela/inicialização (`app/(tabs)/produtos.tsx:142-153`); imagens não usam `expo-image` com cache; alguns layouts aplicam `ScrollView` sem `contentInsetAdjustmentBehavior`.

## 2. Avaliação de Interface
- Consistência visual:
  - Positivo: Uso de classes Uniwind como `bg-card`, `text-muted-foreground`, `bg-secondary-DEFAULT` (ex.: `app/(tabs)/index.tsx:28-35,83-91`).
  - Negativo: Paleta fora da especificação em telas de autenticação e produtos; `tabBarStyle` com cores inline (`app/(tabs)/_layout.tsx:9-17`) em vez de tokens (`bg-card`, `border-border`).
- Acessibilidade (WCAG 2.1):
  - Tamanho de toque: Botões principais atendem (ex.: `h-14` em `app/produtos/novo.tsx:45-51`), mas ícones isolados podem não atender.
  - Labels e hints: Ausentes na maioria das ações; dificultam leitores de tela.
  - Contraste: Verificar combinações `text-gray-500`/`bg-white`; tokens `--color-muted-foreground` podem ser ajustados para contraste AA.
- Performance visual e carregamento:
  - Estados de loading visíveis (ex.: `ActivityIndicator` com cor primária em `app/(tabs)/index.tsx:58-61`).
  - Listas: Falta configuração de `initialNumToRender`, `windowSize`, `removeClippedSubviews`.
  - Imagens: Recomendar `expo-image` com `cachePolicy` e `placeholder`.

## 3. Documentação de Referência (Uniwind)
- Conformidades:
  - `global.css` com `@import 'tailwindcss'` e `@import 'uniwind'` conforme Uniwind (Doc 10/11). Presença de variantes `light`/`dark` com tokens (`global.css:6-26`).
  - `metro.config.js` com `withUniwindConfig` e `cssEntryFile` corretamente setado (`metro.config.js:6-9`).
- Divergências vs recomendações oficiais:
  - Uso parcial de tokens; cores hardcoded contrariam a centralização de tema.
  - Ausência de `withUniwind` para componentes de terceiros quando necessário (Doc 15/17). Não crítico, mas recomendável para performance/ergonomia.
  - Mistura de StyleSheet com classes Uniwind; Doc incentiva foco em utilitários Tailwind/Uniwind.

## 4. Problemas por Gravidade
- Crítico
  - Falta de `AuthProvider` no escopo de navegação causando quebra do fluxo de autenticação.
- Alto
  - Inconsistência de paleta e tokens em múltiplas telas (autenticação, produtos, tabs).
- Médio
  - Acessibilidade: ausência de `accessibilityLabel`/`accessibilityHint`; alvos < 44x44 em ícones; contraste potencial.
  - Performance: `FlatList` sem tuning; imagens sem cache otimizado.
- Baixo
  - `tabBarStyle` com objetos inline em vez de classes resolvidas via Uniwind.

## 5. Recomendações Específicas
- Navegação e Autenticação
  - Aplicar `AuthProvider` em `app/_layout.tsx` envolvendo `RootLayoutNav` para habilitar `useAuth` nas telas (referência: `context/AuthContext.tsx:16-70`).
- Design System e Estilo
  - Substituir cores hardcoded por classes baseadas em tokens: `bg-primary-DEFAULT`, `text-primary-DEFAULT`, `bg-card`, `border-border`, `text-muted-foreground`.
  - Refatorar `ThemedText` e similares para classes Uniwind, removendo `StyleSheet.create` e adotando utilitários (`text-base`, `font-semibold`, `text-2xl`).
  - Usar classes nos headers de tabs via `useResolveClassNames` ou padronizar estilo com tokens.
- Acessibilidade
  - Adicionar `accessibilityLabel`, `accessibilityHint`, `accessibilityRole` (`button`, `text`) nos principais `TouchableOpacity` e inputs.
  - Garantir áreas de toque mínimas 44x44; quando ícones forem menores, envolver em container com `h-11 w-11` e `items-center justify-center`.
  - Revisar contraste com testes AA; ajustar `--color-muted-foreground` se necessário.
- Performance
  - Configurar `FlatList`: `initialNumToRender`, `windowSize`, `removeClippedSubviews`, `getItemLayout` quando possível.
  - Utilizar `expo-image` com `contentFit="cover"`, `cachePolicy="disk"` e placeholders.
  - Memoizar item de lista com `React.memo` quando render for caro.
- Integração Uniwind
  - Avaliar `withUniwind` para componentes específicos de terceiros, conforme Doc (e.g., integração com navegação para estilos de cartão).
  - Manter `global.css` como fonte única de tokens; considerar fonte tipográfica via `expo-font` conforme Doc 25.

## 6. Wireframes/Protótipos (Low-fi)
- Tela de Login (padronizada com primária `#8A2BE2`)
  - Cabeçalho: Logotipo centrado, `text-2xl font-bold text-gray-800`.
  - Botão Google: `bg-card border border-border rounded-lg h-14` com ícone e label acessível.
  - Inputs: containers `bg-white border border-border rounded-lg h-14` com ícones à esquerda, `accessibilityLabel` e `aria-hidden` nos ícones.
  - CTA: `bg-primary-DEFAULT h-14 rounded-lg` com `text-white font-bold`.
- Produtos (Lista)
  - Barra de busca: `bg-white border border-border rounded-lg h-12` com ícone e `TextInput` acessível.
  - Card: `bg-card p-4 rounded-lg shadow-sm border border-border` com título e preço em `text-gray-800` e `text-primary-DEFAULT`.
  - FAB: `bg-primary-DEFAULT h-16 w-16 rounded-full` com `Plus` e `accessibilityLabel="Adicionar produto"`.

## 7. Métricas de Usabilidade (antes/depois)
- Propostas de coleta:
  - Taxa de sucesso no login (sem erros de contexto) – alvo > 95%.
  - Tempo para cadastrar produto (P95) – alvo < 60s.
  - Erros de validação por sessão – redução > 30%.
  - SUS (System Usability Scale) – alvo ≥ 80.

## 8. Validação (Testes com Usuários)
- Plano de teste com 5 participantes representativos:
  - Tarefas: login, cadastrar insumo, cadastrar produto, editar produto.
  - Coleta: tempo, taxa de sucesso, observações qualitativas, gravação de problemas.
  - Instrumentos: questionário SUS, checklist de acessibilidade.
- Estado: Não executado neste ambiente. Entrega inclui protocolo e templates para execução assíncrona pela equipe.

## 9. Plano de Implementação Priorizado
- P0 (Crítico)
  - Incluir `AuthProvider` no layout raiz; testar fluxo de login.
- P1 (Alto)
  - Padronização de paleta/tokens em todas as telas; remover cores hardcoded.
  - Refatoração de `ThemedText` e adoção consistente de classes Uniwind.
- P2 (Médio)
  - Acessibilidade: labels, hints, roles, áreas de toque ≥ 44x44; revisão de contraste.
- P3 (Médio)
  - Performance: tuning de `FlatList`, adoção de `expo-image` com cache; memoização.
- P4 (Baixo)
  - Ergonomia visual da `tabBar` via classes resolvidas.

## 10. Referências
- Uniwind Quickstart e Global CSS (Docs 10/11/18).
- `withUniwind` e integração com terceiros (Docs 15/17/23).
- WCAG 2.1 – Critérios de sucesso para toque e contraste.

