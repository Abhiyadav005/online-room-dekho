# Deployment checklist

1. Build both packages with `npm run build` and run `npm test`.
2. Provision MongoDB with a least-privilege database user and network access
   restricted to the API runtime.
3. Set production environment variables in the host's secret manager. Use long,
   independent JWT secrets and never reuse development values.
4. Set `FRONTEND_ORIGIN` to the exact deployed web origin and serve the API only
   over TLS behind a proxy/load balancer.
5. Configure a production SMS provider, object storage bucket with private write
   access, and map/AI providers. Keep provider keys server-side.
6. Configure log aggregation and alerts for failed OTP sends, rate-limit spikes,
   authentication failures, and provider failures. Never ship OTPs, tokens, or
   passwords in logs.
7. Run the health endpoint through the load balancer and enable database backups.
8. Perform a smoke test for tenant, owner, and administrator authorization;
   listing approval; OTP verification; and image-upload limits.
