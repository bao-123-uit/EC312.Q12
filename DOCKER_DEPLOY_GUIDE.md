# 🐳 Docker Deployment Guide - EC312.Q12 (với Supabase)

## 📋 Yêu cầu

- Docker Desktop cài đặt: https://www.docker.com/products/docker-desktop/
- Git
- File `.env` backend có các credentials (Supabase, Email, PayOS, Facebook)

---

## 🚀 Chạy Local với Docker

### 1. Chuẩn bị

```bash
# Vào thư mục project
cd c:\EC312.Q12

# Copy file env template
cp .env.docker .env.docker.local
```

### 2. Cấu hình `.env.docker.local`

Mở file `.env.docker.local` và update các giá trị:

```ini
# Lấy từ Supabase project settings
SUPABASE_URL=https://zrmbsfzamyhbvufvdbwx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Giữ nguyên hoặc chỉnh sửa
EMAIL_USER=contact.goattech.vn@gmail.com
EMAIL_PASS=yxnc yvbt wuai upcp

# PayOS
PAYOS_CLIENT_ID=b785a960-4c3b-4003-8448-698c5c4b1858
PAYOS_API_KEY=2ea8a0e4-ccf7-4fe2-82eb-7ff83649273d
PAYOS_CHECKSUM_KEY=e12f67d925a177541ce2efaa25ff8fd8878ad414dcebe5e48c21f0ff3556d8af
```

### 3. Build & Chạy

```bash
# Build images
docker-compose build

# Chạy containers
docker-compose up -d

# Kiểm tra status
docker-compose ps
```

**Output mong đợi:**
```
NAME                 STATUS              PORTS
ec312-backend       Up (healthy)        0.0.0.0:3001->3001/tcp
ec312-frontend      Up (healthy)        0.0.0.0:3000->3000/tcp
```

### 4. Truy cập

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

---

## 📊 Theo dõi & Debug

### View logs
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Tất cả logs
docker-compose logs -f
```

### Truy cập container shell
```bash
# Shell backend
docker-compose exec backend sh

# Shell frontend
docker-compose exec frontend sh
```

### Test connection
```bash
# Test backend
curl http://localhost:3001

# Test frontend
curl http://localhost:3000
```

---

## 🛑 Dừng & Làm sạch

```bash
# Dừng containers
docker-compose down

# Dừng và xóa volumes (xóa cả uploaded files)
docker-compose down -v

# Rebuild từ đầu
docker-compose down -v && docker-compose build --no-cache && docker-compose up -d
```

---

## 🌐 Deploy lên VPS (DigitalOcean/AWS/Linode)

### 1. SSH vào server

```bash
ssh root@your_server_ip
```

### 2. Cài Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm current user vào docker group
sudo usermod -aG docker $USER
```

### 3. Clone repository

```bash
git clone your_repo_url
cd EC312.Q12
```

### 4. Cấu hình environment

```bash
# Copy env template
cp .env.docker .env.production

# Edit environment cho production
nano .env.production
```

**Quan trọng - Chỉnh sửa:**
```ini
# Thay localhost thành domain thực
FRONTEND_URL=https://yourdomain.com
PAYOS_RETURN_URL=https://yourdomain.com/payment-result
PAYOS_CANCEL_URL=https://yourdomain.com/payment-cancel
```

### 5. Build & Deploy

```bash
# Build images
docker-compose build

# Run in background
docker-compose up -d

# Verify
docker-compose ps
```

### 6. Setup Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/ec312
```

```nginx
upstream backend {
    server 127.0.0.1:3001;
}

upstream frontend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Redirect tất cả traffic đến https
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend requests
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API requests
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support (nếu cần)
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable config:
```bash
sudo ln -s /etc/nginx/sites-available/ec312 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Setup SSL với Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 8. Tạo auto-renewal

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 📦 Các lệnh hữu ích

```bash
# Xem resource usage
docker stats

# Xem disk space của containers
docker system df

# Clean up unused images/containers/volumes
docker system prune -a

# View container IP
docker-compose exec backend hostname -I

# Restart specific service
docker-compose restart backend

# View network
docker network inspect ec312-network
```

---

## 🐛 Troubleshooting

### Backend không start
```bash
docker-compose logs backend

# Kiểm tra port 3001 đã được dùng?
lsof -i :3001
```

### Frontend không load backend
- Kiểm tra `NEXT_PUBLIC_API_URL` đúng chưa
- Trong docker: `http://backend:3001` (container name)
- Ngoài docker: `http://localhost:3001` hoặc `https://yourdomain.com/api`

### Rebuild sau thay đổi code
```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Upload file không lưu được
```bash
# Kiểm tra volumes
docker-compose exec backend ls -la uploads/

# Check permissions
docker-compose exec backend chmod 755 uploads/
```

### Database connection error
- Verifyf Supabase credentials đúng
- Kiểm tra Supabase project online
- Xem logs: `docker-compose logs backend | grep -i supabase`

---

## ✅ Production Checklist

- [ ] Thay đổi tất cả credentials sang production values
- [ ] Setup SSL/HTTPS với certbot
- [ ] Cấu hình Nginx reverse proxy
- [ ] Setup firewall (UFW)
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```
- [ ] Setup automated backups cho uploaded files
- [ ] Monitor logs thường xuyên
- [ ] Test disaster recovery

---

## 🔒 Security Tips

1. **Credentials**: Luôn sử dụng `.env.production` với values thực
2. **Firewall**: Chỉ mở port 80, 443, 22 (SSH)
3. **SSH Keys**: Sử dụng SSH keys thay vì passwords
4. **SSL**: Luôn enable HTTPS
5. **Backups**: Backup uploads folder định kỳ
6. **Logs**: Monitor logs cho errors/attacks

---

## 📞 Support

Nếu gặp vấn đề:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Test connectivity: `curl http://localhost:3001`
4. Rebuild: `docker-compose build --no-cache && docker-compose up -d`

---

Happy deploying! 🚀
