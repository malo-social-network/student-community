# Projet Communautaire pour Étudiants

## Structure du Projet

Le projet est divisé en deux parties principales :
- `backend` : Contient l'API et la logique côté serveur
- `frontend` : Contient l'interface utilisateur React

## Prérequis

- Docker et Docker Compose
- Node.js (pour le développement local)
- MySQL (pour le développement local)

## Installation et Configuration avec Docker

1. Assurez-vous que Docker et Docker Compose sont installés sur votre machine.

2. Clonez le dépôt du projet :
   ```
   git clone https://github.com/malo-social-network/student-community.git
   cd student-community
   ```

3. Créez un fichier `.env` à la racine du projet avec le contenu suivant :
   ```
   DB_HOST=database
   DB_USER=<your_user>
   DB_PASSWORD=<your_password>
   DB_NAME=student_community
   JWT_SECRET=<your_secret_jwt>
   ```

4. Construisez et lancez les conteneurs Docker :
   ```
   docker-compose up --build
   ```

5. L'application sera accessible aux adresses suivantes :
   - Frontend : http://localhost:80
   - Backend API : http://localhost:5000
   - Base de données MySQL : localhost:3306

## Installation et Configuration pour le Développement Local

### Backend

1. Naviguez vers le dossier `cd backend`
2. Installez les dépendances :
   ```
   npm i
   ```
3. Créez un fichier `.env` dans le dossier `backend` avec le contenu suivant :
   ```
   DB_HOST=localhost
   DB_USER=votre_user
   DB_PASSWORD=mot_de_passe
   DB_NAME=student_community
   JWT_SECRET=votre_secret_jwt
   ```
   Remplacez les valeurs par celles correspondant à votre configuration.

4. Lancez le serveur backend :
   ```
   npm start
   ```

### Frontend

1. Naviguez vers le dossier `cd frontend`
2. Installez les dépendances :
   ```
   npm i
   ```
3. Lancez l'application frontend :
   ```
   npm start
   ```

## Accès à l'Application en Développement Local

Une fois que le backend et le frontend sont lancés, vous pouvez accéder à l'application :

- Frontend : http://localhost:3000
- Backend API : http://localhost:5000
- Base de données MySQL : localhost:3306

## Tests

Des tests unitaires, des tests end-to-end et des tests de performance sont inclus dans le projet. Pour exécuter ces tests, utilisez les commandes appropriées dans les dossiers backend et frontend.
