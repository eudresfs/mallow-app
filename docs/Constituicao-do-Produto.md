# Constituição do Produto – Mallow

## Identidade e Propósito
**Nome**: Mallow (apelido de Marshmallow)  
**Tagline**: “Seu trabalho sempre no lucro.”

**Missão**  
Ajudar confeiteiras a nunca sair no prejuízo com suas vendas, valorizando o trabalho artesanal e simplificando o cálculo de preços.

**Propósito**  
Transformar o ato de precificar doces em algo tão simples quanto preparar uma receita.  Mallow dá às confeiteiras clareza sobre custos, tempo e margem de lucro, tornando seus negócios mais sustentáveis.

## Promessa de Valor
Sempre que a usuária utiliza o app, ela obtém:

- **Preço exato** de cada produto.
- **Segurança de lucro** e controle sobre custos.
- **Economia de tempo**, sem planilhas complexas.

Diferenciais: conveniência offline, histórico transparente e uma experiência acolhedora representada pelo mascote Mallow.

## Público e Linguagem
**Usuária típica**: Microempreendedora ou confeiteira autônoma (MEI), muitas vezes mãe e gestora do próprio negócio, buscando praticidade e confiança nos preços.  
**Tom de voz**: Amigável e acolhedor, com linguagem simples e direta.  
**Personalidade**: Representada por Mallow, um mascote kawaii gentil e motivador.  O visual usa ícones suaves e cores doces para acolher sem infantilizar.

## Princípios de Produto

| Princípio              | Aplicação                                                   |
|------------------------|--------------------------------------------------------------|
| **Lucro sempre visível** | Mostrar custo, margem e lucro em todas as telas.          |
| **Sem esforço cognitivo** | Usuária não precisa dominar finanças para usar o app.       |
| **Offline‑first**       | Todas as funcionalidades principais funcionam sem internet. |
| **Transparência total** | Cálculos explicáveis e auditáveis pela usuária.            |
| **Valorização do tempo**| Cada interação gera um ganho real e perceptível.           |

## Escopo do MVP
**Inclui**:

- Cadastro manual de insumos.
- Configuração de custos fixos.
- Criação de produtos com cálculo automático de preço, margem e rendimento.
- Login com e‑mail/senha ou Google.
- Armazenamento local (SQLite) e operação offline.

**Exclui**:

- Relatórios financeiros.
- Integrações de pagamento.
- Inteligência Artificial ou OCR (planejados para versões futuras).
- Sincronização em nuvem (será implementada na versão 2).

## Visão Futura
**Versão 2**:

- Sincronização em nuvem e backup automático.
- Geração de orçamentos compartilháveis (PDF, WhatsApp).
- Leitura de notas via OCR para cadastro de insumos.
- Sugestões automáticas de insumos e categorias.

**Versão 3**:

- IA para precificação e otimização de margem.
- Painel de relatórios financeiros.
- Comunidade de confeiteiras com troca de receitas e custos.

## Métricas Norteadoras

- **Usuárias ativas mensais** – número de confeiteiras que usam o app.
- **Produtos criados por usuária** – indicador de engajamento.
- **Taxa de produtos com margem positiva** – saúde financeira dos negócios.
- **Adoção do OCR** (em versões futuras) – percentual de insumos cadastrados via OCR.

## Notas Adicionais

Para garantir consistência e usabilidade, algumas decisões de design foram refinadas:

- **Categorias predefinidas**: os insumos agora utilizam uma lista de categorias pré‑definidas (`chocolate`, `farinha`, `açúcar`, `embalagem`, `decoração`, `outro`), evitando divergências de nomenclatura e facilitando a análise de dados.
- **Pacotes e caixas**: quando a usuária cadastra um insumo adquirido em pacote ou caixa (ex.: 1 caixa de 12 unidades ou 1 pacote de 500 g), o campo `quantidade_por_embalagem` permite informar quantas unidades ou gramas existem em cada embalagem.  O app calcula automaticamente a quantidade base multiplicando `quantidade_compra` por esse valor.
- **Overhead configurável**: a metodologia de rateio dos custos fixos deixa de ser única.  A usuária poderá escolher entre calcular o percentual baseado no faturamento mensal estimado (como originalmente) ou distribuir os custos por hora de trabalho ou por quantidade de produtos produzidos.