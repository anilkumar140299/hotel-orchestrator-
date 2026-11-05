# Hotel Offer Orchestrator

A small backend service that fans out to two hotel suppliers, chooses the best offer per hotel, and caches the result in Redis for price filtering.

## Stack

- Node.js 22 + TypeScript
- Express
- Temporal workflows for durable supplier orchestration
- Redis sorted sets and hashes
- Zod query validation
- Pino request/application logging
- Jest for unit tests

## Run locally

Requirements: Node.js 22+, Redis 7+, and a running Temporal server.

```bash
cp .env.example .env
npm install
npm run build
```

Start the API and worker in separate terminals:

```bash
npm run dev
npm run worker:dev
```

The API listens on `http://localhost:3000`.

## Run with Docker Compose

```bash
docker compose up --build
```

Services:

| Service | URL / port |
|---|---|
| API | http://localhost:3000 |
| Temporal UI | http://localhost:8080 |
| Redis | localhost:6379 |
| Temporal frontend | localhost:7233 |

The API and worker use the same image. Compose starts the mock supplier endpoints on the API service and the Temporal worker separately.

## API

### Aggregate supplier offers

```bash
curl -i "http://localhost:3000/api/hotels?city=delhi"
```

The API checks Redis first. On a cache miss it starts a Temporal workflow, which calls both supplier endpoints concurrently. The workflow tolerates an individual supplier failure and returns the successful supplier's data.

### Filter by price

```bash
curl -i "http://localhost:3000/api/hotels?city=delhi&minPrice=4000&maxPrice=12000"
```

Once the city has been cached, filtering uses `ZRANGEBYSCORE` against the Redis sorted set and `HMGET` against the hotel hash. The range is inclusive.

### Health check

```bash
curl "http://localhost:3000/health"
```

### Mock suppliers

```bash
curl "http://localhost:3000/supplierA/hotels?city=delhi"
curl "http://localhost:3000/supplierB/hotels?city=delhi"
```

## Cache layout

For `delhi`:

- `hotels:delhi:prices` — Redis ZSET; score is price, member is stable hotel ID.
- `hotels:delhi:offers` — Redis HASH; field is stable hotel ID, value is serialized selected offer.
- `hotels:delhi:meta` — Redis HASH; aggregation timestamp and degraded supplier list.

All three keys receive the same configurable TTL (`CACHE_TTL_SECONDS`, default 300 seconds).

## Offer selection

Hotel names are normalized using Unicode normalization, trimming, lowercasing and whitespace collapsing. For each normalized name:

1. Lowest price wins.
2. If prices match, the higher commission rate wins.
3. If both price and commission match, the first supplier result is retained.

The returned `supplier` identifies the source of the selected offer.

## Partial supplier failure

The workflow uses `Promise.allSettled()`. A failed supplier is listed in `degradedSuppliers`, while successful supplier results are still returned and cached. To exercise this locally, start the API with `MOCK_SUPPLIER_A_FAIL=true` or `MOCK_SUPPLIER_B_FAIL=true` in its environment; the selected mock supplier will return HTTP 503. The API adds an `x-degraded-suppliers` response header, for example:

```http
x-degraded-suppliers: supplierB
```

Temporal activity retries are bounded (two attempts). Supplier HTTP calls also have a timeout.

## Tests

```bash
npm test
npm run typecheck
```

The unit tests cover cheapest-price selection, commission tie-breaking, and hotel-name normalization.

## Notes / production follow-ups

- Supplier mock endpoints are hosted by the API process to keep the assignment self-contained. In a real deployment, each supplier adapter would call its supplier's independent API.
- The assignment uses a single city-level cache key. For production, consider a distributed lock or request coalescing to prevent multiple simultaneous cache misses from launching duplicate workflows.
- Cache entries expire after five minutes by default. The cache is refreshed on the next request after expiry.
- A production service should add metrics, tracing, authentication/rate limiting, schema validation for supplier payloads, and integration tests against disposable Redis and Temporal instances.
- The current workflow is deterministic: network I/O happens in activities, while offer selection is pure workflow logic.
