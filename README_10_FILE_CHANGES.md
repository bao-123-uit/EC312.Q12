# Ghi Chu 10 File Da Chinh Sua (CSRF Demo + Cookie Session)

Tai lieu nay tong hop 10 file quan trong da duoc chinh sua de phuc vu:
- Demo lo hong CSRF trong moi truong lab.
- Chuyen endpoint doi email sang cookie-based session.
- Hien thi demo truc quan tren giao dien login/profile.

## 1) backend/src/app.module.ts
- Chinh sua chinh:
  - Import va dang ky CsrfLabModule vao danh sach imports.
- Doan code da sua:
```ts
import { CsrfLabModule } from './csrf-lab/csrf-lab.module';

imports: [
  ...,
  CsrfLabModule,
]
```
- Muc dich:
  - Bat cac route lab duoi /csrf-lab de co endpoint demo insecure va secure.

## 2) backend/src/auth/auth.controller.ts
- Chinh sua chinh:
  - Login endpoint set cookie access_token (httpOnly).
  - change-email endpoint doi guard tu JwtAuthGuard sang CookieAuthGuard.
  - change-email sau khi doi thanh cong se refresh lai cookie access_token moi.
  - Them typing DTO theo kieu definite assignment (!).
- Doan code da sua:
```ts
class LoginDto {
  email!: string;
  password!: string;
}

@Post('login')
async login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) {
  const result = await this.authService.login(body.email, body.password);
  response.cookie('access_token', result.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return result;
}

@Put('change-email')
@UseGuards(CookieAuthGuard)
async changeEmail(@CurrentUser('id') userId: string, @Body() body: ChangeEmailDto, @Res({ passthrough: true }) response: Response) {
  const result = await this.authService.changeEmail(userId, body.newEmail);
  if (result?.access_token) {
    response.cookie('access_token', result.access_token, { httpOnly: true, sameSite: 'lax', secure: false, path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 });
  }
  return result;
}
```
- Muc dich:
  - Chuyen auth cua endpoint doi email sang cookie-based session.
  - Dam bao token trong cookie duoc cap nhat khi email thay doi.

## 3) backend/src/auth/auth.module.ts
- Chinh sua chinh:
  - Dang ky CookieAuthGuard vao providers va exports.
- Doan code da sua:
```ts
import { JwtAuthGuard, CookieAuthGuard, RolesGuard, CustomerGuard } from './guards';

providers: [AuthService, JwtAuthGuard, CookieAuthGuard, RolesGuard, CustomerGuard],
exports: [AuthService, JwtAuthGuard, CookieAuthGuard, RolesGuard, CustomerGuard],
```
- Muc dich:
  - Cho phep su dung guard doc token tu cookie tai auth module.

## 4) backend/src/auth/guards/cookie-auth.guard.ts
- Chinh sua chinh:
  - Tao guard moi de doc access_token tu header Cookie.
  - Verify token qua AuthService.validateToken().
  - Gan request.user khi hop le.
- Doan code da sua:
```ts
const cookieHeader = request.headers.cookie || '';
const token = this.extractCookieToken(cookieHeader, 'access_token');
if (!token) {
  throw new UnauthorizedException('Khong tim thay access_token trong cookie');
}

const user = await this.authService.validateToken(token);
request.user = user;
```
- Muc dich:
  - Thay the co che buoc Authorization Bearer cho endpoint can cookie session.

## 5) backend/src/auth/guards/index.ts
- Chinh sua chinh:
  - Export them cookie-auth.guard.
- Doan code da sua:
```ts
export * from './jwt-auth.guard';
export * from './cookie-auth.guard';
export * from './roles.guard';
export * from './customer.guard';
```
- Muc dich:
  - Dong bo diem import guard trong toan bo auth module.

## 6) backend/src/csrf-lab/csrf-lab.module.ts
- Chinh sua chinh:
  - Tao module csrf-lab va import ConfigModule.
- Doan code da sua:
```ts
@Module({
  imports: [ConfigModule],
  controllers: [CsrfLabController],
  providers: [CsrfLabService],
})
export class CsrfLabModule {}
```
- Muc dich:
  - Tach rieng khu vuc lab demo CSRF khoi nghiep vu production.

## 7) backend/src/csrf-lab/csrf-lab.controller.ts
- Chinh sua chinh:
  - Tao cac endpoint:
    - POST /csrf-lab/login
    - GET /csrf-lab/me
    - POST /csrf-lab/insecure/change-email
    - GET /csrf-lab/secure/csrf-token
    - POST /csrf-lab/secure/change-email
  - login set cookie csrf_lab_session.
  - Ho tro victimEmail de chon user muc tieu demo.
- Doan code da sua:
```ts
@Post('login')
async login(@Body() body: LoginLabDto, @Res({ passthrough: true }) response: Response) {
  const { sessionId, csrfToken, user } = await this.csrfLabService.loginAsVictim(body?.victimEmail);
  response.cookie('csrf_lab_session', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
  });
  return { success: true, user, csrfToken };
}

@Post('insecure/change-email')
async changeEmailInsecure(@Req() request: Request, @Body() body: ChangeEmailDto) {
  const sessionId = this.getSessionIdFromCookie(request);
  return await this.csrfLabService.changeEmailInsecure(sessionId, body.newEmail);
}
```
- Muc dich:
  - Cung cap day du API lab de so sanh endpoint de tan cong va endpoint da bao ve.

## 8) backend/src/csrf-lab/csrf-lab.service.ts
- Chinh sua chinh:
  - Chuyen tu in-memory map sang ghi truc tiep Supabase.
  - changeEmailInsecure va changeEmailSecure deu update bang users that su.
  - Kiem tra trung email, validate email, va kiem tra CSRF token (secure mode).
- Doan code da sua:
```ts
this.supabase = createClient(
  this.configService.get<string>('SUPABASE_URL')!,
  this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
);

const { data: updatedUser, error: updateError } = await this.supabase
  .from('users')
  .update({
    email: normalizedEmail,
    email_verified: false,
    updated_at: new Date().toISOString(),
  })
  .eq('id', user.id)
  .select('id,email')
  .single();
```
- Muc dich:
  - Demo co ket qua thay doi du lieu that trong database de chup bang chung.

## 9) fontend/lib/api/client.ts
- Chinh sua chinh:
  - axios client bat withCredentials: true.
- Doan code da sua:
```ts
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```
- Muc dich:
  - Trinh duyet gui/nhan cookie giua frontend localhost:3000 va backend localhost:3001.
  - Bat buoc de luong cookie-auth hoat dong dung.

## 10) fontend/src/app/(public)/login/page.tsx
- Chinh sua chinh:
  - Them giao dien doi Gmail tren trang profile sau dang nhap.
  - Them ham handleChangeEmail() goi API /auth/change-email.
  - Them nut demo CSRF insecure de goi /csrf-lab/login va /csrf-lab/insecure/change-email.
  - Hien thi thong bao loi/thanh cong va email victim trong lab.
- Doan code da sua:
```tsx
const [showEmailEditor, setShowEmailEditor] = useState(false);
const [newEmail, setNewEmail] = useState('');
const [emailLoading, setEmailLoading] = useState(false);
const [emailError, setEmailError] = useState('');
const [emailSuccess, setEmailSuccess] = useState('');

const handleChangeEmail = async (e: React.FormEvent) => {
  e.preventDefault();
  const result = await changeEmail(newEmail);
  ...
};

const handleInsecureEmailDemo = async () => {
  await fetch(`${BACKEND_BASE_URL}/csrf-lab/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ victimEmail: user?.email || undefined }),
  });

  await fetch(`${BACKEND_BASE_URL}/csrf-lab/insecure/change-email`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newEmail }),
  });
};
```
- Muc dich:
  - Demo truc quan ngay tren UI: doi email binh thuong va doi email qua endpoint insecure.

---

## Ket Qua Tong The
- Endpoint doi email da chuyen sang cookie-based session.
- Da co bo API csrf-lab de test insecure vs secure.
- UI da co khung thao tac de demo va quan sat ket qua.
- Luong lab co kha nang ghi truc tiep vao database users.

## Luu Y Van Hanh
- Backend can chay tren cong 3001.
- Frontend can chay tren cong 3000.
- Bien moi truong Supabase (URL + service role key) phai hop le.
- Cookie secure hien de false de test local HTTP; khi production can dung HTTPS + secure=true.

---

## Bang Tom Tat Nhanh (3 Cot)

| File | Doan code thay doi trong tam | Tac dong chinh |
|---|---|---|
| backend/src/app.module.ts | Them `CsrfLabModule` vao imports | Mo route lab `/csrf-lab` |
| backend/src/auth/auth.controller.ts | `login()` set cookie `access_token`; `change-email` dung `CookieAuthGuard` | Chuyen doi email sang cookie session |
| backend/src/auth/auth.module.ts | Register va export `CookieAuthGuard` | Guard moi duoc su dung toan module |
| backend/src/auth/guards/cookie-auth.guard.ts | Doc `access_token` tu Cookie, validate token, gan `request.user` | Xac thuc qua cookie thay cho Bearer |
| backend/src/auth/guards/index.ts | Export them `cookie-auth.guard` | Dong bo import guard |
| backend/src/csrf-lab/csrf-lab.module.ts | Tao module csrf-lab + `ConfigModule` | Tach rieng lab CSRF |
| backend/src/csrf-lab/csrf-lab.controller.ts | Them endpoint login/me/insecure/secure, set cookie `csrf_lab_session` | Co API demo tan cong va phong ve |
| backend/src/csrf-lab/csrf-lab.service.ts | Doi tu in-memory sang Supabase update bang `users` | Ket qua demo ghi truc tiep DB |
| fontend/lib/api/client.ts | axios `withCredentials: true` | Browser gui/nhan cookie cross-port |
| fontend/src/app/(public)/login/page.tsx | Them UI doi Gmail + nut demo insecure CSRF | Demo truc quan tren giao dien nguoi dung |

### Huong Dan Doc Bang
- Cot 1: File duoc sua.
- Cot 2: Dau hieu code ban can check nhanh.
- Cot 3: Gia tri nghiep vu/bao cao ma thay doi tao ra.
