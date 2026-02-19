# Arquitetura do Pipeline de Leads SaaS

Este sistema foi projetado para converter curiosos (usuários demo) em clientes qualificados (leads verificados).

## 1. Fluxo de Conversão
1. **Atração**: Usuário acessa `logindemo` e entra no ambiente de sandbox.
2. **Interrupção (DemoGuard)**: Ao tentar realizar qualquer ação de escrita, o `DemoGuard` intercepta a chamada.
3. **Captura**: Um modal premium solicita Nome, Email e WhatsApp. Estes dados são enviados para a tabela `saas_leads`.
4. **Cadastro**: O usuário é redirecionado para o cadastro real com os dados pré-preenchidos.
5. **Verificação (Gatekeeper)**: Após o cadastro, o usuário cai na tela de verificação WhatsApp. O acesso ao sistema é bloqueado até que o código OTP de 6 dígitos seja validado.

## 2. Componentes Críticos
- **DemoGuardContext**: Gerencia o estado do modo demonstração e o rastreamento de interesse.
- **RPC `generate_whatsapp_code`**: Gera hashes seguros, gerencia expiração e dispara webhook para N8N.
- **RPC `verify_whatsapp_code`**: Valida a entrada do usuário, marca o perfil como verificado e limpa caches.
- **MainLayout Guard**: Verifica a flag `whatsapp_verified` no perfil antes de renderizar qualquer rota protegida.

## 3. Segurança
- Os códigos OTP são armazenados como **hashes SHA256** no banco de dados.
- Implementado **Rate Limiting** para evitar ataques de força bruta no envio de códigos.
- **RLS (Row Level Security)** garante que apenas o Super Admin veja a tabela de leads global.
