# -------------------------
# HTTP → HTTPS Redirects
# -------------------------
server {
  listen 80;
   server_name lskinessentials.online www.lskinessentials.online;
    return 301 https://$host$request_uri;
}

server {
    listen 80;
    server_name smetemplate.xyz www.smetemplate.xyz;
    return 301 https://$host$request_uri;
}

# =======================================
# 1) lskinessentials.com over HTTPS
# =======================================
server {
    listen 443 ssl;
    server_name lskinessentials.com www.lskinessentials.com;

    # SSL certificates for lskinessentials.com
    ssl_certificate     /etc/letsencrypt/live/lskinessentials.com/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/lskinessentials.com/privkey.pem;

    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Proxy all traffic for lskinessentials.com to Docker containers on localhost

    # 1A) Frontend (client) – typically routes everything except /api
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 1B) Backend (API)
    location /api/ {
        proxy_pass http://localhost:3011;
        proxy_http_version 1.1;

        # Websocket headers (if needed)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}

# =======================================
# 2) smetemplate.xyz over HTTPS
# =======================================
server {
    listen 443 ssl;
    server_name smetemplate.xyz www.smetemplate.xyz;

   # SSL certificates for smetemplate.xyz
    ssl_certificate     /etc/letsencrypt/live/smetemplate.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/smetemplate.xyz/privkey.pem;

    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

     Proxy all traffic for smetemplate.xyz to Docker containers on localhost

    location / {
        proxy_pass http://localhost:8080;
       proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

 
   location /api/ {
        proxy_pass http://localhost:3011;
        proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}