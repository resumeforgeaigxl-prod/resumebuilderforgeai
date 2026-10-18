/**
 * ResumeForge — Canonical Job Ingestion & Freshness Pipeline
 * Central export module for canonical job types, normalization, deduplication,
 * adapters, ingestion, verification, freshness scheduling, and replacements.
 */

export * from './types';
export * from './normalize';
export * from './dedupe';
export * from './ingest';
export * from './verify';
export * from './freshness';
export * from './replacement';
export * from './slug';
export * from './indexability';
export * from './indexing';
export * from './adapters/growx-crawl';
export * from './adapters/adzuna';
export * from './adapters/web-search';
