## Develop with s3 + cloudfront

## Deploy

```bash
npm run build

aws s3 sync out/ s3://rennlabs-mcp-server/

aws cloudfront create-invalidation --distribution-id E30OIOXVTXLB97 --paths "/*"
```
