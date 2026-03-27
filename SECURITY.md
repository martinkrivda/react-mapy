# Security Policy

## Supported Versions

Security fixes are provided on a best-effort basis for:

| Version                      | Supported |
| ---------------------------- | --------- |
| Latest published npm version | Yes       |
| `main` branch                | Yes       |
| Older published versions     | No        |

Because this is a fast-moving library, security fixes are typically released
only for the latest published version rather than backported to older releases.

## Reporting a Vulnerability

Please do **not** open a public GitHub issue for suspected security
vulnerabilities.

Instead, report vulnerabilities privately to:

`martinkrivda(at)seznam.cz`

If possible, include:

- a clear description of the issue
- affected package version(s)
- impact assessment
- reproduction steps or a minimal proof of concept
- suggested mitigation if known

You can write in Czech or English.

## What to Expect

After a report is received, the maintainer will try to:

- acknowledge the report within a reasonable time
- reproduce and assess the issue
- determine whether the issue affects the published package, documentation, or
  only local/example code
- prepare a fix or mitigation when confirmed
- coordinate responsible disclosure if the issue is valid

Response and remediation times are best effort and may vary depending on
severity, complexity, and maintainer availability.

## Disclosure Process

When a report is confirmed:

1. the issue will be investigated privately
2. a fix will be prepared for the latest supported version
3. a new package version will be released when appropriate
4. public disclosure will follow after a fix or mitigation is available, when
   possible

If the report is determined not to be a security issue, it may be redirected to
the normal issue tracker as a regular bug.

## Scope

This policy applies to:

- the published `react-mapy` package
- source code in this repository
- release and build configuration maintained in this repository

This policy does not guarantee support for:

- third-party services outside this repository
- vulnerabilities that exist only in a consumer application's integration code
- misconfiguration in downstream deployments

## Dependency Issues

If a vulnerability comes from a direct or transitive dependency, please still
report it. Even when the root cause is upstream, the maintainer can evaluate
whether a dependency upgrade, workaround, or advisory release is needed for
`react-mapy`.
