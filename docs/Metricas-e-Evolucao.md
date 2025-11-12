# Métricas e Evolução – Mallow

## Objetivo
Monitorar o uso do aplicativo e orientar as próximas versões com base em dados reais, garantindo que o produto evolua de forma alinhada às necessidades das confeiteiras.

## Indicadores Principais (KPIs)

| Indicador                         | Significado                                                |
|----------------------------------|------------------------------------------------------------|
| **Usuárias ativas mensais (UAM)**| Número de confeiteiras que usam o app no mês.               |
| **Produtos criados por usuária**  | Média de produtos cadastrados por usuária – mede engajamento. |
| **Cálculos finalizados**          | Quantidade de cálculos de preço executados – adoção da funcionalidade principal. |
| **Margem média efetiva**          | Margem real obtida pelas usuárias – indica saúde financeira. |
| **Inscrições na lista de espera** | Total de emails coletados na landing page de waitlist – validação de interesse. |
| **Uso de OCR (v2)**               | Percentual de insumos cadastrados via OCR em relação ao total de insumos cadastrados. |

## Eventos Rastreados

### Eventos MVP (v1)

- `login_sucesso` - Disparado quando usuária faz login com sucesso (e-mail/senha ou Google)
- `insumo_cadastrado` - Disparado quando insumo é criado ou editado
- `custo_adicionado` - Disparado quando custo fixo é criado ou editado
- `produto_criado` - Disparado quando produto é criado ou editado
- `calculo_realizado` - Disparado quando cálculo de preço é executado
- `preco_manual_aplicado` - Disparado quando usuária define preço manual diferente do sugerido

### Eventos Futuros (v2+)

- `ocr_nota_processada` (v2) - Disparado quando OCR processa nota fiscal
- `orcamento_compartilhado` (v2) - Disparado quando orçamento é compartilhado

## Formato e Estrutura dos Eventos

Cada evento segue a estrutura JSON:

```json
{
  "event": "nome_do_evento",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "user_id": "uuid_da_usuario",
  "session_id": "uuid_da_sessao",
  "data": {
    // Dados específicos do evento (opcional)
    // Exemplo para calculo_realizado:
    "custo_total": 12.50,
    "preco_sugerido": 16.25,
    "margem_efetiva": 30.0
  },
  "metadata": {
    "app_version": "1.0.0",
    "platform": "ios" | "android",
    "offline": true | false
  }
}
```

**Campos obrigatórios**: `event`, `timestamp`, `user_id`  
**Campos opcionais**: `session_id`, `data`, `metadata`

## Armazenamento e Sincronização

**Armazenamento Local (v1)**:
- Eventos são armazenados localmente em SQLite na tabela `analytics_events` com campos: `id`, `event`, `timestamp`, `user_id`, `data_json`, `sync_status` ('local', 'pending', 'synced')
- Eventos são persistidos imediatamente após serem disparados (não há batch)
- Armazenamento local permite funcionamento offline completo

**Sincronização (v2)**:
- Quando houver conexão, eventos com `sync_status = 'pending'` são enviados em batch para serviço de analytics
- Envio ocorre em background quando app detecta conexão disponível
- Eventos são marcados como `sync_status = 'synced'` após sincronização bem-sucedida
- Eventos antigos (> 30 dias) podem ser removidos localmente após sincronização

**Timing de Envio (v1)**:
- **v1**: Eventos são apenas armazenados localmente (sem envio, pois não há backend)
- **v2**: Eventos são enviados em batch quando houver conexão (não imediato, para economizar bateria e dados)

## Roadmap Resumido

| Versão | Principais Funcionalidades                                                 | Foco                        |
|-------|-----------------------------------------------------------------------------|-----------------------------|
| **v1** | Cadastro manual de insumos e custos, criação de produtos, cálculo offline  | Fundamentos                |
| **v2** | Backup em nuvem, sincronização, OCR de notas, geração de orçamentos        | Automação e conveniência   |
| **v3** | IA de precificação, relatórios financeiros, comunidade de usuárias          | Inteligência e colaboração |

As evoluções posteriores poderão incluir funcionalidades de marketplace, integração com meios de pagamento e módulos de gestão de estoque, conforme as métricas indicarem novas necessidades.