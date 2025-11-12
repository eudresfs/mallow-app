# Segurança e Persistência – Mallow

## Objetivo
Proteger os dados das usuárias, garantir a integridade dos cálculos e preparar o app para sincronização futura.

## Armazenamento Local
- Os dados são guardados em **SQLite** no dispositivo.  Há tabelas para `user`, `insumo`, `custo_global`, `produto` e uma tabela de metadados para versionamento do esquema (`schema_version`).
- Migrações de esquema são versionadas e executadas automaticamente na inicialização.

## Criptografia
- As credenciais de sessão (tokens) são armazenadas usando **Expo SecureStore**, que oferece um cofre seguro no dispositivo.
- O banco SQLite não é criptografado no MVP para simplificar o desenvolvimento.  Versões futuras podem usar bibliotecas de criptografia de SQLite.
- Senhas nunca são armazenadas em texto plano.  No backend futuro, serão guardadas como hash (ex.: bcrypt).

## Sessão e Autenticação
- O login via e‑mail/senha ou Google cria uma sessão local persistente com validade de 30 dias, renovada sempre que a usuária se autentica.
- Se já existir uma sessão local válida, o app faz login automático mesmo sem conexão.
- O app também oferece modo visitante, permitindo uso sem login; os dados ficam apenas localmente até que uma conta seja criada para sincronização.

## Sincronização e Backup (versão 2)

- Cada registro possui campos `user_id`, `created_at`, `updated_at`, `version` e `sync_status` (pode ser `local`, `pending` ou `synced`).  O campo `version` incrementa a cada alteração local.
- O app identifica registros com `sync_status = pending` e os envia para a API assim que houver conexão.
- **Resolução de conflitos**: em vez de simplesmente assumir que a última atualização vence, o backend aplicará regras de merge específicas:
  - Para entidades simples (como `insumo` e `custo_global`), se a mesma propriedade foi modificada em dois dispositivos, a alteração mais recente prevalece.  Se diferentes campos foram modificados separadamente (por exemplo, o preço em um dispositivo e a categoria em outro), as alterações são **mescladas** no servidor.
  - Para entidades compostas (`produto`), listas de insumos e de custos são tratadas como conjuntos.  O servidor tenta combinar as listas; se não for possível, a usuária será notificada para resolver o conflito manualmente.
  - Nos casos complexos em que o merge automático não é possível, o app apresentará as duas versões para a usuária escolher como prosseguir.
- O backend retornará IDs globais e a versão consolidada, que substituirão os IDs locais após a sincronização.
- O MVP pode oferecer exportação manual de backup (arquivo JSON) para maior segurança dos dados.  Em versões futuras, backups automáticos em nuvem estarão disponíveis.

## Políticas de Privacidade
- Nenhum dado será compartilhado com terceiros sem consentimento explícito.
- Logs de erros são armazenados localmente e enviados apenas se a usuária permitir.
- O termo de consentimento será exibido no onboarding, explicando como os dados serão usados e armazenados.

## Atualizações e Recuperação
- Correções de bugs e novas funcionalidades serão distribuídas via **Expo Updates**, permitindo over‑the‑air updates.
- Migrações de banco devem ser idempotentes; se uma migração falhar, o app pausa a execução e orienta a usuária a atualizar manualmente ou reinstalar.