# CyberGuard Red Team Lab

## Overview

This lab lets a student write an attack script in the browser, run it inside a sandboxed Node.js Docker container, and attack a vulnerable target simulator backend.  
The target exposes SQL injection–like behavior on `/target/login` and `/target/search`, and the script returns structured JSON with findings and HTTP request logs.

## Architecture

- **Frontend (client)**: React app (Create React App) served on `http://localhost:3000`.
- **Backend (backend)**: Express API on `http://localhost:3001` with:
  - `POST /api/lab/run` – saves the attack code, runs it in a `node:18-alpine` Docker container, returns `{ finding, http, logs }`.
  - `POST /api/ai/assist` – simple stub that returns a fixed text suggestion for the “Ask AI” button.
  - `GET /target/login`, `/target/search`, `/target/echo` – target simulator endpoints with intentional SQLi-style error responses.

## Prerequisites

- Node.js 18+ installed locally.
- Docker Desktop installed and running (containers can start and `host.docker.internal` resolves to the host).

## Setup

From the project root:
