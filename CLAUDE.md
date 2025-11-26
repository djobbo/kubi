# Agent Instructions

This document provides guidance for AI assistants working on this codebase.

<!-- effect-solutions:start -->
## Effect Solutions Usage

The Effect Solutions CLI provides curated best practices and patterns for Effect TypeScript. Before working on Effect code, check if there's a relevant topic that covers your use case.

- `bunx effect-solutions list` - List all available topics
- `bunx effect-solutions show <slug...>` - Read one or more topics
- `bunx effect-solutions search <term>` - Search topics by keyword

**Available Topics:**
- `quick-start` - How to get started with Effect Solutions
- `project-setup` - Effect Language Service and project setup
- `tsconfig` - TypeScript configuration for Effect
- `basics` - Effect.fn and Effect.gen conventions
- `services-and-layers` - Dependency injection patterns
- `data-modeling` - Schema classes, unions, brands, pattern matching
- `error-handling` - Error modeling and handling patterns
- `config` - Configuration management

**When to use Effect Solutions:**
- Before implementing new Effect patterns
- When encountering Effect-related errors
- When designing services, layers, or error types
- When working with Effect Schema or Config

**Local Effect Source:** The Effect repository is cloned to `~/.local/share/effect-solutions/effect` for reference. Use this to explore APIs, find usage examples, and understand implementation details when the documentation isn't enough.
<!-- effect-solutions:end -->

## Effect Code Patterns

This project follows idiomatic Effect patterns:

- **Services**: Each service has a dedicated config, uses `@app/ServiceName` tags, `static readonly layer`, and `Effect.fn` for methods
- **Config**: Dedicated config services per domain with `layer` (production) and `testLayer` (testing)
- **Errors**: `Schema.TaggedError` with all properties in the schema (no mutable class properties)

## Project Structure

This is a monorepo with the following workspaces:
- `api` - Backend API server (Bun + Effect)
- `client` - Frontend application (React + Vite + Effect)
- `packages/*` - Shared packages

## Development

- Package Manager: **Bun** (v1.3.3)
- Effect Language Service is configured in all workspaces
- TypeScript is set to strict mode with additional safety checks

