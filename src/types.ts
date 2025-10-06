export interface Profile {
    id?: number;
    name: string;
    language: string;
    description?: string;
    workspacePath?: string;
    extensions?: string[];
    aiProvider?: 'gemini' | 'openai';
    aiModel?: string;
    envVariables?: Record<string, string>;
    codeTemplate?: string;
    githubRepo?: GitHubRepository;
    createdAt?: string;
    lastUsed?: string;
}

export interface CreateProfileData {
    name: string;
    language: string;
    description?: string;
    workspacePath?: string;
    extensions?: string[];
    aiProvider?: 'gemini' | 'openai';
    aiModel?: string;
    envVariables?: Record<string, string>;
    codeTemplate?: string;
    githubRepo?: GitHubRepository;
}

export interface UpdateProfileData {
    name?: string;
    language?: string;
    description?: string;
    workspacePath?: string;
    extensions?: string[];
    aiProvider?: 'gemini' | 'openai';
    aiModel?: string;
    envVariables?: Record<string, string>;
    codeTemplate?: string;
    githubRepo?: GitHubRepository;
    lastUsed?: string;
}

export const SUPPORTED_LANGUAGES = [
    'TypeScript',
    'JavaScript',
    'Python',
    'Go',
    'Rust',
    'C#',
    'Java',
    'C++',
    'PHP',
    'Ruby'
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface AIProvider {
    name: 'gemini' | 'openai';
    displayName: string;
    models: AIModel[];
}

export interface AIModel {
    id: string;
    name: string;
    description?: string;
}

export const AI_PROVIDERS: AIProvider[] = [
    {
        name: 'gemini',
        displayName: 'Google Gemini',
        models: [
            { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', description: 'Latest experimental flash model' },
            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and efficient model' },
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable model' },
            { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', description: 'Previous generation model' }
        ]
    },
    {
        name: 'openai',
        displayName: 'OpenAI',
        models: [
            { id: 'gpt-4', name: 'GPT-4', description: 'Most capable GPT model' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Enhanced GPT-4 with larger context' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective' }
        ]
    }
];

export const DEFAULT_CODE_TEMPLATES: Record<string, string> = {
    'TypeScript': `// TypeScript Project Template
export class HelloWorld {
    private message: string;

    constructor(message: string = "Hello, TypeScript!") {
        this.message = message;
    }

    public greet(): void {
        console.log(this.message);
    }
}

const app = new HelloWorld();
app.greet();
`,
    'JavaScript': `// JavaScript Project Template
class HelloWorld {
    constructor(message = "Hello, JavaScript!") {
        this.message = message;
    }

    greet() {
        console.log(this.message);
    }
}

const app = new HelloWorld();
app.greet();
`,
    'Python': `#!/usr/bin/env python3
# Python Project Template

class HelloWorld:
    def __init__(self, message="Hello, Python!"):
        self.message = message
    
    def greet(self):
        print(self.message)

if __name__ == "__main__":
    app = HelloWorld()
    app.greet()
`,
    'Go': `// Go Project Template
package main

import "fmt"

type HelloWorld struct {
    message string
}

func NewHelloWorld(message string) *HelloWorld {
    if message == "" {
        message = "Hello, Go!"
    }
    return &HelloWorld{message: message}
}

func (hw *HelloWorld) Greet() {
    fmt.Println(hw.message)
}

func main() {
    app := NewHelloWorld("")
    app.Greet()
}
`,
    'Rust': `// Rust Project Template
struct HelloWorld {
    message: String,
}

impl HelloWorld {
    fn new(message: Option<String>) -> Self {
        let message = message.unwrap_or_else(|| "Hello, Rust!".to_string());
        HelloWorld { message }
    }

    fn greet(&self) {
        println!("{}", self.message);
    }
}

fn main() {
    let app = HelloWorld::new(None);
    app.greet();
}
`
};

// GitHub Integration Types
export type IssueState = 'open' | 'closed';

export interface GitHubIssue {
    id: number;
    number: number;
    title: string;
    body: string;
    state: IssueState;
    labels: string[];
    assignee?: string;
    createdAt: string;
    updatedAt: string;
    htmlUrl: string;
}

export interface GitHubRepository {
    owner: string;
    repo: string;
    branch?: string;
}