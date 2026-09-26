# Frontend Jaguar V1.8 — suporte ao aplicativo Android

## O que foi acrescentado
- aba **Aplicativo**;
- instruções de instalação de APK privado;
- `/api/mobile/jaguar/*` para o aplicativo usar Bearer sem expor n8n diretamente;
- upload autenticado de fotos do estoque;
- entrega das fotos;
- QR PIX para o PDF mobile;
- download/redirect do APK.

## EasyPanel
Mantenha:
```text
NIXPACKS_NODE_VERSION=22
NIXPACKS_BUN_VERSION=1.3.0
PORT=8003
JAGUAR_N8N_WEBHOOK_BASE_URL=https://n8n.facilities-ai.com.br/webhook
```

Adicione:
```text
JAGUAR_UPLOAD_DIR=/data/jaguar/uploads
JAGUAR_ANDROID_APK_PATH=/data/jaguar/releases/jaguar-radiadores.apk
JAGUAR_ANDROID_APP_VERSION=1.0.0
```

Crie/mapeie um volume persistente no serviço para:
```text
/data/jaguar
```
Isso é necessário principalmente para as fotos dos produtos.

Se preferir hospedar o APK fora do container, defina também `JAGUAR_ANDROID_APK_URL`. Quando ela existe, `/api/mobile/apk` redireciona para essa URL.

## Backend
Não há novo workflow n8n obrigatório para a V1.0 mobile. O aplicativo reaproveita os endpoints Jaguar já implantados.
