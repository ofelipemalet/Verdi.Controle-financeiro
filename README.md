Verdi - Controle Financeiro 

Objetivo: Desenvolver um aplicativo web de controle financeiro pessoal, com identidade visual própria, inspirado na experiência de aplicativos bancários modernos, utilizando verde e branco como cores principais.

O aplicativo será utilizado exclusivamente por um usuário.

1. Identidade visual e design

Design profissional, minimalista e elegante.

Inspirado na experiência visual de bancos digitais, sem copiar suas identidades.

Verde como cor predominante e branco como cor secundária.

Verde-escuro para destaques e botões.

Cards modernos com cantos arredondados.

Ícones profissionais e consistentes.

Animações suaves em botões, transições e interações.

Gráficos modernos e interativos.

Excelente experiência visual tanto em celulares quanto em computadores.

Interface limpa, sem excesso de informações.

Evitar completamente aparência genérica ou artificial de interfaces geradas por IA.

2. Estrutura do aplicativo

Criar três páginas principais:

PÁGINA 1 — INÍCIO

Apresentar um painel financeiro contendo:

Saldo total disponível.

Total de receitas.

Total de despesas.

Total economizado.

Gráfico de movimentações financeiras.

Últimas transações realizadas.

Botão para adicionar receita.

Botão para adicionar despesa.

Seletor para visualizar movimentações por período.

PÁGINA 2 — ANÁLISES

Criar uma página dedicada à apresentação de dados financeiros.

Apresentar:

Quanto dinheiro entrou.

Quanto dinheiro saiu.

Quanto dinheiro foi economizado.

Gráfico de receitas versus despesas.

Comparação financeira entre meses.

Distribuição de gastos por categorias.

Indicadores de desempenho financeiro.

PÁGINA 3 — MOVIMENTAÇÕES

Permitir:

Cadastrar receitas.

Cadastrar despesas.

Informar descrição e valor.

Selecionar categoria.

Informar data.

Editar movimentações.

Excluir movimentações.

Filtrar por receitas, despesas e períodos.

Todas as movimentações devem atualizar automaticamente os indicadores e gráficos das outras páginas.

3. Engenharia e qualidade do código

Esta seção é obrigatória.

Desenvolva o projeto seguindo rigorosamente boas práticas de engenharia de software.

Utilizar React, TypeScript e Tailwind CSS.

Criar componentes reutilizáveis.

Manter uma arquitetura organizada e escalável.

Evitar códigos duplicados e desnecessários.

Evitar dependências desnecessárias.

Utilizar tipagem adequada no TypeScript.

Implementar tratamento de erros.

Validar todos os campos dos formulários.

Impedir valores financeiros inválidos.

Evitar erros de cálculo e inconsistências nos indicadores.

Não utilizar funções obsoletas.

Não deixar botões sem funcionalidade.

Não deixar páginas incompletas.

Não inserir comentários desnecessários no código.

Não utilizar códigos provisórios ou soluções improvisadas.

4. Segurança

Mesmo sendo inicialmente apenas Front-end, aplicar boas práticas de segurança:

Validar e sanitizar entradas do usuário.

Prevenir vulnerabilidades de XSS.

Evitar utilização de funções inseguras.

Não armazenar senhas ou credenciais no navegador.

Não expor chaves secretas.

Não inserir informações sensíveis diretamente no código.

Implementar tratamento seguro de dados.

Evitar manipulação insegura do DOM.

Preparar a arquitetura para futura autenticação.

Importante: não simular segurança de backend. A segurança real dos dados financeiros deverá ser implementada posteriormente com Supabase, autenticação e políticas de acesso adequadas.

5. Funcionamento do Front-end

Nesta primeira etapa, desenvolver exclusivamente o Front-end.

Não configurar Supabase ainda.

Não criar banco de dados.

Utilizar localStorage para persistência temporária.

Garantir que os dados continuem disponíveis após atualizar a página.

Implementar todas as funcionalidades dos botões.

Garantir navegação funcional entre as três páginas.

Atualizar automaticamente os gráficos e indicadores.

Implementar validações nos formulários.

6. Preparação para o futuro

Organizar o projeto pensando em uma futura integração com Supabase.

A estrutura deverá permitir posteriormente:

Autenticação de usuário.

Banco de dados PostgreSQL.

Sincronização de movimentações.

Armazenamento seguro na nuvem.

Recuperação de dados em diferentes dispositivos.

Não implementar essas funcionalidades agora.

7. Verificação e testes

Antes de considerar o projeto concluído:

Verificar possíveis erros de TypeScript.

Verificar erros de compilação.

Verificar importações e dependências.

Testar todas as funcionalidades.

Testar os formulários.

Testar os cálculos financeiros.

Testar a atualização dos gráficos.

Testar a navegação.

Verificar a responsividade.

Corrigir os problemas encontrados.

Não declarar funcionalidades concluídas sem verificar seu funcionamento.

INSTRUÇÃO FINAL:

Priorize qualidade de código, precisão, desempenho, segurança e experiência do usuário. Desenvolva uma aplicação realmente funcional, não apenas uma demonstração visual. Evite alterações desnecessárias, improvisações e implementações que não foram solicitadas.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://verde-money-compass.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bb89651d-eb1d-4beb-a2ae-d171f75be330).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
