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
`t173136.linkly_mcp_server`. `remote(...)` holds roughly the last 30 minutes;
everything older is in `s3Cluster(...)`, so the query unions both.

Adjust the `INTERVAL 7 DAY` window as needed. Drop the `ua != 'curl/8.7.1'`
filters to include manual probes.

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
    WHERE dt > now() - INTERVAL 30 MINUTE

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
      AND dt > now() - INTERVAL 7 DAY
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
    r.client_id = '', 'NO_REGISTRATION_SEEN',
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

## Results so far

**2026-09-02**, seven-day window, 9 authorizations across 3 clients
(Manus, Claude Code, and one abacus.ai registration that never authorized):

- 9/9 `exact_match` — zero mismatches, zero port drift
- 9/9 PKCE present, all S256
- 0 registrations with empty `redirect_uris`

**Caveat: neither the Claude.ai web connector nor the ChatGPT app appears in
this sample.** They are the two largest integrations and the most likely to
hold cached registrations, which is exactly the `NO_REGISTRATION_SEEN` case.
Absence here is not evidence of safety. Re-run once traffic from both has
been observed before enforcing.

## Note on User-Agent

`ua` on `oauth_authorize` is the **end user's browser**, not the MCP client —
`/authorize` is reached by browser navigation. Client identity comes from
`oauth_register` (`client_name` and its server-side `ua`). Join on
`client_id`, never on `ua`.
