# Frontend runtime image for the canonical /space Next.js application.
# Added in Phase 4 to package the verified standalone build for container deployment.

FROM node:20-bookworm-slim AS deps

WORKDIR /app/space
ENV NEXT_TELEMETRY_DISABLED=1

COPY space/package.json space/package-lock.json ./

RUN npm ci --legacy-peer-deps

FROM node:20-bookworm-slim AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/space/node_modules ./space/node_modules
COPY space ./space

RUN npm --prefix space run build

FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

COPY --from=builder /app/space/.next/standalone/ai-satellite-monitor ./
COPY --from=builder /app/space/.next/static ./space/.next/static
COPY --from=builder /app/space/public ./space/public
EXPOSE 3000
CMD ["node", "space/server.js"]
