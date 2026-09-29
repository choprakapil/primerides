[STATE]

# Cloud Storage Migration Strategy

**Status:** Pending Implementation  
**Priority:** HIGH (Critical Blocker)  
**Created:** 2026-09-11  
**Estimated Time:** 8-12 hours

---

## CURRENT STATE (PROBLEMS)

### What's Wrong
- **Local Filesystem Storage:** All uploads stored in `/public/uploads/` and `/storage/documents/`
- **Not Scalable:** Files tied to single server instance
- **No Redundancy:** Files lost if server restarts or crashes
- **Security Risk:** Private KYC documents in public directory
- **Deployment Issue:** Files not in version control, won't survive deployment

### Current Upload Locations
```
/public/uploads/
├── vehicles/          # Vehicle images (public)
├── blogs/             # Blog images (public)
├── testimonials/      # Testimonial avatars (public)
└── temp/              # Temporary uploads

/storage/
└── documents/         # KYC documents (private)
    ├── driving-licenses/
    └── aadhaar/
```

### Files Affected
- **KYC Documents:** `tbl_identity_documents.storage_key` (e.g., `documents/driving-licenses/uuid.jpg`)
- **Vehicle Images:** `tbl_cars.primary_image`, `tbl_cars.gallery_images`
- **Blog Images:** `tbl_blogs.featured_image`
- **Testimonial Avatars:** `tbl_testimonials.avatar_url`

---

## RECOMMENDED SOLUTION

### Option 1: AWS S3 (Recommended)
**Pros:**
- Industry standard, highly reliable (99.999999999% durability)
- Built-in CDN via CloudFront
- Fine-grained access control with IAM
- Automatic versioning and lifecycle policies
- Pay-as-you-go pricing (~$0.023/GB/month)

**Cons:**
- Requires AWS account setup
- More complex configuration
- Need to manage IAM policies

**Monthly Cost Estimate:**
- 10 GB storage: ~$0.23/month
- 100,000 GET requests: ~$0.04/month
- 10,000 PUT requests: ~$0.05/month
- **Total: <$1/month initially**

---

### Option 2: Cloudinary (Alternative)
**Pros:**
- Simpler setup (developer-friendly)
- Built-in image transformations (resize, crop, optimize)
- Automatic WebP/AVIF conversion
- Free tier: 25 GB storage + 25 GB bandwidth
- No CDN configuration needed

**Cons:**
- More expensive at scale
- Less control over access policies
- Vendor lock-in

**Monthly Cost Estimate:**
- Free tier covers initial needs
- Paid plans start at $89/month

---

### Recommendation: **AWS S3 + CloudFront**
Best balance of cost, reliability, and control for production deployment.

---

## IMPLEMENTATION PLAN

### Phase 1: AWS Setup (2 hours)

#### 1.1 Create AWS Account & S3 Bucket
```bash
# Bucket naming: primerides-uploads-production
# Region: ap-south-1 (Mumbai) for India deployment
# Encryption: AES-256 server-side encryption
# Versioning: Enabled
# Public access: Blocked by default
```

#### 1.2 Create IAM User with Programmatic Access
**Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::primerides-uploads-production/*",
        "arn:aws:s3:::primerides-uploads-production"
      ]
    }
  ]
}
```

**Environment Variables:**
```env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxx
AWS_S3_BUCKET=primerides-uploads-production
AWS_CLOUDFRONT_URL=https://d1234567890.cloudfront.net
```

#### 1.3 Configure CloudFront CDN
- Origin: S3 bucket
- Cache behavior: Cache images for 1 year
- Custom domain: uploads.primerides.com (optional)
- SSL certificate: AWS Certificate Manager (free)

---

### Phase 2: Code Implementation (4-6 hours)

#### 2.1 Install AWS SDK
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

#### 2.2 Create Storage Service Module

**File:** `src/server/storage/s3.ts`
```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;
const CDN_URL = process.env.AWS_CLOUDFRONT_URL!;

export async function uploadFile(
  file: Buffer,
  folder: string,
  filename: string,
  contentType: string,
  isPrivate: boolean = false
) {
  const key = `${folder}/${filename}`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: isPrivate ? 'private' : 'public-read',
    CacheControl: 'public, max-age=31536000', // 1 year
  }));

  // Return CDN URL for public files
  if (!isPrivate) {
    return `${CDN_URL}/${key}`;
  }
  
  // Return S3 key for private files (generate signed URL on demand)
  return key;
}

export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteFile(key: string) {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));
}

export function generateUniqueFilename(originalName: string): string {
  const ext = originalName.split('.').pop();
  const uuid = crypto.randomUUID();
  return `${uuid}.${ext}`;
}
```

#### 2.3 Update Upload Endpoint

**File:** `src/app/api/v1/admin/upload/route.ts`
```typescript
import { uploadFile, generateUniqueFilename } from '@/server/storage/s3';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const folder = formData.get('folder') as string; // "vehicles", "blogs", "testimonials"
  
  // Validate file
  const buffer = Buffer.from(await file.arrayBuffer());
  // ... validation logic ...
  
  // Upload to S3
  const filename = generateUniqueFilename(file.name);
  const url = await uploadFile(buffer, folder, filename, file.type, false);
  
  return Response.json({
    success: true,
    data: { url, filename }
  });
}
```

#### 2.4 Update KYC Document Upload

**File:** `src/app/api/v1/customer/documents/route.ts`
```typescript
import { uploadFile, generateUniqueFilename } from '@/server/storage/s3';

export async function POST(req: Request) {
  // ... auth check ...
  
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const type = formData.get('type') as string;
  
  // Upload to S3 as private
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = generateUniqueFilename(file.name);
  const storageKey = await uploadFile(
    buffer,
    'documents/kyc',
    filename,
    file.type,
    true // Private
  );
  
  // Save to database
  await prisma.identityDocument.create({
    data: {
      customer_id: userId,
      type,
      storage_key: storageKey, // S3 key, not URL
      file_name: file.name,
      mime_type: file.type,
      status: 'pending'
    }
  });
}
```

#### 2.5 Update Document Download Endpoint

**File:** `src/app/api/v1/documents/[id]/file/route.ts`
```typescript
import { getSignedDownloadUrl } from '@/server/storage/s3';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // ... auth check ...
  
  const document = await prisma.identityDocument.findUnique({
    where: { id: parseInt(params.id) }
  });
  
  // Generate signed URL (1 hour expiry)
  const signedUrl = await getSignedDownloadUrl(document.storage_key, 3600);
  
  // Redirect to signed URL
  return Response.redirect(signedUrl);
}
```

---

### Phase 3: Data Migration (2-3 hours)

#### 3.1 Migration Script

**File:** `scripts/migrate-to-s3.ts`
```typescript
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { uploadFile } from '../src/server/storage/s3';

const prisma = new PrismaClient();

async function migrateVehicleImages() {
  const cars = await prisma.car.findMany();
  
  for (const car of cars) {
    // Migrate primary image
    if (car.primary_image.startsWith('/uploads/')) {
      const localPath = path.join(process.cwd(), 'public', car.primary_image);
      const buffer = fs.readFileSync(localPath);
      const filename = path.basename(car.primary_image);
      
      const newUrl = await uploadFile(
        buffer,
        'vehicles',
        filename,
        'image/jpeg',
        false
      );
      
      await prisma.car.update({
        where: { id: car.id },
        data: { primary_image: newUrl }
      });
      
      console.log(`Migrated: ${car.name} - ${filename}`);
    }
    
    // Migrate gallery images
    if (car.gallery_images) {
      const gallery = car.gallery_images as string[];
      const newGallery = [];
      
      for (const imgPath of gallery) {
        if (imgPath.startsWith('/uploads/')) {
          const localPath = path.join(process.cwd(), 'public', imgPath);
          const buffer = fs.readFileSync(localPath);
          const filename = path.basename(imgPath);
          
          const newUrl = await uploadFile(buffer, 'vehicles', filename, 'image/jpeg', false);
          newGallery.push(newUrl);
        } else {
          newGallery.push(imgPath);
        }
      }
      
      await prisma.car.update({
        where: { id: car.id },
        data: { gallery_images: newGallery }
      });
    }
  }
}

async function migrateKycDocuments() {
  const documents = await prisma.identityDocument.findMany();
  
  for (const doc of documents) {
    if (!doc.storage_key.startsWith('documents/')) continue;
    
    const localPath = path.join(process.cwd(), 'storage', doc.storage_key);
    if (!fs.existsSync(localPath)) {
      console.warn(`File not found: ${localPath}`);
      continue;
    }
    
    const buffer = fs.readFileSync(localPath);
    const filename = path.basename(doc.storage_key);
    
    const newKey = await uploadFile(
      buffer,
      'documents/kyc',
      filename,
      doc.mime_type || 'image/jpeg',
      true // Private
    );
    
    await prisma.identityDocument.update({
      where: { id: doc.id },
      data: { storage_key: newKey }
    });
    
    console.log(`Migrated KYC: ${doc.file_name}`);
  }
}

async function migrateBlogImages() {
  const blogs = await prisma.blog.findMany();
  
  for (const blog of blogs) {
    if (blog.featured_image && blog.featured_image.startsWith('/uploads/')) {
      const localPath = path.join(process.cwd(), 'public', blog.featured_image);
      const buffer = fs.readFileSync(localPath);
      const filename = path.basename(blog.featured_image);
      
      const newUrl = await uploadFile(buffer, 'blogs', filename, 'image/jpeg', false);
      
      await prisma.blog.update({
        where: { id: blog.id },
        data: { featured_image: newUrl }
      });
    }
  }
}

async function migrateTestimonialAvatars() {
  const testimonials = await prisma.testimonial.findMany();
  
  for (const testimonial of testimonials) {
    if (testimonial.avatar_url && testimonial.avatar_url.startsWith('/uploads/')) {
      const localPath = path.join(process.cwd(), 'public', testimonial.avatar_url);
      if (!fs.existsSync(localPath)) continue;
      
      const buffer = fs.readFileSync(localPath);
      const filename = path.basename(testimonial.avatar_url);
      
      const newUrl = await uploadFile(buffer, 'testimonials', filename, 'image/jpeg', false);
      
      await prisma.testimonial.update({
        where: { id: testimonial.id },
        data: { avatar_url: newUrl }
      });
    }
  }
}

async function main() {
  console.log('Starting S3 migration...');
  
  await migrateVehicleImages();
  console.log('✅ Vehicle images migrated');
  
  await migrateKycDocuments();
  console.log('✅ KYC documents migrated');
  
  await migrateBlogImages();
  console.log('✅ Blog images migrated');
  
  await migrateTestimonialAvatars();
  console.log('✅ Testimonial avatars migrated');
  
  console.log('Migration complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Run Migration:**
```bash
npx tsx scripts/migrate-to-s3.ts
```

---

### Phase 4: Testing & Verification (1-2 hours)

#### 4.1 Test Checklist
- [ ] Upload new vehicle image → Verify appears on vehicle card
- [ ] Upload blog featured image → Verify appears on blog page
- [ ] Upload KYC document → Verify signed URL generated
- [ ] Download KYC document → Verify file downloads correctly
- [ ] Delete vehicle → Verify image deleted from S3
- [ ] Check CloudFront cache → Verify images served from CDN
- [ ] Test signed URL expiry → Verify expires after 1 hour
- [ ] Test mobile app image loading → Verify S3 URLs work

#### 4.2 Performance Verification
```bash
# Check image load times
curl -w "@curl-format.txt" -o /dev/null -s https://d1234567890.cloudfront.net/vehicles/car1.jpg

# Expected: < 200ms for CDN hit
```

---

### Phase 5: Cleanup & Deployment (1 hour)

#### 5.1 Update .gitignore
```gitignore
# Remove these from git (if accidentally committed)
/public/uploads/*
/storage/documents/*

# Keep directory structure but not contents
!/public/uploads/.gitkeep
!/storage/documents/.gitkeep
```

#### 5.2 Remove Local Files
```bash
# After verifying migration success
rm -rf public/uploads/*
rm -rf storage/documents/*

# Keep .gitkeep files for directory structure
touch public/uploads/.gitkeep
touch storage/documents/.gitkeep
```

#### 5.3 Update .env.example
```env
# AWS S3 Configuration (Required for production)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=primerides-uploads-production
AWS_CLOUDFRONT_URL=https://d1234567890.cloudfront.net
```

#### 5.4 Update Documentation
- Update `README.md` with S3 setup instructions
- Update `docs/DEPLOYMENT.md` with AWS configuration
- Update `PROJECT_CHECKLIST.md` - mark cloud storage as complete

---

## ROLLBACK PLAN

If migration fails:

1. **Keep Local Files:** Don't delete until migration verified
2. **Database Rollback:** Keep backup of database before migration
3. **Code Rollback:** Git revert to previous storage module
4. **S3 Cleanup:** Delete test uploads from S3 bucket

**Rollback Script:**
```sql
-- Revert vehicle images
UPDATE tbl_cars 
SET primary_image = REPLACE(primary_image, 'https://d1234567890.cloudfront.net/vehicles/', '/uploads/vehicles/')
WHERE primary_image LIKE 'https://d1234567890.cloudfront.net%';

-- Revert KYC documents
UPDATE tbl_identity_documents
SET storage_key = REPLACE(storage_key, 'documents/kyc/', 'documents/')
WHERE storage_key LIKE 'documents/kyc/%';
```

---

## SECURITY CONSIDERATIONS

### Private Documents (KYC)
- ✅ Stored with `ACL: private` (not publicly accessible)
- ✅ Signed URLs with 1-hour expiry
- ✅ Signed URLs require authentication to generate
- ✅ No direct S3 bucket access from frontend

### Public Images (Vehicles, Blogs)
- ✅ Served via CloudFront CDN
- ✅ HTTPS only
- ✅ Cache headers for performance
- ✅ No sensitive data in public images

### S3 Bucket Security
- ✅ Block all public access by default
- ✅ IAM user with minimal permissions (no DeleteBucket)
- ✅ Server-side encryption enabled (AES-256)
- ✅ Versioning enabled (can recover deleted files)
- ✅ Bucket logging enabled for audit trail

---

## COST OPTIMIZATION

### Storage Lifecycle Policies
```json
{
  "Rules": [
    {
      "Id": "ArchiveOldKycDocuments",
      "Status": "Enabled",
      "Filter": { "Prefix": "documents/kyc/" },
      "Transitions": [
        {
          "Days": 365,
          "StorageClass": "GLACIER_IR"
        }
      ]
    },
    {
      "Id": "DeleteTempUploads",
      "Status": "Enabled",
      "Filter": { "Prefix": "temp/" },
      "Expiration": { "Days": 7 }
    }
  ]
}
```

### CloudFront Cost Reduction
- Enable CloudFront compression (saves 50-70% bandwidth)
- Set proper cache TTLs (reduce origin requests)
- Use Origin Shield for high-traffic files

**Estimated Monthly Cost at Scale:**
- 100 GB storage: ~$2.30/month
- 1 million requests: ~$4/month
- 500 GB bandwidth: ~$40/month (CloudFront)
- **Total: ~$50/month for moderate traffic**

---

## NEXT STEPS

1. ✅ Document migration strategy (THIS FILE)
2. ⏳ Create AWS account and S3 bucket
3. ⏳ Implement S3 storage module
4. ⏳ Update upload endpoints
5. ⏳ Run migration script
6. ⏳ Test all upload/download flows
7. ⏳ Delete local files after verification
8. ⏳ Deploy to production with S3 config

**Start Date:** TBD (awaiting AWS account setup)  
**Target Completion:** Within 2-3 days of starting

---

## ALTERNATIVE: Quick Fix (Not Recommended)

If AWS setup is blocked, temporary workaround:

1. Keep local filesystem storage
2. Add `/public/uploads` to git with `.gitignore` exceptions
3. Include files in deployment package
4. Accept risk of file loss on server restart

**This is NOT production-ready** and should only be used for demo/testing.
