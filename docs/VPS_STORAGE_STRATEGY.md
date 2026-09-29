# Local/VPS Storage Strategy for Hostinger KVM

**Date:** 2026-09-11  
**Hosting:** Hostinger KVM VPS  
**Storage:** Local filesystem with backup strategy

---

## HOSTING ENVIRONMENT

### Hostinger KVM VPS
- **Type:** KVM Virtual Private Server
- **Storage:** Local SSD storage
- **Backup:** Manual/automated backup strategy required
- **Scalability:** Vertical scaling (upgrade VPS plan)

---

## STORAGE STRUCTURE

### Recommended Directory Structure
```
/var/www/primerides/
├── app/                    # Next.js application
├── public/
│   └── uploads/           # Public uploads (vehicles, blogs, testimonials)
│       ├── vehicles/
│       ├── blogs/
│       └── testimonials/
├── storage/
│   ├── documents/         # Private KYC documents
│   │   ├── driving-licenses/
│   │   └── aadhaar/
│   └── backups/          # Local backups
└── logs/                 # Application logs
```

### Permissions
```bash
# Set proper ownership
sudo chown -R www-data:www-data /var/www/primerides/storage
sudo chown -R www-data:www-data /var/www/primerides/public/uploads

# Set proper permissions
sudo chmod -R 755 /var/www/primerides/public/uploads  # Public read
sudo chmod -R 700 /var/www/primerides/storage        # Private only
```

---

## BACKUP STRATEGY

### Daily Automated Backups

**Cron Job** (`/etc/cron.daily/primerides-backup.sh`):
```bash
#!/bin/bash

BACKUP_DIR="/var/backups/primerides"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
APP_DIR="/var/www/primerides"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup uploads and documents
tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz $APP_DIR/public/uploads
tar -czf $BACKUP_DIR/documents-$DATE.tar.gz $APP_DIR/storage/documents

# Backup database
mysqldump -u primerides_user -p'password' primerides_db > $BACKUP_DIR/db-$DATE.sql
gzip $BACKUP_DIR/db-$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Optional: Copy to remote backup location
# rsync -avz $BACKUP_DIR user@backup-server:/backups/primerides/
```

**Install:**
```bash
sudo chmod +x /etc/cron.daily/primerides-backup.sh
```

---

## SECURITY CONSIDERATIONS

### 1. Private Document Access
**File:** `src/server/storage/index.ts`
```typescript
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const STORAGE_ROOT = process.env.STORAGE_PATH || '/var/www/primerides/storage';
const UPLOAD_ROOT = process.env.UPLOAD_PATH || '/var/www/primerides/public/uploads';

// Generate secure document path
export function savePrivateDocument(buffer: Buffer, folder: string, filename: string): string {
  const safeName = crypto.randomUUID() + path.extname(filename);
  const dir = path.join(STORAGE_ROOT, 'documents', folder);
  const filePath = path.join(dir, safeName);
  
  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
  
  // Write with restricted permissions
  fs.writeFileSync(filePath, buffer, { mode: 0o600 });
  
  return `documents/${folder}/${safeName}`;
}

// Serve private document (with authentication check)
export function readPrivateDocument(storageKey: string): Buffer {
  const filePath = path.join(STORAGE_ROOT, storageKey);
  
  // Security: Prevent path traversal
  if (!filePath.startsWith(STORAGE_ROOT)) {
    throw new Error('Invalid file path');
  }
  
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }
  
  return fs.readFileSync(filePath);
}

// Save public upload
export function savePublicUpload(buffer: Buffer, folder: string, filename: string): string {
  const safeName = crypto.randomUUID() + path.extname(filename);
  const dir = path.join(UPLOAD_ROOT, folder);
  const filePath = path.join(dir, safeName);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
  }
  
  fs.writeFileSync(filePath, buffer, { mode: 0o644 });
  
  return `/uploads/${folder}/${safeName}`;
}
```

### 2. Nginx Configuration
**File:** `/etc/nginx/sites-available/primerides`
```nginx
server {
    listen 80;
    server_name primerides.com www.primerides.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name primerides.com www.primerides.com;
    
    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/primerides.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/primerides.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Block direct access to storage directory
    location /storage/ {
        deny all;
        return 404;
    }
    
    # Serve public uploads with caching
    location /uploads/ {
        alias /var/www/primerides/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## DISK SPACE MONITORING

### Monitor Storage Usage
```bash
# Check disk usage
df -h /var/www/primerides

# Check storage directory size
du -sh /var/www/primerides/storage
du -sh /var/www/primerides/public/uploads

# Monitor with alert
cat > /usr/local/bin/check-primerides-storage.sh << 'EOF'
#!/bin/bash
THRESHOLD=80
USAGE=$(df /var/www/primerides | tail -1 | awk '{print $5}' | sed 's/%//')

if [ $USAGE -gt $THRESHOLD ]; then
    echo "WARNING: PrimeRides storage at ${USAGE}%" | mail -s "Storage Alert" admin@primerides.com
fi
EOF

chmod +x /usr/local/bin/check-primerides-storage.sh

# Add to cron (check hourly)
echo "0 * * * * /usr/local/bin/check-primerides-storage.sh" | crontab -
```

---

## DEPLOYMENT PROCESS

### Initial Deployment
```bash
# 1. Clone repository
cd /var/www
git clone https://github.com/yourusername/primerides.git
cd primerides

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
nano .env  # Configure production values

# 4. Build application
npm run build

# 5. Set up PM2 for process management
npm install -g pm2
pm2 start npm --name "primerides" -- start
pm2 save
pm2 startup

# 6. Set up directories
sudo mkdir -p /var/www/primerides/storage/documents/{driving-licenses,aadhaar}
sudo mkdir -p /var/www/primerides/public/uploads/{vehicles,blogs,testimonials}
sudo chown -R www-data:www-data /var/www/primerides/storage
sudo chmod -R 700 /var/www/primerides/storage
```

### Updates & Redeployment
```bash
cd /var/www/primerides
git pull origin main
npm install
npm run build
pm2 restart primerides
```

---

## SCALING CONSIDERATIONS

### Vertical Scaling (VPS Upgrade)
- Start: KVM 2 (2 vCPU, 4GB RAM, 50GB SSD)
- Scale: KVM 4 (4 vCPU, 8GB RAM, 100GB SSD)
- Scale: KVM 8 (8 vCPU, 16GB RAM, 200GB SSD)

### Storage Growth Estimates
| Item | Average Size | Est. Count/Year | Total/Year |
|------|--------------|-----------------|------------|
| Vehicle Image | 500 KB | 200 | 100 MB |
| KYC Document | 2 MB | 1,000 customers × 3 docs | 6 GB |
| Blog Image | 300 KB | 100 articles | 30 MB |
| Testimonial Avatar | 100 KB | 500 | 50 MB |
| **Total** | | | **~7 GB/year** |

**50GB SSD sufficient for 7+ years of content**

---

## DISASTER RECOVERY

### Recovery from Backup
```bash
# 1. Restore uploads
cd /var/www/primerides
tar -xzf /var/backups/primerides/uploads-YYYY-MM-DD.tar.gz

# 2. Restore documents
tar -xzf /var/backups/primerides/documents-YYYY-MM-DD.tar.gz

# 3. Restore database
gunzip < /var/backups/primerides/db-YYYY-MM-DD.sql.gz | mysql -u primerides_user -p primerides_db

# 4. Restart application
pm2 restart primerides
```

### RTO/RPO Targets
- **Recovery Time Objective (RTO):** < 1 hour
- **Recovery Point Objective (RPO):** < 24 hours (daily backups)

---

## MONITORING & MAINTENANCE

### Health Checks
```bash
# Application health
curl https://primerides.com/api/health

# Storage health
df -h | grep primerides

# Process health
pm2 status

# Database health
systemctl status mysql

# Nginx health
systemctl status nginx
```

### Weekly Maintenance Tasks
- [ ] Review disk usage
- [ ] Verify backups completed
- [ ] Check error logs
- [ ] Update dependencies (if needed)
- [ ] Review rate limit violations

---

## COST COMPARISON

### Hostinger KVM vs Cloud Storage

| Item | Hostinger KVM 8 | AWS S3 + CloudFront |
|------|-----------------|---------------------|
| Monthly Cost | ~$15-30/month | ~$50-100/month |
| Storage | 200 GB included | Pay per GB ($0.023/GB) |
| Bandwidth | Unlimited | Pay per GB ($0.085/GB) |
| Backup | Manual/scripted | Automatic versioning |
| Scalability | Vertical only | Infinite |
| Management | Manual | Managed service |

**Recommendation:** Hostinger VPS is cost-effective for initial launch. Consider cloud migration if traffic exceeds 10,000+ visitors/day.

---

## SECURITY BEST PRACTICES

1. ✅ Block direct access to `/storage/` directory
2. ✅ Set restrictive file permissions (700 for private, 755 for public)
3. ✅ Use HTTPS with Let's Encrypt SSL certificates
4. ✅ Enable fail2ban for SSH brute force protection
5. ✅ Set up firewall (UFW) allowing only ports 80, 443, 22
6. ✅ Regular security updates: `sudo apt update && sudo apt upgrade`
7. ✅ Monitor access logs: `/var/log/nginx/access.log`

---

## ENVIRONMENT VARIABLES

```env
# Storage paths for VPS
STORAGE_PATH=/var/www/primerides/storage
UPLOAD_PATH=/var/www/primerides/public/uploads

# Database
DATABASE_URL=mysql://primerides_user:password@localhost:3306/primerides_db

# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://primerides.com
```

---

## CONCLUSION

✅ **VPS hosting with local storage is viable for PrimeRides**  
✅ **Cost-effective solution ($15-30/month vs $50-100/month cloud)**  
✅ **Automated backups prevent data loss**  
✅ **Secure file permissions protect private KYC documents**  
✅ **Nginx configuration blocks direct storage access**  
✅ **200GB SSD sufficient for 7+ years of content**

**Next Steps:**
1. Set up Hostinger KVM VPS
2. Configure Nginx and SSL certificates
3. Deploy application with PM2
4. Set up automated backup cron jobs
5. Configure monitoring and alerts
