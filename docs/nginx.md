```nginx
server {
    listen 80;
    server_name dein-server-name.local; # oder IP oder localhost

    # --------------------------------------------------------
    # 1. ANGULAR FRONTEND (Statische Dateien)
    # --------------------------------------------------------
    root /var/www/crow-gallery/browser; # PFAD ANPASSEN (Wo dein 'ng build' Output liegt)
    index index.html;

    location / {
        # Wichtig für Angular Routing: Wenn Datei nicht existiert -> index.html
        try_files $uri $uri/ /index.html;
    }

    # --------------------------------------------------------
    # 2. BILDER / MEDIEN (High Performance Delivery)
    # --------------------------------------------------------
    location /media/ {
        # 'alias' mappt die URL /media/ auf deinen echten Ordner
        alias /home/dein-user/Photos/; # PFAD ANPASSEN (Wo deine Bilder liegen)

        # Performance Tuning
        expires 30d;           # Browser Caching aktivieren
        access_log off;        # Logs nicht zumüllen
        add_header Cache-Control "public";
    }

    # --------------------------------------------------------
    # 3. C++ BACKEND (Reverse Proxy)
    # --------------------------------------------------------
    # Wir gruppieren alle API-relevanten Routen
    location ~ ^/(api|login|logout|upload) {
        proxy_pass http://127.0.0.1:8080; # Weiterleitung an C++

        # Wichtig: Header weiterreichen
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Upload Limit erhöhen (Wichtig!)
        client_max_body_size 50M;
    }
}
```
