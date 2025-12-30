> 🇧🇷 [Leia este documento em Português](./README.pt-BR.md)

# GitMind

[![npm version](https://img.shields.io/npm/v/gitmind.svg)](https://www.npmjs.com/package/gitmind)

GitMind is a command-line interface (CLI) tool designed to automate the generation of Conventional Commits using Artificial Intelligence. It analyzes staged changes in your git repository and leverages Large Language Models (LLMs) to propose concise, standardized commit messages.

The tool supports multiple AI providers, including Google Gemini, OpenAI, and local inference via Ollama, making it adaptable to various workflows and privacy requirements.

## Features

- **AI-Powered Analysis**: Generates context-aware commit messages based on `git diff`.
- **Conventional Commits**: Strictly adheres to the Conventional Commits specification (feat, fix, chore, breaking changes, etc.).
- **Multi-Provider Support**: Seamless integration with Google Gemini, OpenAI, and Ollama.
- **Interactive Workflow**: Review, edit, or regenerate commit messages before finalizing.
- **Git Integration**: Automates committing and pushing changes upon user approval.
- **Local Configuration**: Persists user preferences and API keys locally.

## Installation

To install GitMind globally on your system, ensure you have Node.js (version 18 or higher) installed, then run:

```bash
npm install -g gitmind
```

Alternatively, you can run it directly using `npx`:

```bash
npx gitmind
```

## Configuration

Before using GitMind, you must configure your preferred AI provider. The CLI provides a guided configuration process.

### Interactive Setup

Run the following command to start the interactive setup wizard:

```bash
gitmind config
```

You will be prompted to select a provider (Google, OpenAI, Anthropic, or Ollama) and enter your API credentials and preferred model.

### Manual Setup

You can also configure settings directly via command-line flags:

**Google Gemini**
```bash
gitmind config --provider google --api-key YOUR_API_KEY --model gemini-2.5-flash
```

**OpenAI**
```bash
gitmind config --provider openai --api-key YOUR_API_KEY --model gpt-4o
```

**Ollama (Local)**
For Ollama, the API key field is used to specify the Base URL (defaulting to http://127.0.0.1:11434).
```bash
gitmind config --provider ollama --model llama3
```

To view your current configuration:
```bash
gitmind list
```

## Usage

### 1. Stage Your Changes
GitMind analyzes files currently staged in git. First, add the files you intend to commit:

```bash
git add .
```

### 2. Generate Commit Message
Run the generation command:

```bash
gitmind gen
```

The tool will:
1. Analyze the staged diff.
2. Generate a commit message proposal.
3. Display the proposal for your review.

### 3. Review and Finalize
You will be presented with the following options:
- **Confirm and Commit**: Accepts the message and creates the commit.
- **Edit Message**: Allows you to manually modify the type, scope, subject, body, or footer.
- **Cancel**: Aborts the operation.

After a successful commit, the tool will ask if you wish to push the changes to the remote repository immediately.

## Development

To contribute or modify the source code, follow these steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/vittordeaguiar/gitmind.git
   cd gitmind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Run locally**
   ```bash
   npm start -- gen
   ```
## License\n\nThis project is licensed under the [ISC License](./LICENSE).
