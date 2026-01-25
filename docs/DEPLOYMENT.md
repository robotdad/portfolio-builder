# Deployment Guide

> 🚧 **Work in Progress** — This documentation is under development.

## Overview

This application is designed for single-user deployment. It uses SQLite for simplicity but can be adapted for other databases supported by Prisma.

## Deployment Options

*Coming soon:*

- Vercel deployment
- Docker containerization
- VPS/bare metal deployment
- Database migration to PostgreSQL

## Authentication Setup

This application uses Google OAuth for admin authentication.

**[Google OAuth Setup Guide](./GOOGLE-OAUTH-SETUP.md)** - Complete instructions for:
- Creating Google Cloud Console credentials
- Configuring OAuth consent screen
- Setting up environment variables
- Testing the authentication flow

## Environment Configuration

See [.env.example](../.env.example) for required environment variables.
