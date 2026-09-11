# Changelog

## [Unreleased]
- Upgrade the `dd-trace` and `express` dev dependencies to their latest minor version.
- Move the `qs` override to `^6.16.0`. `6.16.0` is the first version that enforces `arrayLimit` on a bracket key, so the earlier `6.14.2` pin only closed half of the bypass. The caret lets the override pick up later patches on its own.

## [0.6.0] - 2024-11-27
- Redact specific properties in req and res

## [0.5.9] - 2024-10-30
- Upgrade to `dd-trace` and `express` to their latest minor version.

## [0.5.8] - 2024-10-23
- Redact req, res, context.req and context.res from logs - req and res at root level are added by pinot-http middleware

## [0.5.3 - 0.5.7] - 2024-10-23
- Do not use

## [0.5.2] - 2024-09-11
- Upgraded `dd-trace` to latest version

## [0.2.0] - 2021-07-07
- Forgot to tsc/build – use this instead of `v.0.1.0`

## [0.1.0] - 2021-07-07
- Upgraded `dd-trace` to latest version for newer Node version support.
