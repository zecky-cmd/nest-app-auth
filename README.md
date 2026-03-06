## API d’authentification – NestJS / PostgreSQL / Prisma

### 1. Aperçu

API backend d’authentification et de gestion des utilisateurs, construite avec **NestJS**, **TypeScript**, **Prisma** et **PostgreSQL**.

Elle fournit :

- **Auth classique** : inscription / connexion via email + mot de passe
- **JWT** : login, guard, strategy, route `/me`
- **Gestion des utilisateurs** : CRUD complet
- **Changement de mot de passe** (connecté, avec ancien mot de passe)
- **Mot de passe oublié** avec code de réinitialisation stocké en base
- Mesures de sécurité globales : **Helmet**, **CORS**, **rate limiting**, **ValidationPipe**, préfixe `/api`

---

### 2. Stack technique

- **Langage** : TypeScript  
- **Framework** : NestJS 11  
- **Base de données** : PostgreSQL  
- **ORM / Client DB** : Prisma  
- **Auth** : JWT (`@nestjs/jwt`, `passport-jwt`)  
- **Hashage** : bcrypt  
- **Sécurité HTTP** : Helmet, CORS, rate limiting (`@nestjs/throttler`)  

---

### 3. Installation & configuration

#### 3.1. Pré‑requis

- Node.js (version LTS recommandée)
- PostgreSQL installé et accessible
- `npm` ou `yarn`

#### 3.2. Cloner le projet

```bash
git clone <URL_DU_REPO>
cd backend/app-auth
npm install
```

#### 3.3. Variables d’environnement

Créer un fichier `.env` à la racine du projet en s’inspirant de `.env.example` :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/app_auth?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/app_auth"

JWT_SECRET="changez-moi-en-production-minimum-32-caracteres"

PORT=3000
```

#### 3.4. Migrations & client Prisma

```bash
npx prisma migrate dev
npx prisma generate
```

---

### 4. Lancement de l’application

#### Mode développement

```bash
npm run start:dev
```

L’API est disponible sur :

- `http://localhost:3000/api`

---

### 5. Modèle de données (simplifié)

#### 5.1. Utilisateur

- `id` : Int (PK, auto‑incrément)
- `name` : String
- `email` : String (unique)
- `role` : String (`USER` ou `ADMIN`)
- `password` : String (hashé avec bcrypt)
- `createdAt` : DateTime
- `updatedAt` : DateTime

#### 5.2. Token de réinitialisation de mot de passe

- `id` : Int (PK)
- `userId` : Int (FK vers `User`)
- `code` : String (code de réinitialisation, ex. 6 chiffres)
- `createdAt` : DateTime
- `expiresAt` : DateTime (date d’expiration)
- `usedAt` : DateTime? (null tant que le code n’a pas été utilisé)

---

### 6. Sécurité globale

Configuration dans `main.ts` et `app.module.ts` :

- **Helmet** : sécurisation des headers HTTP
- **CORS** : activé sur l’API
- **Prefix global** : toutes les routes sont préfixées par `/api`
- **ValidationPipe globale** :
  - `whitelist: true` → ignore les champs non définis dans les DTO
  - `forbidNonWhitelisted: true` → rejette si champs en trop
  - `transform: true` → transforme les types (ex : string → number)
- **Rate limiting** (`ThrottlerModule`) :
  - `ttl: 60000` (1 minute)
  - `limit: 100` requêtes / minute / IP
  - Guard global `ThrottlerGuard`

---

### 7. Endpoints principaux

Toutes les routes sont préfixées par `/api`.

#### 7.1. Authentification (`/api/auth`)

##### 7.1.1. Inscription

- **POST** `/api/auth/register`
- **Body JSON** :

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "MotDePasse123!",
  "role": "USER"
}
```

- **Réponse** :

```json
{
  "access_token": "<jwt>",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

##### 7.1.2. Connexion

- **POST** `/api/auth/login`
- **Body JSON** :

```json
{
  "email": "john@example.com",
  "password": "MotDePasse123!"
}
```

- **Réponse** : même format que `register`.

##### 7.1.3. Profil de l’utilisateur connecté

- **GET** `/api/auth/me`
- **Headers** :

```http
Authorization: Bearer <jwt>
```

- **Réponse** :

```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Le champ `password` n’est jamais renvoyé.

---

#### 7.2. Changement de mot de passe (connecté)

##### 7.2.1. Changer son mot de passe

- **PATCH** `/api/auth/change-password`
- **Protégé (JWT)** :

```http
Authorization: Bearer <jwt>
```

- **Body** :

```json
{
  "oldPassword": "AncienMotDePasse123",
  "newPassword": "NouveauMotDePasse456"
}
```

- **Comportement** :
  - Récupère l’utilisateur via le JWT (`JwtAuthGuard` + `JwtStrategy`)
  - Vérifie `oldPassword` avec le hash en base
  - Met à jour le mot de passe (rehash bcrypt)
- **Réponse** : `204 No Content` si OK

---

#### 7.3. Mot de passe oublié / réinitialisation

##### 7.3.1. Demander un code de réinitialisation

- **POST** `/api/auth/forgot-password`
- **Body** :

```json
{
  "email": "john@example.com"
}
```

- **Comportement** :
  - Si l’email existe :
    - Génère un code (ex : 6 chiffres)
    - Crée un `PasswordResetToken` en base
    - (En dev) log le code dans la console
    - (En prod) à intégrer avec un service d’email
  - Si l’email n’existe pas :
    - Ne révèle rien (retourne quand même `204`)
- **Réponse** : `204 No Content`

##### 7.3.2. Réinitialiser le mot de passe avec le code

- **POST** `/api/auth/reset-password`
- **Body** :

```json
{
  "code": "123456",
  "newPassword": "NouveauMotDePasse456"
}
```

- **Comportement** :
  - Cherche un `PasswordResetToken` valide :
    - bon `code`
    - `usedAt` null
    - `expiresAt` > maintenant
  - Si introuvable : `404 Code de réinitialisation invalide ou expiré`
  - Sinon :
    - Met à jour le mot de passe de l’utilisateur (hashé)
    - Marque le token comme utilisé (`usedAt` défini)
- **Réponse** : `204 No Content`

---

### 8. Gestion des utilisateurs (`/api/users`)

> À sécuriser avec `JwtAuthGuard` et éventuellement des guards par rôle selon les besoins métier.

#### 8.1. Créer un utilisateur

- **POST** `/api/users`
- **Body** :

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "MotDePasse123!",
  "role": "USER"
}
```

Le mot de passe est hashé avant sauvegarde.

#### 8.2. Lister les utilisateurs

- **GET** `/api/users`
- **Query param optionnel** : `role` (`USER` ou `ADMIN`) :

```http
GET /api/users?role=ADMIN
```

#### 8.3. Détails d’un utilisateur

- **GET** `/api/users/:id`

#### 8.4. Mettre à jour un utilisateur

- **PUT** `/api/users/:id`
- **Body** : sous‑ensemble de `CreateUserDto` (incluant éventuellement un nouveau `password` qui sera re‑hashé).

#### 8.5. Supprimer un utilisateur

- **DELETE** `/api/users/:id`

---

### 9. Scénarios de test (Postman)

1. **Inscription** : `POST /api/auth/register`
2. **Connexion** : `POST /api/auth/login` → récupérer `access_token`
3. **Profil** : `GET /api/auth/me` (header `Authorization: Bearer <token>`)
4. **Changer mot de passe** : `PATCH /api/auth/change-password` (JWT + anciens/nouveaux mots de passe)
5. **Mot de passe oublié** :
   - `POST /api/auth/forgot-password` (email)
   - Récupérer le code dans les logs (en dev)
   - `POST /api/auth/reset-password` (code + `newPassword`)

---

### 10. Évolutions possibles

- Ajout d’authentification **OAuth2** (Google, GitHub…) via `passport-*`
- Rôles et permissions plus fines (guards par rôle)
- Intégration d’un **service d’email** (SendGrid, Mailgun, SMTP…) pour envoyer réellement les codes de réinitialisation
- Ajout de tests unitaires et e2e dédiés à l’authentification

