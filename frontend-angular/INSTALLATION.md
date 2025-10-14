# Angular Frontend Installation & Setup

## Quick Commands

### Install Dependencies
```bash
cd frontend-angular
npm install
```

### Start Development Server
```bash
npm start
# or
ng serve
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

## Installation Status

Run these commands in order:

### 1. Navigate to Directory
```bash
cd "c:\Santhosh WPM\PBL\PBL-collabstudy\frontend-angular"
```

### 2. Install All Dependencies
```bash
npm install --legacy-peer-deps
```

If you encounter peer dependency issues, use:
```bash
npm install --legacy-peer-deps --force
```

### 3. Verify Installation
```bash
npm list --depth=0
```

### 4. Start the App
```bash
npm start
```

Expected output:
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

## Troubleshooting

### Issue: npm command not found
**Solution:** Install Node.js from https://nodejs.org/

### Issue: Angular CLI not found
**Solution:** 
```bash
npm install -g @angular/cli
```

### Issue: Port 4200 already in use
**Solution:**
```bash
ng serve --port 4300
```

### Issue: Dependency conflicts
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### Issue: TypeScript errors
**Solution:** Ensure TypeScript version matches:
```bash
npm install typescript@5.2.2 --save-dev
```

## Environment Setup

### Development
File: `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

### Production
File: `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'
};
```

## Backend Connection

Make sure your backend is running:
```bash
# In the backend directory
cd backend
npm start
```

Backend should be available at: `http://localhost:5000`

## Browser

Open your browser and navigate to:
```
http://localhost:4200
```

Default credentials (if seeded):
- Email: `admin@example.com`
- Password: `password123`

## File Structure Verification

Check that these directories exist:
- ✅ `src/app/core/services/`
- ✅ `src/app/core/guards/`
- ✅ `src/app/core/interceptors/`
- ✅ `src/app/pages/`
- ✅ `src/app/layout/`
- ✅ `src/environments/`

## NPM Scripts Available

```json
{
  "start": "ng serve",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test",
  "lint": "ng lint"
}
```

## Development Workflow

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend (in new terminal):**
   ```bash
   cd frontend-angular
   npm start
   ```

3. **Open Browser:**
   Visit `http://localhost:4200`

4. **Make Changes:**
   - Edit files in `src/app/`
   - Hot reload will update the browser automatically

5. **Build for Production:**
   ```bash
   npm run build
   ```
   Output will be in `dist/study-collab-angular/`

## Success Checklist

- ✅ Node.js installed (v18+)
- ✅ npm installed (v9+)
- ✅ Dependencies installed (`npm install`)
- ✅ Backend running on port 5000
- ✅ Frontend running on port 4200
- ✅ Can access login page
- ✅ Can authenticate
- ✅ Dashboard loads properly

## Additional Resources

- **Angular Docs:** https://angular.io/docs
- **Angular Material:** https://material.angular.io/
- **RxJS:** https://rxjs.dev/
- **TypeScript:** https://www.typescriptlang.org/docs/

## Support Commands

### Check Node/npm versions:
```bash
node --version
npm --version
```

### Check Angular CLI version:
```bash
ng version
```

### Clear npm cache:
```bash
npm cache clean --force
```

### Update npm:
```bash
npm install -g npm@latest
```

### Update Angular CLI:
```bash
npm install -g @angular/cli@latest
```

---

**Ready to start!** Run `npm start` in the `frontend-angular` directory.
