# Flores Victoria Helm Chart

This Helm chart deploys the complete Flores Victoria e-commerce application to Kubernetes.

## Prerequisites

- Kubernetes 1.16+
- Helm 3.0+

## Installing the Chart

To install the chart with the release name `flores-victoria`:

```bash
helm install flores-victoria ./flores-victoria
```

## Uninstalling the Chart

To uninstall/delete the `flores-victoria` deployment:

```bash
helm uninstall flores-victoria
```

## Configuration

The following table lists the configurable parameters of the chart and their default values.

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `namespace` | Kubernetes namespace to deploy to | `flores-victoria` |
| `secrets.jwtSecret` | JWT secret for authentication | `"secret"` |
| `secrets.dbPassword` | Database password | `"password"` |
| `secrets.redisPassword` | Redis password | `"redispass"` |

For more configuration options, see [values.yaml](values.yaml).

## Deploying with Custom Values

You can override the default values by providing a custom values file:

```bash
helm install flores-victoria ./flores-victoria -f custom-values.yaml
```