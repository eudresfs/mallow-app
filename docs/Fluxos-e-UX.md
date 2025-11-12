# Blueprint de Fluxos e UX – Mallow

## Estrutura de Navegação

| Seção                 | Propósito                                     | Tipo de Navegação |
|------------------------|-----------------------------------------------|-------------------|
| **Onboarding/Login**  | Entrada, cadastro e login social               | Stack             |
| **Home**              | Painel com métricas rápidas e atalhos          | Tab inferior      |
| **Insumos**           | Cadastro e gestão de insumos                   | Tab inferior      |
| **Produtos**          | Criação e cálculo de produtos                  | Tab inferior      |
| **Custos**            | Configuração de custos fixos                   | Tab inferior      |
| **Perfil**            | Conta e preferências da usuária                | Modal ou Tab      |

## Mapa de Navegação

```mermaid
flowchart LR
    A[Onboarding/Login] --> B[Home]
    B --> C[Insumos]
    B --> D[Produtos]
    B --> E[Custos Fixos]
    B --> F[Perfil]
    C --> C1[Novo Insumo]
    D --> D1[Novo Produto]
    D --> D2[Detalhe do Produto]
    F --> F1[Editar Conta]
```

## Jornadas Principais

### 1. Onboarding e Login

```mermaid
sequenceDiagram
    participant U as Usuária
    participant APP as Mallow
    U->>APP: Abre o app
    APP-->>U: Tela de boas‑vindas e opções de login
    U->>APP: Seleciona e‑mail/senha ou Google
    APP->>APP: Valida ou cria conta local
    APP-->>U: Acesso liberado → Home
```

**Comportamento**: frases positivas, destaque para login Google, opção de modo visitante offline.

### 2. Cadastro de Insumo

```mermaid
sequenceDiagram
    participant U as Usuária
    participant APP as Mallow
    U->>APP: Acessa Insumos
    APP-->>U: Lista ou mensagem de vazio
    U->>APP: Clica em "Novo Insumo"
    APP-->>U: Formulário (nome, categoria, unidade, quantidade, preço, data)
    U->>APP: Preenche e confirma
    APP->>APP: Converte unidades para base
    APP->>DB: Salva localmente
    APP-->>U: Mostra insumo cadastrado
```

**Regras UX**:
- Campos opcionais (fornecedor, observações) recolhidos por padrão.
- Mostrar custo unitário calculado após salvar.
- Mensagens de erro específicas para valores inválidos.

### 3. Configuração de Custos Fixos

```mermaid
sequenceDiagram
    participant U as Usuária
    participant APP as Mallow
    U->>APP: Entra em Custos
    APP-->>U: Lista de custos atuais
    U->>APP: Adiciona ou edita custo
    APP->>DB: Salva custo e recalcula overhead
    APP-->>U: Atualiza lista e mostra novo percentual
```

### 4. Criação de Produto e Cálculo

```mermaid
sequenceDiagram
    participant U as Usuária
    participant APP as Mallow
    U->>APP: Acessa Produtos
    APP-->>U: Lista ou CTA “Cadastre seu primeiro doce”
    U->>APP: Cria produto (nome, rendimento, margem)
    U->>APP: Seleciona insumos e quantidades
    U->>APP: Seleciona custos fixos
    APP->>APP: Calcula custo e preço sugerido
    APP-->>U: Exibe resultados (custo total, preço mínimo, preço sugerido, preço unitário, margem efetiva)
```

**Exibição**:
- Valores de lucro em verde e prejuízo em vermelho.
- Botão “Explicar cálculo” abre tabela detalhada com insumos e custos.

### 5. Edição e Histórico

A usuária pode abrir produtos salvos, ajustar quantidades ou margens e ver o cálculo atualizado em tempo real.  Versões futuras poderão exibir histórico de revisões para cada produto.

## Estados Visuais

- **Vazio**: ícone do mascote Mallow e mensagem encorajadora (“Nada por aqui ainda 🍬”).
- **Erro**: balão vermelho discreto com texto específico (“Preço inválido”, “Campo obrigatório”).
- **Offline**: indicador discreto “Modo offline (dados locais)”.
- **Sucesso**: banner ou toast verde que desaparece após alguns segundos.

## Evolução de UX

| Versão | Novos recursos de UX                     |
|--------|------------------------------------------|
| **v2** | OCR para cadastrar insumos via foto; onboarding guiado por Mallow |
| **v3** | Relatórios comparativos; comunidade com feed de receitas |