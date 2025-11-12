# Lógica de Negócio e Fórmulas – Mallow

## Objetivo
Padronizar o cálculo de custos e preços no Mallow para garantir consistência e transparência.  Estas regras são a referência para implementação e testes do app.

## Clarificações

### Session 2025-01-27

- Q: A fórmula genérica de overhead na linha 95 deve ser interpretada como exemplo apenas para estratégia 1 ou como fórmula universal? → A: A fórmula na linha 95 é apenas um exemplo para estratégia 1. Cada estratégia usa sua fórmula específica (linhas 43, 58, 70). A seção "Cálculo do Produto" foi atualizada para indicar que `custo_overhead_produto` varia conforme a estratégia.
- Q: Quantas casas decimais devem ser usadas nos cálculos internos antes do arredondamento final? → A: Precisão de ponto flutuante (double) para cálculos internos, arredondando apenas na exibição para evitar perda de precisão em cálculos intermediários.

## Conversão de Unidades
Ao cadastrar um insumo, o app converte a quantidade para a **menor unidade** e considera o tamanho da embalagem.

- **Massa**: `kg → g` (quilogramas para gramas)
- **Volume**: `L → ml` (litros para mililitros)
- **Unidade**: permanece `un` (peça ou item)

Muitos ingredientes são comprados em **pacotes ou caixas** com várias unidades ou com uma determinada quantidade.  Para lidar com isso, o campo `quantidade_por_embalagem` informa quantas unidades ou gramas há em cada embalagem.  Por exemplo, uma caixa com 12 latas de leite condensado de 395 g possui `quantidade_compra = 12` e `quantidade_por_embalagem = 395 g`, resultando em `quantidade_base_total = 12 × 395 g = 4 740 g`.

Campos derivados armazenados:

- `quantidade_base_total` = `quantidade_compra × quantidade_por_embalagem` (convertida para a unidade base); se `quantidade_por_embalagem` não for informado, assume‑se que a embalagem tem 1 unidade ou que a quantidade já está em gramas/mililitros.
- `custo_por_unidade_base` = `preco_compra / quantidade_base_total`.

A conversão é automática e transparente, mas auditável: a usuária pode ver quanto custa cada grama, mililitro ou unidade, considerando a embalagem.

## Custo de Insumo Usado
Para um produto que utiliza um determinado insumo:

```
custo_insumo_usado = quantidade_usada * custo_por_unidade_base
```

Restrições:
- `quantidade_usada` deve ser maior que zero.
- O insumo deve estar cadastrado com preço válido.

## Custos Fixos (Overhead)
Os custos fixos (hora de trabalho, energia, aluguel, embalagens, taxas de plataforma, etc.) são configurados pela usuária de forma centralizada.  Estes custos precisam ser **rateados** entre os produtos vendidos para que o lucro reflita a realidade.  O Mallow oferece **três estratégias de rateio**, e a usuária escolhe aquela que mais faz sentido para seu negócio:

### 1. Rateio por faturamento estimado

Esta é a estratégia padrão, usada originalmente na primeira versão.  A confeiteira informa uma **estimativa de faturamento mensal** (em reais), e o app calcula um percentual de overhead dividindo a soma dos custos fixos pelo faturamento.  Esse percentual é então aplicado sobre o custo total dos insumos de cada produto.

```
custo_fixos_totais = soma(CustoGlobal.ativo.valor)
overhead_percentual = custo_fixos_totais / estimativa_faturamento_mensal
custo_overhead_produto = custo_insumos_total × overhead_percentual
```

**Quando usar:** quando a usuária tem noção de quanto vende por mês ou quer aproximar seus custos a partir de uma meta de faturamento.

**Limitações:** MEIs iniciantes podem não saber estimar o faturamento.  Se a estimativa for zero ou não informada, o app não aplica overhead (`overhead_percentual = 0`) e sugere configurar essa informação mais tarde.

### 2. Rateio por hora de trabalho

Nesta abordagem, a usuária informa quantas **horas por mês** dedica ao negócio e qual o valor de sua **hora de trabalho**.  O app calcula um custo por hora, e depois multiplica pelo tempo de produção de cada produto.  Assim, cada receita recebe uma parcela do custo fixo proporcional ao tempo gasto.

```
total_horas_trabalhadas = soma das horas dedicadas por mês
custo_total_trabalho = valor_da_hora × total_horas_trabalhadas
overhead_hora = custo_total_trabalho / total_horas_trabalhadas = valor_da_hora
custo_overhead_produto = tempo_producao_produto × valor_da_hora
```

**Quando usar:** quando é mais fácil estimar o tempo de produção do que o faturamento.  Para cada produto, a usuária deve informar a duração média da produção (em horas ou frações).

### 3. Rateio por produção/lote

Nesta estratégia, a usuária distribui os custos fixos igualmente entre todos os produtos produzidos em um período.  Ela informa quantas receitas (lotes) faz por mês e o valor total de custos fixos.  O app divide o custo fixo pelo número de lotes e adiciona esse valor ao custo de cada produto.

```
custo_fixos_totais = soma(CustoGlobal.ativo.valor)
numero_lotes_mes = total de receitas produzidas no mês
custo_overhead_produto = custo_fixos_totais / numero_lotes_mes
```

**Quando usar:** quando a usuária produz volumes semelhantes de receitas ao longo do mês, ou quando não consegue estimar faturamento ou horas trabalhadas.

### Escolha e transparência

A configuração de custos fixos permite selecionar uma destas estratégias e ajustar os parâmetros necessários (faturamento estimado, valor da hora, tempo de produção ou número de lotes).  O app sempre mostra como o overhead foi calculado, para que a usuária entenda de onde vem cada centavo no preço final.

## Cálculo do Produto

Dados de entrada:

- `insumos[]` com `quantidade_usada` e `custo_por_unidade_base`.
- `overhead_percentual` calculado (ou `custo_overhead_produto` conforme estratégia).
- `margem_lucro` (%).
- `rendimento` (quantas unidades o produto rende).
- `preco_manual` (opcional).

Fórmulas:

1. **Custo total**

```
custo_insumos_total = soma(quantidade_usada * custo_por_unidade_base)
```

**Nota sobre overhead**: O cálculo de `custo_overhead_produto` varia conforme a estratégia de overhead selecionada:
- **Estratégia 1 (Faturamento estimado)**: `custo_overhead_produto = custo_insumos_total * overhead_percentual` (conforme linha 43)
- **Estratégia 2 (Hora de trabalho)**: `custo_overhead_produto = tempo_producao * valor_da_hora` (conforme linha 58)
- **Estratégia 3 (Produção/lote)**: `custo_overhead_produto = custo_fixos_totais / numero_lotes_mes` (conforme linha 70)

```
custo_total = custo_insumos_total + custo_overhead_produto
```

2. **Preço mínimo**

```
preco_minimo = custo_total
```

3. **Preço sugerido com margem**

```
preco_sugerido = custo_total * (1 + margem_lucro / 100)
```

4. **Preço unitário sugerido**

```
preco_unitario_sugerido = preco_sugerido / rendimento
```

5. **Margem efetiva (com preço manual)**

Se a usuária informar um preço manual (`preco_manual`):

```
margem_efetiva = ((preco_manual - custo_total) / custo_total) * 100
preco_unitario_manual = preco_manual / rendimento
```

## Arredondamentos
- Todos os valores exibidos ao usuário são arredondados para duas casas decimais.
- Os cálculos internos usam precisão de ponto flutuante (double) para evitar perda de precisão em cálculos intermediários; o arredondamento só ocorre na apresentação.
- Utiliza‑se o arredondamento financeiro (meio para cima).

## Casos Especiais
- **Rendimento ≤ 0**: impedir o cálculo e solicitar correção.
- **Margem negativa**: bloquear e avisar.
- **Preço manual < custo total**: destacar que há prejuízo.
- **Preço ou quantidade de insumo ≤ 0**: impedir o cadastro.
- **Overhead > 0 sem estimativa de faturamento**: ignorar overhead e exibir sugestão para configurar a estimativa.

## Exemplos Numéricos

### Exemplo 1 — Sem overhead
**Insumo**: 1 kg de chocolate por R$ 40,00 (`custo_por_g = 40 / 1000 = 0,04`).  
**Produto**: usa 250 g de chocolate, margem de 30% e rende 10 fatias.

```
custo_insumos_total = 250 * 0,04 = R$ 10,00
custo_overhead = 0
custo_total = R$ 10,00
preco_sugerido = 10,00 * 1,30 = R$ 13,00
preco_unitario_sugerido = 13,00 / 10 = R$ 1,30
```

### Exemplo 2 — Com overhead
Usando os mesmos dados, mas com custos fixos totais de R$ 600/mês e estimativa de faturamento de R$ 3.000:

```
overhead_percentual = 600 / 3000 = 0,20
custo_overhead_produto = 10,00 * 0,20 = R$ 2,00
custo_total = 10,00 + 2,00 = R$ 12,00
preco_sugerido = 12,00 * 1,30 = R$ 15,60
preco_unitario_sugerido = 15,60 / 10 = R$ 1,56
```

Se a usuária definir `preco_manual = 14,00`:

```
margem_efetiva = (14,00 - 12,00) / 12,00 * 100 = 16,67%
preco_unitario_manual = 14,00 / 10 = R$ 1,40
```

O app informa que a margem efetiva é inferior à margem desejada (30%), embora ainda seja positiva.