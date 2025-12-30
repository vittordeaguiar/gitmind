> 🇺🇸 [Read this document in English](./README.md)

# GitMind

GitMind é uma ferramenta de interface de linha de comando (CLI) projetada para automatizar a geração de Conventional Commits utilizando Inteligência Artificial. Ela analisa as alterações preparadas (staged) no seu repositório git e utiliza Grandes Modelos de Linguagem (LLMs) para propor mensagens de commit concisas e padronizadas.

A ferramenta suporta múltiplos provedores de IA, incluindo Google Gemini, OpenAI e inferência local via Ollama, tornando-a adaptável a diversos fluxos de trabalho e requisitos de privacidade.

## Funcionalidades

- **Análise Baseada em IA**: Gera mensagens de commit sensíveis ao contexto com base no `git diff`.
- **Conventional Commits**: Adere estritamente à especificação Conventional Commits (feat, fix, chore, breaking changes, etc.).
- **Suporte Multi-Provedor**: Integração perfeita com Google Gemini, OpenAI e Ollama.
- **Fluxo de Trabalho Interativo**: Revise, edite ou gere novamente mensagens de commit antes de finalizar.
- **Integração com Git**: Automatiza o commit e o push das alterações após aprovação do usuário.
- **Configuração Local**: Persiste preferências do usuário e chaves de API localmente.

## Instalação

Para instalar o GitMind globalmente em seu sistema, certifique-se de ter o Node.js (versão 18 ou superior) instalado e execute:

```bash
npm install -g gitmind
```

Alternativamente, você pode executá-lo diretamente usando o `npx`:

```bash
npx gitmind
```

## Configuração

Antes de usar o GitMind, você deve configurar seu provedor de IA preferido. A CLI fornece um processo de configuração guiado.

### Configuração Interativa

Execute o seguinte comando para iniciar o assistente de configuração interativo:

```bash
gitmind config
```

Você será solicitado a selecionar um provedor (Google, OpenAI, Anthropic ou Ollama) e inserir suas credenciais de API e modelo preferido.

### Configuração Manual

Você também pode definir as configurações diretamente via flags de linha de comando:

**Google Gemini**
```bash
gitmind config --provider google --api-key SUA_API_KEY --model gemini-2.5-flash
```

**OpenAI**
```bash
gitmind config --provider openai --api-key SUA_API_KEY --model gpt-4o
```

**Ollama (Local)**
Para o Ollama, o campo de chave de API é usado para especificar a URL Base (padrão é http://127.0.0.1:11434).
```bash
gitmind config --provider ollama --model llama3
```

Para visualizar sua configuração atual:
```bash
gitmind list
```

## Uso

### 1. Prepare Suas Alterações (Stage)
O GitMind analisa arquivos atualmente preparados (staged) no git. Primeiro, adicione os arquivos que pretende commitar:

```bash
git add .
```

### 2. Gerar Mensagem de Commit
Execute o comando de geração:

```bash
gitmind gen
```

A ferramenta irá:
1. Analisar o diff dos arquivos preparados.
2. Gerar uma proposta de mensagem de commit.
3. Exibir a proposta para sua revisão.

### 3. Revisar e Finalizar
Você receberá as seguintes opções:
- **Confirmar e Commitar**: Aceita a mensagem e cria o commit.
- **Editar Mensagem**: Permite modificar manualmente o tipo, escopo, assunto, corpo ou rodapé.
- **Cancelar**: Aborta a operação.

Após um commit bem-sucedido, a ferramenta perguntará se você deseja fazer o push das alterações para o repositório remoto imediatamente.

## Desenvolvimento

Para contribuir ou modificar o código-fonte, siga estas etapas:

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/vittordeaguiar/gitmind.git
   cd gitmind
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Compilar o projeto**
   ```bash
   npm run build
   ```

4. **Executar testes**
   ```bash
   npm test
   ```

5. **Executar localmente**
   ```bash
   npm start -- gen
   ```

## Licença

Este projeto está licenciado sob a Licença ISC.
