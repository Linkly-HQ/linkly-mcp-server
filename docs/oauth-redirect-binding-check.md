# OAuth redirect-binding shadow check

Run this before enabling redirect-URI binding or mandatory PKCE on
`/authorize`. It evaluates the rules we intend to enforce against real
production traffic and reports what *would* have been rejected — without
rejecting anything.

## Why this is a query and not code

The worker is stateless: there is no KV binding, and `/register` does not
persist what it mints (`src/index.ts`, the `/register` handler returns a
synthetic `client_id` and discards it). So `/authorize` cannot compare a
presented `redirect_uri` against a registered one without either adding
storage or encoding the registration into a signed `client_id`.

That signed `client_id` is the client-visible part of the real fix and
carries its own risk — clients persist the value we hand them. Shipping it
just to measure would mean deploying the risk in order to assess the risk.

The `oauth_register` and `oauth_authorize` log events carry both halves of
the comparison and share a `client_id`, so the same rule can be evaluated
offline. Measure here first; change the worker once the data says it is safe.

## The check

Source: Better Stack "Linkly MCP Server" (id 2513920), table
`t173136.linkly_mcp_server`.

**Retention, as actually observed — Better Stack's own query help is wrong
about it.** `remote(...)` retains *days* on this source, not 30 minutes, and
`s3Cluster(...)` lags roughly 24 hours behind live. So the newest rows exist
only in `remote(...)` and the oldest only in S3: union both, and never
conclude from an S3-only gap that logging stopped.

Both branches are prefiltered with `raw LIKE '%oauth_%'`. Without it a
14-day `remote(...)` scan exceeds the 10s socket timeout.

`UNION DISTINCT`, not `UNION ALL` — the two collections overlap, and
duplicates would inflate every count.

Drop the `ua NOT LIKE 'curl/%'` filters to include manual probes.

```sql
WITH
  events AS
  (
    SELECT
      dt,
      JSONExtract(raw, 'message', 'Nullable(String)') AS msg,
      JSONExtract(raw, 'client_id', 'Nullable(String)') AS client_id,
      JSONExtract(raw, 'client_name', 'Nullable(String)') AS client_name,
      JSONExtract(raw, 'redirect_uri', 'Nullable(String)') AS redirect_uri,
      JSONExtract(raw, 'redirect_uris', 'Array(Nullable(String))') AS reg_uris,
      JSONExtract(raw, 'pkce_present', 'Nullable(Bool)') AS pkce,
      JSONExtract(raw, 'ua', 'Nullable(String)') AS ua
    FROM remote(t173136_linkly_mcp_server_logs)
    WHERE
      dt > now() - INTERVAL 6 DAY
      AND raw LIKE '%oauth_%'

    UNION ALL

    SELECT
      dt,
      JSONExtract(raw, 'message', 'Nullable(String)') AS msg,
      JSONExtract(raw, 'client_id', 'Nullable(String)') AS client_id,
      JSONExtract(raw, 'client_name', 'Nullable(String)') AS client_name,
      JSONExtract(raw, 'redirect_uri', 'Nullable(String)') AS redirect_uri,
      JSONExtract(raw, 'redirect_uris', 'Array(Nullable(String))') AS reg_uris,
      JSONExtract(raw, 'pkce_present', 'Nullable(Bool)') AS pkce,
      JSONExtract(raw, 'ua', 'Nullable(String)') AS ua
    FROM s3Cluster(primary, t173136_linkly_mcp_server_s3)
    WHERE
      _row_type = 1
      AND dt > now() - INTERVAL 14 DAY
      AND raw LIKE '%oauth_%'
  ),
  regs AS
  (
    SELECT
      client_id,
      any(client_name) AS client_name,
      any(ua) AS reg_ua,
      any(reg_uris) AS reg_uris
    FROM events
    WHERE
      msg = 'oauth_register'
      AND ua != 'curl/8.7.1'
    GROUP BY client_id
  ),
  auths AS
  (
    SELECT
      dt,
      client_id,
      redirect_uri,
      pkce
    FROM events
    WHERE
      msg = 'oauth_authorize'
      AND ua != 'curl/8.7.1'
  )
SELECT
  a.dt AS dt,
  r.client_name AS client,
  a.redirect_uri AS presented,
  multiIf(
    isNull(r.client_id) OR r.client_id = '', 'NO_REGISTRATION_SEEN',
    has(r.reg_uris, a.redirect_uri), 'exact_match',
    has(
      arrayMap(u -> replaceRegexpOne(u, '^(https?://[^/:]+):[0-9]+', '\1'), r.reg_uris),
      replaceRegexpOne(a.redirect_uri, '^(https?://[^/:]+):[0-9]+', '\1')
    ), 'LOOPBACK_PORT_DRIFT',
    'REDIRECT_MISMATCH'
  ) AS binding_verdict,
  if(a.pkce, 'ok', 'WOULD_BREAK_ON_MANDATORY_PKCE') AS pkce_verdict
FROM auths AS a
LEFT JOIN regs AS r ON a.client_id = r.client_id
ORDER BY dt ASC
LIMIT 100
```

## Reading the verdicts

| Verdict | Meaning | Blocks the rollout? |
| --- | --- | --- |
| `exact_match` | Presented URI equals a registered one. Safe under strict binding. | No |
| `LOOPBACK_PORT_DRIFT` | Matches only once the loopback port is ignored. Expected per RFC 8252 §7.3, which requires servers to permit varying loopback ports. | No, but the comparator **must** be port-insensitive for loopback |
| `REDIRECT_MISMATCH` | Presented a URI never registered. Strict binding would reject this client. | **Yes** — investigate before enforcing |
| `NO_REGISTRATION_SEEN` | Authorized with a `client_id` that never registered inside the window. Either a cached registration older than the window, or a client that skips `/register`. Strict binding would reject it. | **Yes** — this sizes the grace window for legacy `mcp-` ids |
| `WOULD_BREAK_ON_MANDATORY_PKCE` | No `code_challenge`. Mandatory PKCE would reject this. | **Yes** |

## Results

### 2026-09-08 — 36 authorizations, 5 clients

| Verdict | Count | Clients |
| --- | --- | --- |
| `exact_match` | 17 | Manus (10), Claude.ai (4), Claude Code (2), a Val Town DCR demo (1) |
| `NO_REGISTRATION_SEEN` | **19** | one client, `http://localhost:18388/oauth/callback` |
| `REDIRECT_MISMATCH` | 0 | — |
| `LOOPBACK_PORT_DRIFT` | 0 | — |
| PKCE present (S256) | 36 / 36 | all |

**The Claude.ai web connector now appears and is clean** —
`https://claude.ai/api/mcp/auth_callback`, 4 authorizations, all
`exact_match`. That was the blocking gap in the 2026-09-02 run.

**The 19 `NO_REGISTRATION_SEEN` are a single `client_id`**
(`mcp-60b66469-…`) re-authorizing 19 times between 11:44 and 14:17 UTC on
2026-09-03, with **no `oauth_register` row anywhere in retention**. The
requests arrive in pairs — a `node` User-Agent immediately followed by a
Chrome one, ~0.3s apart — i.e. a local client calling `/authorize` itself and
then handing off to a browser. Consistent with MCP Inspector or a local dev
client on port 18388, looping on a failing flow.

This is the population that blocks strict enforcement: a client presenting a
cached `client_id` the server cannot tie to any registration. Under strict
binding all 19 would have been rejected.

**Still absent: the ChatGPT app.** It has not authorized in any observed
window.

### 2026-09-02 — 9 authorizations, 3 clients

9/9 `exact_match`, 9/9 PKCE, 0 empty `redirect_uris`. Note this run used the
buggy `r.client_id = ''` test (see below) — but it had no unmatched rows, so
the totals stand.

## Bug fixed 2026-09-08 — check your null test

The first version of this query classified unmatched authorizations with
`r.client_id = ''`. ClickHouse fills an unmatched `LEFT JOIN` with **NULL**
here, not empty string, so `NULL = ''` is NULL, the branch never fired, and
all 19 `NO_REGISTRATION_SEEN` rows were reported as `REDIRECT_MISMATCH`.

The two verdicts have opposite remediations — a mismatch means investigate a
client sending an unregistered URI; no-registration means size a grace window
for cached `client_id`s — so the mislabel pointed the wrong way. The query
above now tests `isNull(r.client_id) OR r.client_id = ''`.

## Data-quality caveat

Better Stack ingestion was degraded account-wide from **2026-09-03 09:00 to
2026-09-04 13:00 UTC** (their eu-fsn-3 → eu-central-1a migration). This
source did keep storing rows through that window — other clients'
`oauth_register` events at 15:00 and 16:00 on 09-03 are present — so the
missing registration above is unlikely to be an artifact. But treat counts
inside that window as a floor, not a census.

## Note on User-Agent

`ua` on `oauth_authorize` is the **end user's browser**, not the MCP client —
`/authorize` is reached by browser navigation. Client identity comes from
`oauth_register` (`client_name` and its server-side `ua`). Join on
`client_id`, never on `ua`.
